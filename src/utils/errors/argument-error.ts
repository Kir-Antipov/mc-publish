/**
 * Represents an error that is thrown when one of the arguments provided to a method is not valid.
 */
export class ArgumentError extends Error {
    /**
     * The default message to use when no message is provided.
     */
    private static readonly DEFAULT_ARGUMENT_ERROR_MESSAGE = "Value does not fall within the expected range.";

    /**
     * The message to use when an object was empty.
     */
    private static readonly EMPTY_ARGUMENT_ERROR_MESSAGE = "The value cannot be null, undefined, or empty.";

    /**
     * The pattern used to format the parameter name into the error message.
     *
     * @param paramName - The name of the parameter causing the error.
     *
     * @returns A formatted error message that includes the parameter name.
     */
    private static readonly PARAM_NAME_MESSAGE_PATTERN = (paramName?: string) => paramName ? ` (Parameter '${paramName}')` : "";

    /**
     * The name of the parameter that caused the error.
     */
    private readonly _paramName?: string;

    /**
     * Initializes a new instance of the {@link ArgumentError} class.
     *
     * @param paramName - The name of the parameter that caused the error.
     * @param message - The error message to display.
     * @param options - Optional settings for the error object.
     */
    constructor(paramName?: string, message?: string, options?: ErrorOptions) {
        super(ArgumentError.formatErrorMessage(message, paramName), options);

        this.name = "ArgumentError";
        this._paramName = paramName;
    }

    /**
     * Gets the name of the parameter that caused the error.
     *
     * @returns The name of the parameter that caused the error, or `undefined` if no name was provided.
     */
    get paramName(): string | undefined {
        return this._paramName;
    }

    /**
     * Throws an {@link ArgumentError} if the specified argument is `null`, `undefined`, or empty.
     *
     * @param argument - The argument to check.
     * @param paramName - The name of the parameter being checked.
     * @param message - The error message to display.
     *
     * @throws An {@link ArgumentError} if the specified argument is `null`, `undefined`, or empty.
     */
    static throwIfNullOrEmpty(argument?: { length: number }, paramName?: string, message?: string): void | never {
        if (argument === undefined || argument === null || argument.length === 0) {
            throw new ArgumentError(paramName, message || ArgumentError.EMPTY_ARGUMENT_ERROR_MESSAGE);
        }
    }

    /**
     * Formats the error message to include any specified parameter name.
     *
     * @param message - The error message to format.
     * @param paramName - The name of the parameter that caused the error.
     *
     * @returns The formatted error message.
     */
    private static formatErrorMessage(message?: string, paramName?: string) {
        message ??= ArgumentError.DEFAULT_ARGUMENT_ERROR_MESSAGE;
        message += ArgumentError.PARAM_NAME_MESSAGE_PATTERN(paramName);
        return message;
    }
}
