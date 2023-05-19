/**
 * Represents an HTTP method.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";

/**
 * Checks if two HTTP methods are the same.
 *
 * @param left - The first HTTP method to compare.
 * @param right - The second HTTP method to compare.
 *
 * @returns `true` if the methods are the same; otherwise, `false`.
 */
export function httpMethodEquals(left: string, right: string): boolean {
    return left === right || isGetHttpMethod(left) && isGetHttpMethod(right);
}

/**
 * Determines whether an HTTP method can accept a request body.
 *
 * @param method - The HTTP method to check.
 *
 * @returns `true` if the HTTP method can accept a request body; otherwise, `false`.
 */
export function canHttpMethodAcceptBody(method: string): boolean {
    return (
        !isGetHttpMethod(method) &&
        !isHeadHttpMethod(method) &&
        !isConnectHttpMethod(method) &&
        !isTraceHttpMethod(method)
    );
}

/**
 * Checks if the value is a valid GET HTTP method.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a valid GET method; otherwise, `false`.
 */
export function isGetHttpMethod(value: unknown): boolean {
    return !value || value === "GET";
}

/**
 * Checks if the value is a valid POST HTTP method.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a valid POST method; otherwise, `false`.
 */
export function isPostHttpMethod(value: unknown): boolean {
    return value === "POST";
}

/**
 * Checks if the value is a valid PUT HTTP method.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a valid PUT method; otherwise, `false`.
 */
export function isPutHttpMethod(value: unknown): boolean {
    return value === "PUT";
}

/**
 * Checks if the value is a valid PATCH HTTP method.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a valid PATCH method; otherwise, `false`.
 */
export function isPatchHttpMethod(value: unknown): boolean {
    return value === "PATCH";
}

/**
 * Checks if the value is a valid DELETE HTTP method.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a valid DELETE method; otherwise, `false`.
 */
export function isDeleteHttpMethod(value: unknown): boolean {
    return value === "DELETE";
}

/**
 * Checks if the value is a valid OPTIONS HTTP method.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a valid OPTIONS method; otherwise, `false`.
 */
export function isOptionsHttpMethod(value: unknown): boolean {
    return value === "OPTIONS";
}

/**
 * Checks if the value is a valid HEAD HTTP method.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a valid HEAD method; otherwise, `false`.
 */
export function isHeadHttpMethod(value: unknown): boolean {
    return value === "HEAD";
}

/**
 * Checks if the value is a valid CONNECT HTTP method.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a valid CONNECT method; otherwise, `false`.
 */
export function isConnectHttpMethod(value: unknown): boolean {
    return value === "CONNECT";
}

/**
 * Checks if the value is a valid TRACE HTTP method.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a valid TRACE method; otherwise, `false`.
 */
export function isTraceHttpMethod(value: unknown): boolean {
    return value === "TRACE";
}
