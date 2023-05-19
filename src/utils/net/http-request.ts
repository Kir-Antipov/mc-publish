import { FormData, isFormData, toFormData } from "./form-data";
import { Headers, inferHttpRequestBodyHeaders, setDefaultHeaders, setHeader } from "./headers";
import { HttpMethod, isGetHttpMethod } from "./http-method";
import { HttpRequestBody, isHttpRequestBody } from "./http-request-body";
import { QueryString, isURLSearchParams } from "./query-string";

/**
 * Represents an HTTP request configuration.
 */
export interface HttpRequest {
    /**
     * The request body to be sent.
     */
    body?: HttpRequestBody;

    /**
     * The request headers.
     */
    headers?: Headers;

    /**
     * The HTTP method for the request.
     */
    method?: HttpMethod;

    /**
     * The redirect mode to use for the request.
     */
    redirect?: RequestRedirect;

    /**
     * An `AbortSignal` to control request cancellation.
     */
    signal?: AbortSignal;

    /**
     * The request referrer.
     */
    referrer?: string;

    /**
     * The referrer policy to use for the request.
     */
    referrerPolicy?: ReferrerPolicy;
}

/**
 * Represents an HTTP request configuration.
 */
export class HttpRequest {
    /**
     * Private constructor to prevent instantiation.
     */
    private constructor() {
        // NO OP
    }

    /**
     * Creates a new `HttpRequestBuilder` instance for a GET request.
     *
     * @param options - The optional request configuration.
     *
     * @returns The newly created `HttpRequestBuilder` instance.
     */
    static get(options?: HttpRequest): HttpRequestBuilder {
        return new HttpRequestBuilder("GET", options);
    }

    /**
     * Creates a new `HttpRequestBuilder` instance for a POST request.
     *
     * @param options - The optional request configuration.
     *
     * @returns The newly created `HttpRequestBuilder` instance.
     */
    static post(options?: HttpRequest): HttpRequestBuilder {
        return new HttpRequestBuilder("POST", options);
    }

    /**
     * Creates a new `HttpRequestBuilder` instance for a PATCH request.
     *
     * @param options - The optional request configuration.
     *
     * @returns The newly created `HttpRequestBuilder` instance.
     */
    static patch(options?: HttpRequest): HttpRequestBuilder {
        return new HttpRequestBuilder("PATCH", options);
    }

    /**
     * Creates a new `HttpRequestBuilder` instance for a PUT request.
     *
     * @param options - The optional request configuration.
     *
     * @returns The newly created `HttpRequestBuilder` instance.
     */
    static put(options?: HttpRequest): HttpRequestBuilder {
        return new HttpRequestBuilder("PUT", options);
    }

    /**
     * Creates a new `HttpRequestBuilder` instance for a DELETE request.
     *
     * @param options - The optional request configuration.
     *
     * @returns The newly created `HttpRequestBuilder` instance.
     */
    static delete(options?: HttpRequest): HttpRequestBuilder {
        return new HttpRequestBuilder("DELETE", options);
    }
}

/**
 * Class to build and configure HTTP requests.
 */
class HttpRequestBuilder implements HttpRequest {
    /**
     * @inheritdoc
     */
    method: HttpMethod;

    /**
     * @inheritdoc
     */
    body?: HttpRequestBody;

    /**
     * @inheritdoc
     */
    headers?: Headers;

    /**
     * @inheritdoc
     */
    redirect?: RequestRedirect;

    /**
     * @inheritdoc
     */
    signal?: AbortSignal;

    /**
     * @inheritdoc
     */
    referrer?: string;

    /**
     * @inheritdoc
     */
    referrerPolicy?: ReferrerPolicy;

    /**
     * Constructs a new `HttpRequestBuilder` instance.
     *
     * @param method - The HTTP method for the request.
     * @param options - The optional request configuration.
     */
    constructor(method: HttpMethod, options?: HttpRequest) {
        Object.assign(this, options);
        this.method = method;
    }

