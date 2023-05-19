import { CALL, makeCallable } from "@/utils/functions/callable";
import { combineComparers, convertComparerToEqualityComparer, invertComparer } from "./comparer.utils";
import { CompositeEqualityComparer } from "./composite-equality-comparer";
import { Comparer } from "./comparer";

/**
 * A class that represents a composite comparer.
 *
 * @template T - The type of the elements to compare.
 */
export interface CompositeComparer<T> extends Comparer<T> {
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
 * A class that represents a composite comparer.
 *
 * @template T - The type of the elements to compare.
 */
export class CompositeComparer<T> {
    /**
     * The underlying comparer function used for comparison.
     */
    private readonly _comparer: Comparer<T>;

    /**
     * The inverted version of this comparer.
     */
    private _inverted?: CompositeComparer<T>;

    /**
     * Constructs a new instance of {@link CompositeComparer}.
     *
     * @param comparer - An underlying comparer that should be used for comparison.
     * @param inverted - A cached inverted {@link CompositeComparer} instance, if any.
     *
     * @remarks
     *
     * Should **not** be called directly. Use {@link create}, or {@link createInternal} instead.
     */
    private constructor(comparer: Comparer<T>, inverted: CompositeComparer<T>) {
        this._comparer = comparer;
        this._inverted = inverted;
    }

    /**
     * Creates a new instance of {@link CompositeComparer}.
     *
     * @template T - The type of the elements to compare.
     * @param comparer - An underlying comparer that should be used for comparison.
     * @param inverted - A cached inverted {@link CompositeComparer} instance, if any.
     *
     * @returns A new instance of {@link CompositeComparer}.
     */
    private static createInternal<T>(comparer: Comparer<T>, inverted?: CompositeComparer<T>): CompositeComparer<T> {
        return makeCallable(new CompositeComparer(comparer, inverted));
    }

    /**
     * Creates a new instance of {@link CompositeComparer}.
     *
     * @template T - The type of the elements to compare.
     * @param comparer - An underlying comparer that should be used for comparison.
     *
     * @returns A new instance of {@link CompositeComparer}.
     */
    static create<T>(comparer: Comparer<T>): CompositeComparer<T> {
        return CompositeComparer.createInternal(comparer);
    }

    /**
     * Compares two elements and returns a value indicating whether one element is less than, equal to, or greater than the other.
     *
     * @param left - The first element to compare.
     * @param right - The second element to compare.
     *
     * @returns A number that represents the comparison result.
     */
    compare(left: T, right: T): number {
        return this._comparer(left, right);
    }

    /**
     * Compares two elements and returns a value indicating whether one element is less than, equal to, or greater than the other.
     *
     * @param left - The first element to compare.
     * @param right - The second element to compare.
     *
     * @returns A number that represents the comparison result.
     */
    [CALL](left: T, right: T): number {
        return this._comparer(left, right);
    }

    /**
     * Creates a new comparer which compares elements using this comparer first, and then using the `nextComparer`.
     *
     * @param comparer - The next comparer to use if this comparer returns equal result.
     *
     * @returns A new comparer which compares elements using this comparer first, and then using the `nextComparer`.
     */
    thenBy(comparer: Comparer<T>): CompositeComparer<T> {
        const unwrappedComparer = comparer instanceof CompositeComparer ? comparer._comparer : comparer;
        const combinedComparer = combineComparers(this._comparer, unwrappedComparer);
        return CompositeComparer.createInternal(combinedComparer);
    }

    /**
     * Creates a new comparer that inverts the comparison result of this comparer.
     *
     * @returns A new comparer that inverts the comparison result of this comparer.
     */
    invert(): CompositeComparer<T> {
        this._inverted ??= CompositeComparer.createInternal(invertComparer(this._comparer), this);
        return this._inverted;
    }

    /**
     * Converts the current {@link CompositeComparer} instance into a new {@link CompositeEqualityComparer} instance.
     *
     * @returns A new {@link CompositeEqualityComparer} instance that uses the underlying comparer function to compare for equality.
     */
    asEqualityComparer(): CompositeEqualityComparer<T> {
        return CompositeEqualityComparer.create(convertComparerToEqualityComparer(this._comparer));
    }
}
