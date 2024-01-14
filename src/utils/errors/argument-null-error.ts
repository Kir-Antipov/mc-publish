import { ArgumentError } from "./argument-error";

/**
 * Represents an error that occurs when a required argument is null or undefined.
 */
export class ArgumentNullError extends ArgumentError {
    /**
     * The default message to use when no message is provided.
     */
    private static readonly DEFAULT_ARGUMENT_NULL_ERROR_MESSAGE = "Value cannot be null or undefined.";

    /**
     * Initializes a new instance of the {@link ArgumentNullError} class.
     *
     * @param paramName - The name of the parameter that caused the error.
     * @param message - The error message to display.
     * @param options - Optional settings for the error object.
     */
    constructor(paramName?: string, message?: string, options?: ErrorOptions) {
        super(paramName, message ?? ArgumentNullError.DEFAULT_ARGUMENT_NULL_ERROR_MESSAGE, options);

        this.name = "ArgumentNullError";
    }

    /**
     * Throws an {@link ArgumentNullError} if the specified argument is `null` or `undefined`.
     *
     * @param argument - The argument to check.
     * @param paramName - The name of the parameter being checked.
     * @param message - The error message to display.
     *
     * @throws An {@link ArgumentNullError} if the specified argument is `null` or `undefined`.
     */
    static throwIfNull(argument?: unknown, paramName?: string, message?: string): void | never {
        if (argument === undefined || argument === null) {
            throw new ArgumentNullError(paramName, message);
        }
    }
}
