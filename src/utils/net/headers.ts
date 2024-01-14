import { asArray, asArrayLike, isIterable, isMap, isMultiMap } from "@/utils/collections";
import { statSync } from "node:fs";
import { Blob } from "./blob";
import { HttpRequestBody, isStreamableHttpRequestBody } from "./http-request-body";

/**
 * Represents HTTP headers collection.
 */
export type Headers = Record<string, string> | Iterable<Iterable<string>>;

/**
 * A separator used to concatenate multiple header values.
 */
const HEADER_SEPARATOR = ", ";

/**
 * Checks if a header exists in the given headers collection.
 *
 * @param headers - The headers collection.
 * @param header - The header to look for.
 *
 * @returns `true` if the header exists; otherwise, `false`.
 */
export function hasHeader(headers: Headers, header: string): boolean {
    return getHeader(headers, header) !== undefined;
}

/**
 * Retrieves the value of a header from the given headers collection.
 *
 * @param headers - The headers collection.
 * @param header - The header to look for.
 *
 * @returns The value of the header, or `undefined` if the header does not exist.
 */
export function getHeader(headers: Headers, header: string): string | undefined {
    if (!headers) {
        return undefined;
    }

    if (isMultiMap<string, string>(headers)) {
        const entries = headers.get(header);
        return typeof entries === "string" ? entries : entries ? asArrayLike(entries).join(HEADER_SEPARATOR) : undefined;
    }

    if (isMap<string, string>(headers)) {
        return headers.get(header);
    }

    if (isIterable<Iterable<string>>(headers)) {
        const arrayLikeHeaders = asArrayLike(headers);
        return arrayLikeHeaders.find(x => asArrayLike(x).at(0) === header)?.[1];
    }

    return headers[header];
}

/**
 * Appends a header value to the given headers collection.
 *
 * @param headers - The headers collection.
 * @param header - The header to append.
 * @param value - The value of the header to append.
 *
 * @returns The updated headers collection.
 */
export function appendHeader(headers: Headers, header: string, value: string): Headers {
    if (isMultiMap(headers)) {
        headers.append(header, value);
        return headers;
    }

    const currentValue = getHeader(headers, header);
    const concatenatedValue = currentValue ? `${currentValue}${HEADER_SEPARATOR}${value}` : value;
    return setHeader(headers, header, concatenatedValue);
}

/**
 * Appends multiple headers to the given headers collection.
 *
 * @param headers - The headers collection.
 * @param newHeaders - The headers to append.
 *
 * @returns The updated headers collection.
 */
export function appendHeaders(headers: Headers, newHeaders: Headers): Headers {
    return mergeHeaders(headers, newHeaders, appendHeader);
}

/**
 * Sets a header value in the given headers collection, overwriting any existing value.
 *
 * @param headers - The headers collection.
 * @param header - The header to set.
 * @param value - The value of the header to set.
 *
 * @returns The updated headers collection.
 */
export function setHeader(headers: Headers, header: string, value: string): Headers {
    if (value === undefined || value === null) {
        return deleteHeader(headers, header);
    }

    if (isMap(headers)) {
        headers.set(header, value);
        return headers;
    }

    if (isIterable(headers)) {
        const arrayLikeHeaders = asArray(headers);
        const headerIndex = arrayLikeHeaders.findIndex(x => asArrayLike(x).at(0) === header);
        if (headerIndex >= 0) {
            arrayLikeHeaders[headerIndex][1] = value;
        } else {
            arrayLikeHeaders.push([header, value]);
        }
        return arrayLikeHeaders;
    }

    headers ||= {};
    headers[header] = value;
    return headers;
}

/**
 * Sets multiple headers in the given headers collection, overwriting any existing values.
 *
 * @param headers - The headers collection.
 * @param newHeaders - The headers to set.
 *
 * @returns The updated headers collection.
 */
export function setHeaders(headers: Headers, newHeaders: Headers): Headers {
    return mergeHeaders(headers, newHeaders, setHeader);
}

/**
 * Sets a header value in the given headers collection only if the header does not already exist.
 *
 * @param headers - The headers collection.
 * @param header - The header to set.
 * @param defaultValue - The default value of the header to set.
 *
 * @returns The updated headers collection.
 */
