import { ACTION_NAME } from "@/action";
import { Middleware, MiddlewareHandler } from "@/utils/functions";
import { asString } from "@/utils/string-utils";
import { Headers, cloneHeaders, setDefaultHeaders } from "./headers";
import { HttpMethod, canHttpMethodAcceptBody, httpMethodEquals } from "./http-method";
import { HttpRequest } from "./http-request";
import { HttpResponse } from "./http-response";
import { isURLSearchParams } from "./query-string";

/* eslint-disable-next-line no-restricted-imports */
import nodeFetch from "node-fetch";

/**
 * Represents a fetch function that takes a URL and an optional request configuration,
 * and returns a promise resolving to an HTTP response.
 */
export interface Fetch {
    /**
     * Fetches a resource.
     *
     * @param url - The URL of the resource to fetch.
     * @param request - Optional configuration for the HTTP request.
     *
     * @returns A promise resolving to a {@link HttpResponse}.
     */
    (url: FetchUrl, request?: HttpRequest): Promise<HttpResponse>;
}

/**
 * Represents a configurable fetch function with additional properties
 * for customization, such as base URL and default headers.
 */
export interface ConfigurableFetch extends Fetch {
    /**
     * Optional base URL to prepend to relative URLs in requests.
     */
    baseUrl?: FetchUrl;

    /**
     * Optional default headers to include in every request.
     */
    defaultHeaders?: Headers;

    /**
     * Adds a middleware to the fetch pipeline.
     *
     * @param middleware - The middleware to add to the fetch pipeline.
     *
     * @returns The same instance of the {@link ConfigurableFetch}.
     */
    use(middleware: Middleware<Fetch>): ConfigurableFetch;
}

/**
 * Options to configure a new instance of a fetch function.
 */
export interface FetchOptions {
    /**
     * Optional custom fetch handler to use as the basis for the configurable fetch.
     */
    handler?: Fetch;

    /**
     * Optional base URL to prepend to relative URLs in requests.
     */
    baseUrl?: FetchUrl;

    /**
     * Optional default headers to include in every request.
     */
    defaultHeaders?: Headers;
}

/**
 * Represents a fetch URL, which can be either a string or a `URL` instance.
 */
type FetchUrl = string | URL;

/**
 * Default headers to be used in requests.
 */
const DEFAULT_HEADERS: Headers = {
    "User-Agent": `Kir-Antipov/${ACTION_NAME} (https://github.com/Kir-Antipov/${ACTION_NAME}/issues/new)`,
};

/**
 * The pre-configured instance of the {@link Fetch} function.
 */
export const fetch = createFetch({
    handler: nodeFetch as Fetch,
    defaultHeaders: DEFAULT_HEADERS,
});

/**
 * Creates a new instance of a configurable fetch function with the given options.
 *
 * @param options - Optional settings to configure the new fetch function.
 *
 * @returns A new instance of a {@link ConfigurableFetch} function.
 */
export function createFetch(options?: FetchOptions): ConfigurableFetch {
    const {
        handler = fetch,
        baseUrl,
        defaultHeaders,
    } = options || {};

    const fetchPipeline = new MiddlewareHandler(handler);
    const configurableFetch = ((url, request?) => {
        url = prepareUrl(configurableFetch, url, request);
        request = prepareRequest(configurableFetch, request);

        return fetchPipeline.execute(url, request);
    }) as ConfigurableFetch;

    configurableFetch.baseUrl = baseUrl || (handler as ConfigurableFetch).baseUrl;
    configurableFetch.defaultHeaders = setDefaultHeaders(cloneHeaders(defaultHeaders), (handler as ConfigurableFetch).defaultHeaders);
    Object.defineProperty(configurableFetch, "use", { value: (middleware: Middleware<Fetch>) => {
        fetchPipeline.use(middleware);
        return configurableFetch;
    } });

    return configurableFetch;
}

/**
 * Prepares a URL to be used in a fetch request.
 *
 * Resolves relative URLs.
 *
 * @param fetch - The {@link ConfigurableFetch} instance.
 * @param url - The URL to be prepared.
 *
 * @returns The prepared URL.
 */
