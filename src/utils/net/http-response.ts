import { ArgumentNullError } from "@/utils/errors";
import { asString } from "@/utils/string-utils";
import { Blob } from "./blob";
import { FormData } from "./form-data";
import { Headers } from "./headers";

/* eslint-disable-next-line no-restricted-imports */
import { Headers as NodeFetchHeaders, Response } from "node-fetch";

/**
 * Represents the response to an HTTP request.
 */
export interface HttpResponse {
    /**
     * The response body as a readable stream.
     */
    get body(): NodeJS.ReadableStream | undefined;

    /**
     * Indicates if the body has been used.
     */
    get bodyUsed(): boolean;

    /**
     * The headers of the response.
     */
    get headers(): Headers;

    /**
     * Indicates if the request was successful.
     */
    get ok(): boolean;

    /**
     * Indicates if the request was redirected.
     */
    get redirected(): boolean;

    /**
     * The status code of the response.
     */
    get status(): number;

    /**
     * The status text of the response.
     */
    get statusText(): string;

    /**
     * The type of the response.
     */
    get type(): HttpResponseType;

    /**
     * The URL of the response.
     */
    get url(): string;

    /**
     * Creates a clone of the response object.
     */
    clone(): this;

    /**
     * Returns the response body as an ArrayBuffer.
     */
    arrayBuffer(): Promise<ArrayBuffer>;

    /**
     * Returns the response body as a Blob.
     */
    blob(): Promise<Blob>;

    /**
     * Returns the response body as FormData.
     */
    formData(): Promise<FormData>;

    /**
     * Parses the response body as JSON and returns the resulting object.
     *
     * @template T - The expected type of the resulting JSON object.
     *
     * @returns A Promise that resolves to the parsed JSON object of type `T`.
     */
    json<T>(): Promise<T>;

    /**
     * Returns the response body as a string.
     */
    text(): Promise<string>;
}

/**
 * Represents the response to an HTTP request.
 */
export class HttpResponse {
    /**
     * Private constructor to prevent instantiation.
     */
    private constructor() {
        // NO OP
    }

    /**
     * Creates a cached HTTP response from the given response.
     *
     * @param response - The HTTP response to be cached.
     *
     * @returns A cached version of the given HTTP response.
     */
    static cache(response: HttpResponse): HttpResponse {
        return response instanceof CachedHttpResponse ? response : new CachedHttpResponse(response);
    }

    /**
     * Creates a new {@link HttpResponse} with a `Blob` body.
     *
     * @param blob - The `Blob` instance to be used as the response body.
     * @param options - Options to configure the response.
     *
     * @returns The newly created {@link HttpResponse} instance.
     */
    static blob(blob: Blob, options?: HttpResponseOptions): HttpResponse {
        return HttpResponse.content(blob, "application/octet-stream", options);
    }

    /**
     * Creates a new {@link HttpResponse} with a `FormData` body.
     *
     * @param formData - The `FormData` instance to be used as the response body.
     * @param options - Options to configure the response.
     *
     * @returns The newly created {@link HttpResponse} instance.
     */
    static formData(formData: FormData, options?: HttpResponseOptions): HttpResponse {
        // Response constructor will automatically set the "Content-Type" header.
        return HttpResponse.content(formData, undefined, options);
    }

    /**
     * Creates a new {@link HttpResponse} with a JSON body.
     *
     * @param data - The data to be serialized as JSON and used as the response body.
     * @param options - Options to configure the response.
     *
     * @returns The newly created {@link HttpResponse} instance.
     */
    static json(data: unknown, options?: HttpResponseOptions): HttpResponse {
        const serialized = typeof data === "string" ? data : JSON.stringify(data);

        return HttpResponse.content(serialized, "application/json", options);
    }

    /**
     * Creates a new {@link HttpResponse} with a text body.
     *
     * @param text - The text to be used as the response body.
     * @param options - Options to configure the response.
     *
     * @returns The newly created {@link HttpResponse} instance.
     */
    static text(text: string, options?: HttpResponseOptions): HttpResponse {
        return HttpResponse.content(asString(text), "text/plain", options);
    }

    /**
     * Creates a new {@link HttpResponse} with a redirection status.
     *
     * @param url - The URL to redirect to.
     * @param options - Options to configure the response.
     *
     * @returns The newly created {@link HttpResponse} instance.
     */
    static redirect(url: string | URL, options?: HttpResponseOptions): HttpResponse {
        const headers = new NodeFetchHeaders(options?.headers);
        if (!headers.has("Location")) {
            headers.set("Location", asString(url));
        }

        const redirectOptions = {
            headers,
            status: options.status ?? 302,
            statusText: options.statusText ?? "Found",
        } as HttpResponseOptions;

        return new Response("", redirectOptions) as NodeFetchResponse;
    }

    /**
     * Creates a new {@link HttpResponse} representing an error.
     *
     * @returns The newly created {@link HttpResponse} instance.
     */
    static error(): HttpResponse {
        return Response.error() as NodeFetchResponse;
    }

