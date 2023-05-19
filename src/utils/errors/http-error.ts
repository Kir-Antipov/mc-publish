import { HttpResponse } from "@/utils/net";
import { SoftError } from "./soft-error";

/**
 * Represents an HTTP error.
 */
export class HttpError extends SoftError {
    /**
     * The HTTP Response object associated with this error.
     */
    private readonly _response: HttpResponse;

    /**
     * Creates a new {@link HttpError} instance.
     *
     * @param response - The HTTP Response object associated with this error.
     * @param message - The error message.
     * @param isSoft - Indicates whether the error is recoverable or not.
     */
    constructor(response: HttpResponse, message?: string, isSoft?: boolean) {
        super(isSoft ?? isServerError(response), message);

        this.name = "HttpError";
        this._response = response;
    }

    /**
     * Gets the HTTP Response object associated with this error.
     */
    get response(): HttpResponse {
        return this._response;
    }

    /**
     * Extracts error information from the given HTTP Response object
     * and returns an {@link HttpError} instance.
     *
     * @param response - The HTTP Response object to extract the error information from.
     * @param isSoft - Indicates whether the error is recoverable or not.
     *
     * @returns A `Promise` that resolves to an {@link HttpError} instance.
     */
    static async fromResponse(response: HttpResponse, isSoft?: boolean): Promise<HttpError> {
        const cachedResponse = HttpResponse.cache(response);
        const errorText = `${response.status} (${
            await cachedResponse.text()
                .then(x => x && !isHtmlDocument(x) ? `${response.statusText}, ${x}` : response.statusText)
                .catch(() => response.statusText)
        })`;

        return new HttpError(cachedResponse, errorText, isSoft);
    }
}

/**
 * Determines if the given error is an {@link HttpError}.
 *
 * @param error - The error to be checked.
 *
 * @returns `true` if the provided error is an instance of HttpError; otherwise, `false`.
 */
export function isHttpError(error: unknown): error is HttpError {
    return error instanceof HttpError;
}

/**
 * Determines whether the given `HttpResponse` represents a server error.
 *
 * @param response - The `HttpResponse` to check.
 *
 * @returns `true` if the response is a server error; otherwise, `false`.
 */
function isServerError(response: HttpResponse): boolean {
    return response && (response.status === 429 || response.status >= 500);
}

/**
 * Determines if the given text is an HTML document.
 *
 * @param text - The string to check.
 *
 * @returns `true` if the provided string is an HTML document; otherwise, `false`.
 */
function isHtmlDocument(text: string): boolean {
    return text.startsWith("<!DOCTYPE html");
}
