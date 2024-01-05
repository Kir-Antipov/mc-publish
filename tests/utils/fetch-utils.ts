import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { Fetch, HttpMethod, HttpRequest, HttpResponse, createFetch } from "@/utils/net";

type FetchInterceptorResponse = string | string[] | HttpResponse | unknown;

type FetchInterceptorHandler = (args: string[], request: HttpRequest, url: string) => FetchInterceptorResponse | Promise<FetchInterceptorResponse>;

type FetchInterceptor = {
    baseUrl?: string;

    requiredHeaders?: string[];
} & {
    [Method in HttpMethod]?: {
        [url: string]: FetchInterceptorHandler;
    };
};

const FAKE_FETCH: Fetch = (url, request) => Promise.reject(
    new Error(`Unsupported request: '${normalizeHttpMethod(request?.method)} ${url}'`)
);

function normalizeHttpMethod(method: string): HttpMethod {
    return (method?.toUpperCase() as HttpMethod) || "GET";
}

async function normalizeResponse(response: FetchInterceptorResponse): Promise<HttpResponse> {
    if (typeof response === "string") {
        return HttpResponse.text(response);
    }

    if (Array.isArray(response) && response.length && response.every(x => typeof x === "string")) {
        const path = resolve(...response);
        if (existsSync(path)) {
            const content = await readFile(path, "utf8");
            return HttpResponse.text(content);
        }
    }

    if (typeof response["url"] === "string" && typeof response["blob"] === "function") {
        return response as HttpResponse;
    }

    return HttpResponse.json(response);
}

export function createFakeFetch(interceptor: FetchInterceptor): Fetch {
    const baseUrl = interceptor.baseUrl?.endsWith("/") ? interceptor.baseUrl.slice(0, -1) : (interceptor.baseUrl || "");
    const requiredHeaders = interceptor.requiredHeaders || [];
    const methods = interceptor;

    return createFetch({ handler: FAKE_FETCH }).use(async (url, request, next) => {
        url = String(url);
        const urlPath = url.startsWith(baseUrl) ? url.substring(baseUrl.length) : url;

        const handlerEntry = Object.entries(methods[normalizeHttpMethod(request?.method)] || {})
            .map(([urlMatcher, handler]) => [urlPath.match(urlMatcher), handler] as const)
            .find(([match]) => match !== null);

        if (!handlerEntry || !requiredHeaders.every(header => request?.headers?.[header])) {
            return await next(url, request);
        }

        const args = handlerEntry[0].slice(1);
        const response = await handlerEntry[1](args, request, url);
        return await normalizeResponse(response);
    });
}

export function createCombinedFetch(...fetchComponents: Fetch[]): Fetch {
    const handlers = [...fetchComponents].reverse();

    return async (url, request) => {
        for (let i = handlers.length - 1; i >= 0; i--) {
            try {
                return await handlers[i](url, request);
            } catch (error: unknown) {
                if (i === 0) {
                    throw error;
                }
            }
        }

        return HttpResponse.error();
    };
}
