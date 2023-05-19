/**
 * Represents a soft error, indicating whether the error is recoverable or not.
 */
export class SoftError extends Error {
    /**
     * Indicates whether the error is recoverable or not.
     */
    private readonly _isSoft: boolean;

    /**
     * Initializes a new instance of the {@link SoftError} class.
     *
     * @param isSoft - Indicates whether the error is recoverable or not.
     * @param message - An optional error message.
     */
    constructor(isSoft: boolean, message?: string) {
        super(message);

        this.name = "SoftError";
        this._isSoft = isSoft;
    }

    /**
     * Indicates whether the error is recoverable or not.
     */
    get isSoft(): boolean {
        return this._isSoft;
    }
}

/**
 * Determines whether the specified error is a soft error.
 *
 * @param error - The error to check.
 *
 * @returns `true` if the error is soft (i.e., recoverable); otherwise, `false`.
 */
export function isSoftError(error: unknown): boolean {
    return !!(error as SoftError)?.isSoft;
}
