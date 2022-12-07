import { Comparer } from "./comparer";
import { EqualityComparer } from "./equality-comparer";

/**
 * Converts a comparer function into an equality comparer function.
 * The resulting equality comparer function returns `true` if the comparer returns `0`.
 *
 * @param comparer - The comparer function to convert.
 *
 * @returns An equality comparer function that returns `true` if the comparer returns `0`.
 */
export function convertComparerToEqualityComparer<T>(comparer: Comparer<T>): EqualityComparer<T> {
    return (x, y) => comparer(x, y) === 0;
}

/**
 * Returns a new comparer function that represents the inverted comparison result of the original comparer.
 *
 * @template T - The type of the elements to compare.
 * @param comparer - The original comparer function.
 *
 * @returns A new comparer function that represents the inverted comparison result of the original comparer.
 */
export function invertComparer<T>(comparer: Comparer<T>): Comparer<T> {
    return (left, right) => comparer(right, left);
}

/**
 * Combines two {@link Comparer} instances in order to create a new one that sorts
 * elements based on the first comparer, and then by the second one.
 *
 * @template T - The type of the elements being compared.
 * @param left - The first comparer to use when comparing elements.
 * @param right - The second comparer to use when comparing elements.
 *
 * @returns A new {@link Comparer} instance that sorts elements based on the first comparer, and then by the second one.
 */
export function combineComparers<T>(left: Comparer<T>, right: Comparer<T>): Comparer<T> {
    return (a, b) => {
        const leftResult = left(a, b);
        return leftResult === 0 ? right(a, b) : leftResult;
    };
}