export function setDefaultHeader(headers: Headers, header: string, defaultValue: string): Headers {
    return hasHeader(headers, header) ? headers : setHeader(headers, header, defaultValue);
}

/**
 * Sets multiple default headers in the given headers collection, only if the headers do not already exist.
 *
 * @param headers - The headers collection.
 * @param defaultHeaders - The default headers to set.
 *
 * @returns The updated headers collection.
 */
export function setDefaultHeaders(headers: Headers, defaultHeaders: Headers): Headers {
    return mergeHeaders(headers, defaultHeaders, setDefaultHeader);
}

/**
 * Deletes a header value from the given headers collection.
 *
 * @param headers - The headers collection.
 * @param header - The header to delete.
 *
 * @returns The updated headers collection.
 */
export function deleteHeader(headers: Headers, header: string): Headers {
    if (isMap(headers)) {
        headers.delete(header);
        return headers;
    }

    if (isIterable(headers)) {
        return asArrayLike(headers).filter(x => asArrayLike(x).at(0) !== header);
    }

    delete headers?.[header];
    return headers;
}

/**
 * Deletes multiple header values from the given headers collection.
 *
 * @param headers - The headers collection.
 * @param headersToDelete - The headers to delete.
 *
 * @returns The updated headers collection.
 */
export function deleteHeaders(headers: Headers, headersToDelete: Iterable<string>): Headers {
    for (const header of headersToDelete) {
        headers = deleteHeader(headers, header);
    }
    return headers;
}

/**
 * Clones the provided headers collection, preserving the key-value pairs of the original.
 *
 * If the headers object is an instance of a `Map`, a new instance of
 * the same type is created and the key-value pairs are copied over.
 *
 * If the headers collection is iterable, the key-value pairs are returned as an array.
 *
 * @param headers - The headers collection to be cloned.
 *
 * @returns A new headers collection containing the key-value pairs of the original headers collection,
 * or `undefined` if the provided headers collection is `undefined` or `null`.
 */
export function cloneHeaders(headers: Headers): Headers {
    if (headers?.constructor && (isMap(headers) || !isIterable(headers))) {
        return setHeaders(new (headers.constructor as new() => Headers)(), headers);
    }

    if (isIterable(headers)) {
        return [...headers];
    }

    return undefined;
}

/**
 * Merges two headers collections using the specified merger function.
 *
 * @param left - The left headers collection.
 * @param right - The right headers collection.
 * @param merger - The function that merges headers.
 *
 * @returns The merged headers collection.
 */
function mergeHeaders(left: Headers, right: Headers, merger: (headers: Headers, header: string, value: string) => Headers): Headers {
    const defaultHeadersIterable = isIterable(right) ? right : Object.entries(right || {});
    for (const headerEntry of defaultHeadersIterable) {
        const [header, value] = asArray(headerEntry);
        left = merger(left, header, value);
    }
    return left;
}

/**
 * Infers the appropriate headers for a given HTTP request body.
 *
 * @param body - The HTTP request body to infer headers from.
 *
 * @returns A collection of the inferred headers.
 */
export function inferHttpRequestBodyHeaders(body: HttpRequestBody): Headers {
    const headers = { } as Headers;
    if (!isStreamableHttpRequestBody(body)) {
        return headers;
    }

    const type = "application/octet-stream";
    const length =
        // `body` is a `Blob`
        typeof (body as Blob).size === "number" ? (body as Blob).size :

        // `body` is a `Buffer`
        typeof (body as Buffer).byteLength === "number" ? (body as Buffer).byteLength :

        // `body` is a `ReadableStream`, which was created from a `Buffer`
        Buffer.isBuffer(body["path"]) ? (body["path"] as Buffer).byteLength :

        // `body` is a `ReadableStream`, which was created from a file path
        typeof body["path"] === "string" || body["path"]?.[Symbol.toStringTag] === "URL" ? statSync(body["path"]).size :

        // `length` is unknown
        undefined;

    headers["Content-Type"] = type;
    headers["Content-Length"] = String(length);
    return headers;
}
