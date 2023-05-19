import { CompositeComparer } from "./composite-comparer";

/**
 * A comparator function that returns a number that represents the comparison result between two elements.
 *
 * - If the returned number is **negative**, it means `left` is **less** than `right`.
 * - If the returned number is **zero**, it means `left` is **equal** to `right`.
 * - If the returned number is **positive**, it means `left` is **greater** than `right`.
 *
 * @template T - The type of the elements to compare.
 */
export interface Comparer<T> {
    /**
     * Compares two elements and returns a value indicating whether one element is less than, equal to, or greater than the other.
     *
     * @param left - The first element to compare.
     * @param right - The second element to compare.
     *
     * @returns A number that represents the comparison result.
     */
    (left: T, right: T): number;
}

/**
 * Creates a new {@link CompositeComparer} instance based on the specified `comparer`.
 *
 * @template T - The type of the elements being compared.
 * @param comparer - The base {@link Comparer} used to create the new {@link CompositeComparer}.
 *
 * @returns A new {@link CompositeComparer} instance.
 */
export function createComparer<T>(comparer: Comparer<T>): CompositeComparer<T> {
    return CompositeComparer.create(comparer);
}

// These functions were moved to a different file because of problems with circular references.
export {
    convertComparerToEqualityComparer,
    invertComparer,
    combineComparers,
} from "./comparer.utils";

/**
 * The base comparer that can compare any two values.
 *
 * It treats `undefined` as smaller than any other value, and `null` as smaller than any value except `undefined`.
 * Any non-null and non-undefined values are considered equal.
 */
const BASE_COMPARER: CompositeComparer<unknown> = createComparer<unknown>((left, right) => {
    if (left === undefined) {
        return right === undefined ? 0 : -1;
    }

    if (left === null) {
        return right === undefined ? 1 : right === null ? 0 : -1;
    }

    if (right === undefined || right === null) {
        return 1;
    }

    return 0;
});

/**
 * The default comparer that compares two values using their natural order
 * defined by the built-in `>` and `<` operators.
 */
const DEFAULT_COMPARER: CompositeComparer<unknown> = BASE_COMPARER.thenBy(
    (left, right) => left < right ? -1 : left > right ? 1 : 0
);

/**
 * Creates a base comparer that can compare any two values.
 *
 * It treats `undefined` as smaller than any other value, and `null` as smaller than any value except `undefined`.
 * Any non-null and non-undefined values are considered equal.
 *
 * @template T - The type of the elements being compared.
 */
export function createBaseComparer<T>(): CompositeComparer<T> {
    return BASE_COMPARER as CompositeComparer<T>;
}

/**
 * Creates a default comparer that compares two values using their natural order
 * defined by the built-in `>` and `<` operators.
 *
 * @template T - The type of the elements being compared.
 */
export function createDefaultComparer<T>(): CompositeComparer<T> {
    return DEFAULT_COMPARER as CompositeComparer<T>;
}
