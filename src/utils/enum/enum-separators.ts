/**
 * An array of characters that can be used to separate enum values in a string.
 */
export const ENUM_SEPARATORS = [",", "|"] as const;

/**
 * The default separator used when converting an enum value to a string.
 */
export const DEFAULT_ENUM_SEPARATOR = ENUM_SEPARATORS[0];
