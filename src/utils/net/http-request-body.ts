import { Blob, isBlob } from "./blob";
import { FormData, isFormData } from "./form-data";
import { isURLSearchParams } from "./query-string";

/**
 * Represents possible HTTP request body types.
 */
export type HttpRequestBody = string | Blob | Buffer | URLSearchParams | FormData | NodeJS.ReadableStream;

/**
 * Checks if the given value is one of the supported HTTP request body types.
 *
 * @param body - The value to check.
 *
 * @returns `true` if the value is a valid HTTP request body type; otherwise, `false`.
 */
export function isHttpRequestBody(body: unknown): body is HttpRequestBody {
    return (
        typeof body === "string" ||
        isBlob(body) ||
        Buffer.isBuffer(body) ||
        isURLSearchParams(body) ||
        isFormData(body) ||
        isReadableStream(body)
    );
}

/**
 * Checks if the given value can be used as a streamable HTTP request body.
 *
 * @param body - The value to check.
 *
 * @returns `true` if the value can be used as a streamable HTTP request body; otherwise, `false`.
 */
export function isStreamableHttpRequestBody(body: unknown): body is Blob | Buffer | NodeJS.ReadableStream {
    return (
        isBlob(body) ||
        Buffer.isBuffer(body) ||
        isReadableStream(body)
    );
}

/**
 * Checks if the given value is a readable stream.
 *
 * @param stream - The value to check.
 *
 * @returns `true` if the value is a readable stream; otherwise, `false`.
 */
function isReadableStream(stream: unknown): stream is NodeJS.ReadableStream {
    const s = stream as NodeJS.ReadableStream;
    return (
        !!s &&
        typeof s.read === "function" &&
        typeof s.pause === "function" &&
        typeof s.resume === "function" &&
        typeof s.setEncoding === "function"
    );
}
