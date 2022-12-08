import { createBaseComparer, createDefaultComparer } from "./comparer";

/**
 * A string comparer that performs a case-sensitive ordinal string comparison.
 */
export const ORDINAL_COMPARER = createDefaultComparer<string>();

/**
 * A string comparer that ignores case differences.
 */
export const IGNORE_CASE_COMPARER = createBaseComparer<string>().thenBy(
    (left, right) => left?.localeCompare(right, undefined, { sensitivity: "accent" }) ?? 0
);
