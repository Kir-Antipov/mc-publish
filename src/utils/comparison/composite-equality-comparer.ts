import { CALL, makeCallable } from "@/utils/functions/callable";
import { andEqualityComparers, negateEqualityComparer, orEqualityComparers } from "./equality-comparer.utils";
import { EqualityComparer } from "./equality-comparer";

/**
 * A class that represents a composite equality comparer.
 *
 * @template T - The type of the elements to compare.
 */
export interface CompositeEqualityComparer<T> extends EqualityComparer<T> {
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
 * A class that represents a composite equality comparer.
 *
 * @template T - The type of the elements to compare.
 */
export class CompositeEqualityComparer<T> {
    /**
     * The underlying comparer function used for comparison.
     */
    private readonly _comparer: EqualityComparer<T>;

    /**
     * The negated version of this comparer.
     */
    private _negated?: CompositeEqualityComparer<T>;

    /**
     * Creates a new instance of {@link CompositeEqualityComparer}.
     *
     * @param comparer - An underlying comparer that should be used for comparison.
     * @param inverted - A cached inverted {@link CompositeEqualityComparer} instance, if any.
     *
     * @remarks
     *
     * Should **not** be called directly. Use {@link create}, or {@link createInternal} instead.
     */
    private constructor(comparer: EqualityComparer<T>, inverted: CompositeEqualityComparer<T>) {
        this._comparer = comparer;
        this._negated = inverted;
    }

    /**
     * Creates a new instance of {@link CompositeEqualityComparer}.
     *
     * @template T - The type of the elements to compare.
     * @param comparer - An underlying comparer that should be used for comparison.
     * @param inverted - A cached inverted {@link CompositeEqualityComparer} instance, if any.
     *
     * @returns A new instance of {@link CompositeEqualityComparer}.
     */
    private static createInternal<T>(comparer: EqualityComparer<T>, inverted?: CompositeEqualityComparer<T>): CompositeEqualityComparer<T> {
        return makeCallable(new CompositeEqualityComparer(comparer, inverted));
    }

    /**
     * Creates a new instance of {@link CompositeEqualityComparer}.
     *
     * @template T - The type of the elements to compare.
     * @param comparer - An underlying comparer that should be used for comparison.
     *
     * @returns A new instance of {@link CompositeEqualityComparer}.
     */
    static create<T>(comparer: EqualityComparer<T>): CompositeEqualityComparer<T> {
        return CompositeEqualityComparer.createInternal(comparer);
    }

    /**
     * Compares two values for equality.
     *
     * @param x - The first value to compare.
     * @param y - The second value to compare.
     *
     * @returns `true` if the values are equal; otherwise, `false`.
     */
    equals(x: T, y: T): boolean {
        return this._comparer(x, y);
    }

    /**
     * Compares two values for equality.
     *
     * @param x - The first value to compare.
     * @param y - The second value to compare.
     *
     * @returns `true` if the values are equal; otherwise, `false`.
     */
    [CALL](x: T, y: T): boolean {
        return this._comparer(x, y);
    }

    /**
     * Combines this comparer with another using the logical OR operator.
     *
     * @param comparer - The other comparer to combine with.
     *
     * @returns A new composite equality comparer representing the combination of this and the other comparer.
     */
    or(comparer: EqualityComparer<T>): CompositeEqualityComparer<T> {
        const unwrappedComparer = comparer instanceof CompositeEqualityComparer ? comparer._comparer : comparer;
        const combinedComparer = orEqualityComparers(this._comparer, unwrappedComparer);
        return CompositeEqualityComparer.createInternal(combinedComparer);
    }

    /**
     * Combines this comparer with another using the logical AND operator.
     *
     * @param comparer - The other comparer to combine with.
     *
     * @returns A new composite equality comparer representing the combination of this and the other comparer.
     */
    and(comparer: EqualityComparer<T>): CompositeEqualityComparer<T> {
        const unwrappedComparer = comparer instanceof CompositeEqualityComparer ? comparer._comparer : comparer;
        const combinedComparer = andEqualityComparers(this._comparer, unwrappedComparer);
        return CompositeEqualityComparer.createInternal(combinedComparer);
    }

    /**
     * Negates this comparer using the logical NOT operator.
     *
     * @returns A new composite equality comparer representing the negation of this comparer.
     */
    negate(): CompositeEqualityComparer<T> {
        this._negated ??= CompositeEqualityComparer.createInternal(negateEqualityComparer(this._comparer), this);
        return this._negated;
    }
}
