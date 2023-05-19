import { IS_LETTER_OR_DIGIT_REGEX } from "@/utils/string-utils";
import { createDefaultEqualityComparer, createEqualityComparer } from "./equality-comparer";
import { IGNORE_CASE_COMPARER } from "./string-comparer";

/**
 * A string comparer that performs a case-sensitive ordinal string comparison.
 */
export const ORDINAL_EQUALITY_COMPARER = createDefaultEqualityComparer<string>();

/**
 * A string comparer that ignores case differences.
 */
export const IGNORE_CASE_EQUALITY_COMPARER = IGNORE_CASE_COMPARER.asEqualityComparer();

/**
 * An equality comparer that compares two strings ignoring non-word characters (e.g. spaces, punctuation).
 */
export const IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER = createEqualityComparer<string>(
    (x, y) => compareStringsIgnoreNonWordCharacters(x, y, false)
);

/**
 * Creates an equality comparer that compares two strings ignoring non-word characters (e.g. spaces, punctuation) and case sensitivity.
 */
export const IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER = createEqualityComparer<string>(
    (x, y) => compareStringsIgnoreNonWordCharacters(x, y, true)
);

/**
 * A comparer function that compares two strings ignoring non-word characters (e.g. spaces, punctuation).
 *
 * @param x - The first string to compare.
 * @param y - The second string to compare.
 * @param ignoreCase - A flag indicating whether to ignore case during comparison.
 *
 * @returns `true` if the two strings are equal; otherwise, `false`.
 */
function compareStringsIgnoreNonWordCharacters(x: string, y: string, ignoreCase?: boolean): boolean {
    if (x === null || x === undefined || y === null || y === undefined) {
        return x === y;
    }

    const sensitivity = ignoreCase ? "accent" : "variant";

    let xI = 0;
    let yI = 0;
    while (xI < x.length && yI < y.length) {
        let xChar = x.charAt(xI);
        let yChar = y.charAt(yI);
        if (xChar === yChar) {
            ++xI;
            ++yI;
            continue;
        }

        while (xI < x.length && !IS_LETTER_OR_DIGIT_REGEX.test(xChar)) {
            xChar = x.charAt(++xI);
        }
        while (yI < y.length && !IS_LETTER_OR_DIGIT_REGEX.test(yChar)) {
            yChar = y.charAt(++yI);
        }

        if (xChar.localeCompare(yChar, undefined, { sensitivity }) !== 0) {
            return false;
        }
        ++xI;
        ++yI;
    }

    while (xI < x.length && !IS_LETTER_OR_DIGIT_REGEX.test(x.charAt(xI))) {
        ++xI;
    }
    while (yI < y.length && !IS_LETTER_OR_DIGIT_REGEX.test(y.charAt(yI))) {
        ++yI;
    }

    return xI >= x.length && yI >= y.length;
}
