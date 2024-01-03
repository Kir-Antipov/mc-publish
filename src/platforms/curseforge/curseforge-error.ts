/**
 * Error object returned by CurseForge Upload API.
 */
export interface CurseForgeError {
    /**
     * Error code returned by CurseForge Upload API.
     */
    errorCode: number;

    /**
     * Error message returned by CurseForge Upload API.
     */
    errorMessage: string;
}

/**
 * Checks if an object is a {@link CurseForgeError}.
 *
 * @param error - The object to check.
 *
 * @returns `true` if the object matches the structure of a CurseForgeError; otherwise, `false`.
 */
export function isCurseForgeError(error: unknown): error is CurseForgeError {
    const e = error as CurseForgeError;
    return (
        !!e &&
        typeof e.errorCode === "number" &&
        typeof e.errorMessage === "string"
    );
}

/**
 * Error code for an invalid project slug.
 */
const INVALID_PROJECT_SLUG_ERROR_CODE = 1018;

/**
 * Regular expression to match invalid project slug errors.
 */
const INVALID_PROJECT_SLUG_REGEX = /Invalid slug in project relations: '([^']*)'/;

/**
 * Checks if an error is an invalid project slug error.
 *
 * @param error - The error to check.
 *
 * @returns `true` if the error is an invalid project slug error; otherwise, `false`.
 */
export function isInvalidProjectSlugCurseForgeError(error: unknown): error is CurseForgeError {
    return isCurseForgeError(error) && error.errorCode === INVALID_PROJECT_SLUG_ERROR_CODE;
}

/**
 * Extracts the invalid project slug from an error.
 *
 * @param error - The error to extract the invalid project slug from.
 *
 * @returns The invalid project slug, or `undefined` if the error is not an invalid project slug error.
 */
export function getInvalidProjectSlug(error: unknown): string | undefined {
    return isInvalidProjectSlugCurseForgeError(error) ? error.errorMessage.match(INVALID_PROJECT_SLUG_REGEX)?.[1] : undefined;
}

/**
 * Error code for an invalid game version ID.
 */
const INVALID_GAME_VERSION_ID_ERROR_CODE = 1009;

/**
 * Checks if an error is an invalid game version ID error.
 *
 * @param error - The error to check.
 *
 * @returns `true` if the error is an invalid game version ID error; otherwise, `false`.
 */
export function isInvalidGameVersionIdCurseForgeError(error: unknown): error is CurseForgeError {
    return isCurseForgeError(error) && error.errorCode === INVALID_GAME_VERSION_ID_ERROR_CODE;
}
