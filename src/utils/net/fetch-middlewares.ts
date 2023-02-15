import { ArrayMap } from "@/utils/collections";
import { EqualityComparer } from "@/utils/comparison";
import { HttpError } from "@/utils/errors";
import { Middleware } from "@/utils/functions";
import { asString } from "@/utils/string-utils";
import { Fetch } from "./fetch";
import { httpMethodEquals } from "./http-method";
import { HttpRequest } from "./http-request";
import { HttpResponse } from "./http-response";

/**
 * Options for configuring the `defaultResponse` middleware.
 */
interface DefaultResponseOptions {
    /**
     * A filter function to determine whether a default response
     * should be provided instead of the original one.
     *
     * By default, this function returns `true` for responses with a `404` status.
     */
    filter?: (response: HttpResponse) => boolean;

    /**
     * A factory function to create a custom `HttpResponse` instead of filtered responses.
     *
     * By default, this function returns an empty `HttpResponse` with the original status.
     */
    response?: (response: HttpResponse) => HttpResponse;
}

/**
 * Creates a middleware function that provides a default response to
 * HTTP requests based on the provided options.
 *
 * The default behavior is to apply a default response when the HTTP response status is `404`.
 *
 * @param options - Configuration options for the default response behavior.
 *
 * @returns A middleware function that applies the default response logic.
 */
export function defaultResponse(options?: DefaultResponseOptions): Middleware<Fetch> {
    const {
        filter = (r: HttpResponse) => r.status === 404,
        response: responseFactory = (r: HttpResponse) => HttpResponse.text("", r),
    } = options || {};

    return async (url, options, next) => {
        const response = await next(url, options);
        if (filter(response)) {
            return responseFactory(response);
        }

        return response;
    };
}

/**
 * Options for configuring the `throwOnError` middleware.
 *
 * The default behavior is to throw an error when the HTTP response has a non-ok (not 2xx) status.
 */
interface ThrowOnErrorOptions {
    /**
     * A filter function to determine whether an error should be thrown for a given response.
     *
     * By default, this function returns `true` for non-ok (not 2xx) responses.
     */
    filter?: (response: HttpResponse) => boolean;

    /**
     * An `Error` instance or a factory function to create an `Error` for filtered responses.
     *
     * By default, this function creates {@link HttpError} instances.
     */
    error?: Error | ((response: HttpResponse) => Error | Promise<Error>);
}

/**
 * Middleware that throws an error for certain HTTP responses based on the provided options.
 *
 * The default behavior is to throw an error when the HTTP response has a non-ok (not 2xx) status.
 *
 * @param options - Configuration options for the error throwing behavior.
 *
 * @returns A middleware function that applies the error throwing logic.
 */
export function throwOnError(options?: ThrowOnErrorOptions): Middleware<Fetch> {
    const {
        filter = (r: HttpResponse) => !r.ok,
        error = HttpError.fromResponse,
    } = options || {};

    return async (url, options, next) => {
        const response = await next(url, options);
        if (filter(response)) {
            const errorInstance = typeof error === "function" ? (await error(response)) : error;
            throw errorInstance;
        }

        return response;
    };
}

/**
 * Options for configuring the `simpleCache` middleware.
 */
interface SimpleCacheOptions {
    /**
     * A filter function to determine whether a request should be cached or not.
     *
     * @param url - The URL of the request.
     * @param request - The HTTP request data.
     *
     * @returns A boolean indicating whether the request should be cached.
     */
    filter?: (url: string | URL, request?: HttpRequest) => boolean;

    /**
     * A custom comparer function to compare HttpCacheKey objects for equality.
     */
    comparer?: EqualityComparer<HttpCacheKey>;
}

/**
 * Represents an HTTP cache key, consisting of a URL and an optional HttpRequest.
 */
type HttpCacheKey = [url: string | URL, request?: HttpRequest];

/**
 * The default cache filter function.
 *
 * It checks if the URL has a "cache" query parameter.
 * If the "cache" parameter is present without a value or with a value of "true" (case-insensitive),
 * the request will be cached. Otherwise, the request will not be cached.
 */
const DEFAULT_CACHE_FILTER = (url: string | URL) =>
    typeof url === "string" ? url.includes("cache=true") : (url.searchParams.get("cache") === "true");

/**
 * The default cache key comparer function.
 *
 * It checks if the URL and HTTP method of the two requests are equal.
 * If they are equal, the response will be retrieved from the cache.
 * Otherwise, the response will not be retrieved from the cache.
 */
const DEFAULT_CACHE_COMPARER = (left: HttpCacheKey, right: HttpCacheKey) => {
    return httpMethodEquals(left[1]?.method, right[1]?.method) && asString(left[0]) === asString(right[0]);
};

/**
 * Creates a simple cache middleware for caching HTTP responses.
 *
 * The middleware intercepts requests and caches their responses based on the provided filter and comparer functions.
 *
 * By default, it caches requests with a "cache" query parameter set to "true" or an empty value
 * based on their URL and HTTP method.
 *
 * @param options - Configuration options for caching behavior.
 *
 * @returns A middleware function that enables response caching.
 */
export function simpleCache(options?: SimpleCacheOptions): Middleware<Fetch> {
    const {
        filter = DEFAULT_CACHE_FILTER,
        comparer = DEFAULT_CACHE_COMPARER,
    } = options || {};

    const cache = new ArrayMap<HttpCacheKey, HttpResponse>(comparer);
    return async (url, request, next) => {
        if (!filter(url, request)) {
            return await next(url, request);
        }

        const cacheKey = [url, request] as HttpCacheKey;
        const cachedResponse = cache.get(cacheKey);
        if (cachedResponse) {
            return cachedResponse;
        }

        const response = HttpResponse.cache(await next(url, request));
        cache.set(cacheKey, response);
        return response;
    };
}