    /**
     * Creates a new {@link HttpResponse} with the given content and content type.
     *
     * @param data - The data to be used as the response body.
     * @param contentType - The MIME type of the content.
     * @param options - Options to configure the response.
     *
     * @returns The newly created {@link HttpResponse} instance.
     */
    private static content(data: string | FormData | Blob, contentType?: string, options?: HttpResponseOptions): HttpResponse {
        ArgumentNullError.throwIfNull(data);

        const headers = new NodeFetchHeaders(options?.headers);
        if (contentType && !headers.has("Content-Type")) {
            headers.set("Content-Type", contentType);
        }

        return new Response(data, { status: options?.status, statusText: options?.statusText, headers }) as NodeFetchResponse;
    }
}

/**
 * Represents the options for an HTTP response.
 */
export interface HttpResponseOptions {
    /**
     * The headers for the response.
     */
    headers?: Headers;

    /**
     * The status code for the response.
     */
    status?: number;

    /**
     * The status text for the response.
     */
    statusText?: string;
}

/**
 * Represents the type of an HTTP response.
 */
export type HttpResponseType = "basic" | "cors" | "default" | "error" | "opaque" | "opaqueredirect";

/**
 * Represents a cached version of an HTTP response.
 */
class CachedHttpResponse implements HttpResponse {
    /**
     * The original HttpResponse instance.
     */
    private readonly _response: HttpResponse;

    /**
     * The cached Blob of the response body.
     */
    private _blob?: Blob;

    /**
     * The cached FormData of the response body.
     */
    private _formData?: FormData;

    /**
     * Creates a new {@link CachedHttpResponse} instance.
     *
     * @param response - The {@link HttpResponse} to be cached.
     */
    constructor(response: HttpResponse) {
        this._response = response;
    }

    /**
     * @inheritdoc
     */
    get body(): NodeJS.ReadableStream {
        if (this._blob) {
            return this._blob.stream() as unknown as NodeJS.ReadableStream;
        }

        if (!this._response.bodyUsed) {
            return this._response.body;
        }

        throw new Error("Cannot re-read the response body.");
    }

    /**
     * @inheritdoc
     */
    get bodyUsed(): boolean {
        return !this._blob && !this._formData && this._response.bodyUsed;
    }

    /**
     * @inheritdoc
     */
    get headers(): Headers {
        return this._response.headers;
    }

    /**
     * @inheritdoc
     */
    get ok(): boolean {
        return this._response.ok;
    }

    /**
     * @inheritdoc
     */
    get redirected(): boolean {
        return this._response.redirected;
    }

    /**
     * @inheritdoc
     */
    get status(): number {
        return this._response.status;
    }

    /**
     * @inheritdoc
     */
    get statusText(): string {
        return this._response.statusText;
    }

    /**
     * @inheritdoc
     */
    get type(): HttpResponseType {
        return this._response.type;
    }

    /**
     * @inheritdoc
     */
    get url(): string {
        return this._response.url;
    }

    /**
     * @inheritdoc
     */
    clone(): this {
        return this;
    }

    /**
     * @inheritdoc
     */
    async arrayBuffer(): Promise<ArrayBuffer> {
        const blob = await this.blob();
        return await blob.arrayBuffer();
    }

    /**
     * @inheritdoc
     */
    async blob(): Promise<Blob> {
        if (this._blob) {
            return this._blob;
        }

        if (!this._response.bodyUsed) {
            this._blob = await this._response.blob();
            return this._blob;
        }

        throw new TypeError("Cannot re-read the response as a Blob.");
    }

    /**
     * @inheritdoc
     */
    async formData(): Promise<FormData> {
        if (this._formData) {
            return this._formData;
        }

        if (!this._response.bodyUsed) {
            this._formData = await this._response.formData();
            return this._formData;
        }

        throw new TypeError("Cannot re-read the response as a FormData.");
    }

    /**
     * @inheritdoc
     */
    async json<T>(): Promise<T> {
        const text = await this.text();
        return JSON.parse(text);
    }

    /**
     * @inheritdoc
     */
    async text(): Promise<string> {
        const blob = await this.blob();
        return await blob.text();
    }
}

/**
 * An extension of the `Response` interface from `node-fetch` to fix the non-generic `json(): Promise<unknown>` declaration.
 *
 * This interface is used to make it compatible with the `HttpResponse` wrapper while still being able to identify
 * problems of other mismatches in type definitions between the `node-fetch`'s `Response` and the `HttpResponse` wrapper.
 */
interface NodeFetchResponse extends Response {
    /**
     * Parses the response body as JSON and returns the resulting object.
     *
     * @template T - The expected type of the resulting JSON object.
     *
     * @returns A Promise that resolves to the parsed JSON object of type `T`.
     */
    json<T>(): Promise<T>;

    /**
     * Creates a clone of the response object.
     */
    clone(): this;
}
