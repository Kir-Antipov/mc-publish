import { EqualityComparer } from "./equality-comparer";

/**
 * Returns a new equality comparer that is the negation of the specified comparer.
 *
 * @template T - The type of values being compared.
 *
 * @param comparer - The equality comparer to negate.
 *
 * @returns A new equality comparer that returns `true` when the specified comparer returns `false`, and vice versa.
 */
export function negateEqualityComparer<T>(comparer: EqualityComparer<T>): EqualityComparer<T> {
    return (x, y) => !comparer(x, y);
}

/**
 * Combines two equality comparers using the logical OR operator.
 *
 * @template T - The type of values being compared.
 *
 * @param left - The first equality comparer to use in the OR operation.
 * @param right - The second equality comparer to use in the OR operation.
 *
 * @returns A new equality comparer that returns `true` if either the `left` or `right` comparer returns `true`.
 */
export function orEqualityComparers<T>(left: EqualityComparer<T>, right: EqualityComparer<T>): EqualityComparer<T> {
    return (x, y) => left(x, y) || right(x, y);
}

/**
 * Combines two equality comparers using the logical AND operator.
 *
 * @template T - The type of values being compared.
 *
 * @param left - The first equality comparer to use in the AND operation.
 * @param right - The second equality comparer to use in the AND operation.
 *
 * @returns A new equality comparer that returns `true` if both the `left` and `right` comparers return `true`.
 */
export function andEqualityComparers<T>(left: EqualityComparer<T>, right: EqualityComparer<T>): EqualityComparer<T> {
    return (x, y) => left(x, y) && right(x, y);
}
