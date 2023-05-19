import { createHash, randomBytes } from "node:crypto";
import { IGNORE_CASE_COMPARER, ORDINAL_COMPARER } from "@/utils/comparison";

/**
 * Returns the input value converted to a string.
 *
 * If the input value is already a string, it is returned as-is.
 * Otherwise, the output of `String()` is returned.
 *
 * @param s - The input value to convert to a string.
 *
 * @returns The input value as a string.
 */
export function asString(s: unknown): string {
    return typeof s === "string" ? s : String(s);
}

/**
 * A regular expression that matches a string consisting of a single letter character.
 */
export const IS_LETTER_REGEX = /^\p{L}$/u;

/**
 * Checks if the provided string is a single letter.
 *
 * @param s - The string to check.
 *
 * @returns `true` if the string is a single letter; otherwise, `false`.
 */
export function isLetter(s: string): boolean {
    return s?.length === 1 && IS_LETTER_REGEX.test(s);
}

/**
 * A regular expression that matches a string consisting of a single digit character.
 */
export const IS_DIGIT_REGEX = /^\d$/;

/**
 * Checks if the provided string is a single digit.
 *
 * @param s - The string to check.
 *
 * @returns `true` if the string is a single digit; otherwise, `false`.
 */
export function isDigit(s: string): boolean {
    return s?.length === 1 && s >= "0" && s <= "9";
}

/**
 * A regular expression that matches a string consisting of a single letter or digit character.
 */
export const IS_LETTER_OR_DIGIT_REGEX = /^(?:\p{L}|\d)$/u;

/**
 * Checks if the provided string is a single letter or digit.
 *
 * @param s - The string to check.
 *
 * @returns `true` if the string is a single letter or digit; otherwise, `false`.
 */
export function isLetterOrDigit(s: string): boolean {
    return s?.length === 1 && IS_LETTER_OR_DIGIT_REGEX.test(s);
}

/**
 * A regular expression that matches strings containing only uppercase characters
 * and not containing any lowercase Unicode characters.
 */
export const IS_UPPER_CASE_REGEX = /^[^\p{Ll}]*$/u;

/**
 * Checks if a string contains only uppercase characters.
 *
 * @param s - The string to check.
 *
 * @returns `true` if the input string contains only uppercase characters; otherwise, `false`.
 */
export function isUpperCase(s: string): boolean {
    return IS_UPPER_CASE_REGEX.test(s);
}

/**
 * A regular expression that matches strings containing only lowercase characters
 * and not containing any uppercase Unicode characters.
 */
export const IS_LOWER_CASE_REGEX = /^[^\p{Lu}]*$/u;

/**
 * Checks if a string contains only lowercase characters.
 *
 * @param s - The string to check.
 *
 * @returns `true` if the input string contains only lowercase characters; otherwise, `false`.
 */
export function isLowerCase(s: string): boolean {
    return IS_LOWER_CASE_REGEX.test(s);
}

/**
 * Checks if a given string represents a valid number.
 *
 * @param s - The string to be checked.
 *
 * @returns `true` if the string represents a valid number; otherwise, `false`.
 */
export function isNumberString(s: string): boolean {
    return String(+s) === s;
}

/**
 * Checks if a given string represents a valid integer number.
 *
 * @param s - The string to be checked.
 *
 * @returns `true` if the string represents a valid integer number; otherwise, `false`.
 */
export function isIntegerString(s: string): boolean {
    return String(parseInt(s)) === s;
}

/**
 * Options for comparing strings.
 */
export interface StringComparisonOptions {
    /**
     * Indicates whether the comparison should ignore the case of the strings being compared.
     * If `ignoreCase` is `true`, the comparison will use lexicographical sort rules while
     * ignoring the case of the strings being compared.
     */
    ignoreCase?: boolean;
}

/**
 * Compares two strings lexicographically and returns a value indicating whether one string is less than, equal to, or greater than the other.
 *
 * @param left - The first string to compare.
 * @param right - The second string to compare.
 * @param options - Options for comparing strings.
 *
 * @returns A value indicating the comparison result:
 *
 *  - A value less than 0 indicates that `left` is less than `right`.
 *  - 0 indicates that `left` is equal to `right`.
 *  - A value greater than 0 indicates that `left` is greater than `right`.
 */