    /**
     * Sets the request data based on the request method.
     *
     * If the request method is a GET request, the data is set as URL parameters.
     * For non-GET requests, the data is set as the request body in a suitable format (`FormData`, for example).
     *
     * If the provided data is a string and the request method is GET, the data will be set as
     * URL parameters. For non-GET requests, the data will be set as a plain text request body.
     *
     * If the provided data is an iterable or a record, and the request method is GET, the data
     * will be converted into URL parameters. For non-GET requests, the data will be converted
     * into a `FormData` object.
     *
     * @param data - The data to be sent with the request.
     *
     * @returns The current `HttpRequestBuilder` instance.
     */
    with(data: HttpRequestBody | Iterable<[unknown, unknown]> | unknown): this {
        if (typeof data === "string") {
            return isGetHttpMethod(this.method) ? this.urlParams(data) : this.text(data);
        }

        if (data === undefined || data === null || isHttpRequestBody(data)) {
            this.body = data as HttpRequestBody ?? undefined;
            const bodyHeaders = inferHttpRequestBodyHeaders(this.body);
            this.headers = setDefaultHeaders(this.headers, bodyHeaders);
            return this;
        }

        return isGetHttpMethod(this.method) ? this.urlParams(data) : this.formData(data);
    }

    /**
     * Sets the request URL parameters.
     *
     * @param params - The URL parameters.
     *
     * @returns The current `HttpRequestBuilder` instance.
     */
    urlParams(params: URLSearchParams | string | Iterable<[unknown, unknown]> | unknown): this {
        if (!isURLSearchParams(params)) {
            params = new QueryString(params as Record<PropertyKey, unknown>);
        }

        this.body = params as URLSearchParams;
        return this;
    }

    /**
     * Sets the request body as a `FormData` object.
     *
     * @param data - The `FormData` content.
     *
     * @returns The current `HttpRequestBuilder` instance.
     */
    formData(data: FormData | Iterable<[unknown, unknown]> | unknown): this {
        if (!isFormData(data)) {
            data = toFormData(data);
        }

        this.body = data as FormData;
        return this;
    }

    /**
     * Sets the request body as a JSON string.
     *
     * @param json - The JSON string to be sent as the request body.
     *
     * @returns The current `HttpRequestBuilder` instance.
     */
    json(json: string): this;

    /**
     * Sets the request body as a JSON string.
     *
     * @param obj - The JSON object to be serialized and sent as the request body.
     *
     * @returns The current `HttpRequestBuilder` instance.
     */
    json(obj: unknown): this;

    /**
     * Sets the request body as a JSON string.
     *
     * @param obj - The JSON object or string to be sent as the request body.
     *
     * @returns The current `HttpRequestBuilder` instance.
     */
    json(obj: unknown): this {
        const serialized = typeof obj === "string" ? obj : JSON.stringify(obj);

        this.body = serialized;
        this.headers = setHeader(this.headers, "Content-Type", "application/json");

        return this;
    }

    /**
     * Sets the request body as a plain text string.
     *
     * @param text - The text to be sent as the request body.
     *
     * @returns The current `HttpRequestBuilder` instance.
     */
    text(text: string): this {
        this.body = text;
        this.headers = setHeader(this.headers, "Content-Type", "text/plain");

        return this;
    }

    /**
     * Sets an `AbortSignal` to cancel the request.
     *
     * @param signal - The `AbortSignal` to cancel the request.
     *
     * @returns The current `HttpRequestBuilder` instance.
     */
    abort(signal: AbortSignal): this {
        this.signal = signal;
        return this;
    }

    /**
     * Sets a timeout for the request.
     *
     * @param ms - The timeout duration in milliseconds.
     *
     * @returns The current `HttpRequestBuilder` instance.
     */
    timeout(ms: number): this {
        return this.abort(AbortSignal.timeout(ms));
    }

    /**
     * Sets a single request header.
     *
     * @param header - The header name.
     * @param value - The header value.
     *
     * @returns The current `HttpRequestBuilder` instance.
     */
    header(header: string, value: string): this {
        this.headers = setHeader(this.headers, header, value);
        return this;
    }
}

/**
 * The redirect mode to use for HTTP requests.
 */
type RequestRedirect = "error" | "follow" | "manual";

/**
 * The referrer policy to use for HTTP requests.
 */
type ReferrerPolicy = "" | "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
