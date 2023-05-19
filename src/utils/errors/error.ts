/**
 * Determines if the input is an {@link Error}.
 *
 * @param error - Input to be checked.
 *
 * @returns `true` if the input is an `Error`; otherwise, `false`.
 */
export function isError(error: unknown): error is Error {
    return error instanceof Error;
}