export function stringCompare(left: string, right: string, options?: StringComparisonOptions): number {
    const comparer = options?.ignoreCase ? IGNORE_CASE_COMPARER : ORDINAL_COMPARER;
    return comparer.compare(left, right);
}

/**
 * Compares two strings.
 *
 * @param left - The first string to compare.
 * @param right - The second string to compare.
 * @param options - Options for comparing strings.
 *
 * @returns `true` if the strings are equal; otherwise, `false`.
 */
export function stringEquals(left: string, right: string, options?: StringComparisonOptions): boolean {
    return stringCompare(left, right, options) === 0;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param s - The string to capitalize.
 *
 * @returns The capitalized string.
 */
export function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Converts the first character of a string to lowercase.
 *
 * @param s - The input string.
 *
 * @returns The input string with the first character converted to lowercase.
 */
export function uncapitalize(s: string): string {
    return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Converts a string to PascalCase.
 *
 * This function can handle input strings in the following formats:
 * - PascalCase
 * - camelCase
 * - kebab-case
 * - snake_case
 * - SCREAMING_SNAKE_CASE
 *
 * @param s - The input string to be converted to PascalCase.
 *
 * @returns The input string converted to PascalCase.
 */
export function toPascalCase(s: string): string {
    // Convert input to lowercase if the entire string is in uppercase (SCREAMING_SNAKE_CASE)
    if (isUpperCase(s)) {
        s = s.toLowerCase();
    }

    return s
        // Replace any character following a non-word character (such as - or _) with its uppercase counterpart
        .replace(/(?:^|[\s_-])(\w)/g, (_, char) => char.toUpperCase())
        // Remove any non-word characters (such as - or _) from the result
        .replace(/[\s_-]/g, "");
}

/**
 * Specifies how the results should be transformed when splitting a string into substrings.
 */
export interface StringSplitOptions {
    /**
     * Remove empty (zero-length) substrings from the result.
     */
    removeEmptyEntries?: boolean;

    /**
     * Trim whitespace from each substring in the result.
     */
    trimEntries?: boolean;
}

/**
 * Splits a string into an array of substrings based on a separator.
 *
 * @param s - The input string to split.
 * @param separator - The separator to split the string by.
 * @param options - Options for splitting the string.
 *
 * @returns An array of substrings from the original string.
 */
export function split(s: string, separator: string, options?: StringSplitOptions): string[];

/**
 * Splits a string into an array of substrings based on the given separators.
 *
 * @param s - The input string to split.
 * @param separators - The array of separators to split the string by.
 * @param options - Options for splitting the string.
 *
 * @returns An array of substrings from the original string.
 */
export function split(s: string, separators: readonly string[], options?: StringSplitOptions): string[];

/**
 * Returns an array of substrings that were delimited by strings in the original input that
 * match against the `splitter` regular expression.
 *
 * @param s - The input string to split.
 * @param splitter - The regular expression to split the string by.
 * @param options - Options for splitting the string.
 *
 * @returns An array of substrings from the original string.
 */
export function split(s: string, splitter: RegExp, options?: StringSplitOptions): string[];

/**
 * Splits a string into an array of substrings based on a separator.
 *
 * @param s - The string to split.
 * @param separator - The separator to split the string by. Can be a string, a regular expression, or an array of strings.
 * @param options - Options for splitting the string.
 *
 * @returns An array of substrings from the original string.
 */
export function split(s: string, separator: string | RegExp | readonly string[], options?: StringSplitOptions): string[] {
    if (!s) {
        return [];
    }

    if (Array.isArray(separator)) {
        return splitByArrayOfStrings(s, separator, options);
    }
    return splitByStringOrRegex(s, separator as string | RegExp, options);
}

/**
 * Split a string into substrings using the specified separator and return them as an array.
 *
 * @param s - The string to split.
 * @param separator - The separator to split the string by. Can be a string, or a regular expression.
 * @param options - Options for splitting the string.
 *
 * @returns An array of substrings from the original string.
 */
function splitByStringOrRegex(s: string, separator: string | RegExp, options?: StringSplitOptions): string[] {
    const trimEntries = options?.trimEntries ?? false;
    const removeEmptyEntries = options?.removeEmptyEntries ?? false;
    const parts = s.split(separator);

    if (trimEntries) {
        for (let i = 0; i < parts.length; ++i) {
            parts[i] = parts[i].trim();
        }
    }
    return removeEmptyEntries ? parts.filter(x => x) : parts;
}

/**
 * Splits a string into an array of substrings based on the given separators.
 *
 * @param s - The input string to split.
 * @param separators - The array of separators to split the string by.
 * @param options - Options for splitting the string.
 *
 * @returns An array of substrings from the original string.
 */
function splitByArrayOfStrings(s: string, separators: readonly string[], options?: StringSplitOptions): string[] {
    const trimEntries = options?.trimEntries ?? false;
    const removeEmptyEntries = options?.removeEmptyEntries ?? false;
    const splitted = [];

    let previousIndex = -1;
    for (let i = 0; i < s.length; ++i) {
        if (!separators.includes(s.charAt(i))) {
            continue;
        }

        let part = s.substring(previousIndex + 1, i);
        previousIndex = i;

        if (trimEntries) {
            part = part.trim();
        }

        if (part || !removeEmptyEntries) {
            splitted.push(part);
        }
    }

    let lastPart = s.substring(previousIndex + 1);

    if (trimEntries) {
        lastPart = lastPart.trim();
    }

    if (lastPart || !removeEmptyEntries) {
        splitted.push(lastPart);
    }

    return splitted;
}

/**
 * Represents options for splitting a string into multiple lines.
 */
export interface StringSplitLineOptions {
    /**
     * The maximum length of each line.
     */
    maxLength?: number;
}

/**
 * Splits a string into an array of lines.
 *
 * @param text - The input string to split.
 * @param options - An optional object that specifies the options for splitting the string, including the maximum line length.
 *
 * @returns An array of strings, where each string represents a line from the input string. If the `maxLength` option is specified, the lines will be truncated at the specified length.
 */
export function splitLines(text: string, options?: StringSplitLineOptions): string[] {
    const maxLength = options?.maxLength || 0;

    const lines = text.split(/\r?\n/);
    if (maxLength <= 0) {
        return lines;
    }

    const shortenedLines = lines.flatMap(line => {
        if (line.length <= maxLength) {
            return line;
        }

        const words = line.split(" ");
        const linesFromCurrentLine = [] as string[];
        let currentLine = "";

        for (const word of words) {
            if (currentLine.length + word.length <= maxLength) {
                currentLine += (currentLine ? " " : "") + word;
            } else {
                linesFromCurrentLine.push(currentLine);
                currentLine = word;
            }
        }

        linesFromCurrentLine.push(currentLine);
        return linesFromCurrentLine;
    });

    return shortenedLines;
}

/**
 * Represents options for padding a string with spaces or a specific fill character.
 */
export interface StringPadOptions {
    /**
     * The fill character to use when padding the string. If not specified, spaces will be used.
     */
    fillString?: string;

    /**
     * The alignment of the padded string within the specified maximum length.
     */
    align?: "left" | "center" | "right";
}

/**
 * Pads a string with spaces or a specific fill character to the specified maximum length.
 *
 * @param s - The input string to pad.
 * @param maxLength - The maximum length of the padded string.
 * @param options - An optional object that specifies the options for padding the string.
 *
 * @returns A string that represents the padded input string according to the specified options.
 */
export function pad(s: string, maxLength: number, options?: StringPadOptions): string {
    s ||= "";

    switch (options?.align) {
        case "left":
            return s.padEnd(maxLength, options?.fillString);
        case "right":
            return s.padStart(maxLength, options?.fillString);
        default:
            const availableLength = maxLength - s.length;
            if (availableLength <= 0) {
                return s;
            }
            const padStartLength = (availableLength >> 1) + s.length;
            return s.padStart(padStartLength, options?.fillString).padEnd(maxLength, options?.fillString);
    }
}

/**
 * Generates a secure random string of a specified length.
 *
 * @param length - The desired length of the generated string.
 *
 * @returns The secure random string in hexadecimal format.
 */
export function generateSecureRandomString(length: number): string {
    const bytes = randomBytes(Math.ceil(length / 2));
    return bytes.toString("hex").slice(0, length);
}

/**
 * Hashes a string using the specified algorithm.
 *
 * @param input - The string to be hashed.
 * @param algorithm - The hashing algorithm to use (default: "sha256").
 *
 * @returns The hashed string in hexadecimal format.
 */
export function hashString(input: string, algorithm = "sha256"): string {
    return createHash(algorithm).update(input).digest("hex");
}