function prepareUrl(fetch: ConfigurableFetch, url: FetchUrl, request?: HttpRequest): FetchUrl {
    // Resolve url
    if (fetch.baseUrl && typeof url === "string" && url.startsWith("/")) {
        // Wow. In order for `new URL(url, base)` to actually do its job,
        // we need this ugly mess to ensure that path doesn't start with "/",
        // and base url does end with "/".
        //
        // https://github.com/nodejs/node/issues/18288
        //
        // > So, we can't have a function that everybody needs all the time because of semantical correctness?
        //
        // Yeah, the way to go. Super-cool.
        const urlWithoutSlashOnItsStart = url.slice(1);
        const baseUrl = asString(fetch.baseUrl);
        const baseUrlWithSlashOnItsEnd = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

        url = new URL(urlWithoutSlashOnItsStart, baseUrlWithSlashOnItsEnd);
    }

    // Attach `URLSearchParams` to URL
    if (isURLSearchParams(request?.body) && !canHttpMethodAcceptBody(request?.method)) {
        if (typeof url === "string") {
            url = `${url}${url.includes("?") ? "&" : "?"}${request.body}`;
        } else {
            request.body.forEach((param, key) => (url as URL).searchParams.append(key, param));
        }
    }

    return url;
}

/**
 * Prepares an HTTP request with the default headers from a {@link ConfigurableFetch} instance.
 *
 * @param fetch - The {@link ConfigurableFetch} instance.
 * @param request - The optional {@link HttpRequest} to be prepared.
 *
 * @returns The prepared {@link HttpRequest} with default headers applied.
 */
function prepareRequest(fetch: ConfigurableFetch, request?: HttpRequest): HttpRequest {
    // Set default headers
    if (fetch.defaultHeaders) {
        request ||= {};
        request.headers = setDefaultHeaders(request.headers, fetch.defaultHeaders);
    }

    // Remove body from GET/HEAD requests
    if (request?.body && !canHttpMethodAcceptBody(request.method)) {
        delete request.body;
    }

    return request;
}

/**
 * Checks whether two fetch URLs have the same destination.
 *
 * @param left - The first fetch URL.
 * @param right - The second fetch URL.
 *
 * @returns A boolean indicating whether the destinations are the same.
 */
export function fetchDestinationEquals(left: FetchUrl, right: FetchUrl): boolean;

/**
 * Checks whether two fetch destinations (URL and `HttpRequest`) are the same.
 *
 * @param left - A tuple containing the first fetch URL and an `HttpRequest`.
 * @param right - A tuple containing the second fetch URL and an `HttpRequest`.
 *
 * @returns A boolean indicating whether the destinations are the same.
 */
export function fetchDestinationEquals(left: [FetchUrl, HttpRequest], right: [FetchUrl, HttpRequest]): boolean;

/**
 * Checks whether two fetch destinations (URL and `HttpMethod`) are the same.
 *
 * @param left - A tuple containing the first fetch URL and an `HttpMethod`.
 * @param right - A tuple containing the second fetch URL and an `HttpMethod`.
 *
 * @returns A boolean indicating whether the destinations are the same.
 */
export function fetchDestinationEquals(left: [FetchUrl, HttpMethod], right: [FetchUrl, HttpMethod]): boolean;

/**
 * Checks whether two fetch destinations (URLs) are equal.
 *
 * @param left - The first fetch URL or a tuple containing the URL and an `HttpRequest` or `HttpMethod`.
 * @param right - The second fetch URL or a tuple containing the URL and an `HttpRequest` or `HttpMethod`.
 *
 * @returns A boolean indicating whether the destinations are the same.
 */
export function fetchDestinationEquals(left: FetchUrl | [FetchUrl, HttpRequest | HttpMethod], right: FetchUrl | [FetchUrl, HttpRequest | HttpMethod]): boolean {
    const [leftUrl, leftMethod] = Array.isArray(left) ? [normalizeUrl(left[0]), normalizeHttpMethod(left[1])] : [normalizeUrl(left)];
    const [rightUrl, rightMethod] = Array.isArray(right) ? [normalizeUrl(right[0]), normalizeHttpMethod(right[1])] : [normalizeUrl(right)];

    return httpMethodEquals(leftMethod, rightMethod) && leftUrl === rightUrl;
}

/**
 * Normalizes a fetch URL, converting it to a string if necessary.
 *
 * @param url - The fetch URL to normalize.
 *
 * @returns A normalized string URL.
 */
function normalizeUrl(url: FetchUrl): string {
    const urlString = asString(url);
    const separatorIndex = urlString.indexOf("?");
    return separatorIndex >= 0 ? urlString.substring(0, separatorIndex) : urlString;
}

/**
 * Normalizes an HTTP method, extracting it from an `HttpRequest` if necessary.
 *
 * @param method - The `HttpMethod` or `HttpRequest` to normalize.
 *
 * @returns A normalized `HttpMethod`.
 */
function normalizeHttpMethod(method: HttpMethod | HttpRequest): HttpMethod {
    return typeof method === "string" ? method : method?.method;
}
