import { CompositeEqualityComparer } from "./composite-equality-comparer";

/**
 * A function that compares two values for equality.
 *
 * @template T - The type of values being compared.
 */
export interface EqualityComparer<T> {
    /**
     * Compares two values for equality.
     *
     * @param x - The first value to compare.
     * @param y - The second value to compare.
     *
     * @returns `true` if the values are equal; otherwise, `false`.
     */
    (x: T, y: T): boolean;
}

/**
 * Creates a composite equality comparer from the specified function.
 *
 * @template T - The type of values being compared.
 *
 * @param comparer - The equality comparer function to use as the base comparer.
 *
 * @returns A new {@link CompositeEqualityComparer} object.
 */
export function createEqualityComparer<T>(comparer: EqualityComparer<T>): CompositeEqualityComparer<T> {
    return CompositeEqualityComparer.create(comparer);
}

// These functions were moved to a different file because of problems with circular references.
export {
    negateEqualityComparer,
    orEqualityComparers,
    andEqualityComparers,
} from "./equality-comparer.utils";

/**
 * The default equality comparer that uses strict equality (`===`) to compare values.
 */
const DEFAULT_EQUALITY_COMPARER = createEqualityComparer<unknown>((x, y) => x === y);

/**
 * Creates a composite equality comparer that uses strict equality (`===`) to compare values.
 *
 * @template T - The type of values being compared.
 */
export function createDefaultEqualityComparer<T>(): CompositeEqualityComparer<T> {
    return DEFAULT_EQUALITY_COMPARER as CompositeEqualityComparer<T>;
}
