import { EqualityComparer, createDefaultEqualityComparer } from "@/utils/comparison";
import { $i } from "./iterable";

/**
 * Checks if a given value is an instance of a {@link Set}-like object.
 *
 * @template T - The element type of the `Set`-like object.
 *
 * @param value - The value to be checked.
 *
 * @returns A boolean indicating whether the value is a `Set`-like object or not.
 */
export function isSet<T>(value: unknown): value is Set<T> {
    if (value instanceof Set) {
        return true;
    }

    const set = value as Set<T>;
    return (
        !!set &&
        typeof set.values === "function" &&
        typeof set.add === "function" &&
        typeof set.delete === "function" &&
        typeof set.has === "function" &&
        typeof set[Symbol.iterator] === "function"
    );
}

/**
 * Checks if a given value is an instance of a {@link ReadOnlySet}-like object.
 *
 * @template T - The element type of the `ReadOnlySet`-like object.
 *
 * @param value - The value to be checked.
 *
 * @returns A boolean indicating whether the value is a `ReadOnlySet`-like object or not.
 */
export function isReadOnlySet<T>(value: unknown): value is ReadonlySet<T> {
    if (value instanceof Set) {
        return true;
    }

    const set = value as ReadonlySet<T>;
    return (
        !!set &&
        typeof set.values === "function" &&
        typeof set.has === "function" &&
        typeof set[Symbol.iterator] === "function"
    );
}

/**
 * Implements {@link Set} using an array under the hood.
 *
 * @template T - The type of values in the Map.
 *
 * @remarks
 *
 * Recommended for small collections and/or for occasions when you need to provide a custom equality comparer.
 */
export class ArraySet<T> implements Set<T> {
    /**
     * The array of values.
     */
    private readonly _values: T[];

    /**
     * The equality comparer used to compare values.
     */
    private readonly _comparer: EqualityComparer<T>;

    /**
     * Constructs an empty {@link ArraySet}.
     *
     * @param comparer - The equality comparer to use for comparing values.
     */
    constructor(comparer?: EqualityComparer<T>);

    /**
     * Constructs an {@link ArraySet} from an iterable of values.
     *
     * @param values - The iterable of values.
     * @param comparer - The equality comparer to use for comparing values.
     */
    constructor(values: Iterable<T>, comparer?: EqualityComparer<T>);

    /**
     * Constructs an {@link ArraySet} from either an iterable of values or an equality comparer.
     *
     * @param valuesOrComparer - The iterable of values or the equality comparer to use for comparing values.
     * @param comparer - The equality comparer to use for comparing values (if `valuesOrComparer` is an iterable).
     */
    constructor(valuesOrComparer?: Iterable<T> | EqualityComparer<T>, comparer?: EqualityComparer<T>) {
        // If valuesOrComparer is a function, it must be the comparer, so use it.
        // Otherwise, use the default comparer.
        comparer ??= typeof valuesOrComparer === "function" ? valuesOrComparer : createDefaultEqualityComparer<T>();

        // If valuesOrComparer is undefined or is in fact a comparer, create an empty array of values.
        const values = valuesOrComparer && valuesOrComparer !== comparer ? valuesOrComparer as Iterable<T> : [];

        this._values = [];
        this._comparer = comparer;
        for (const value of values) {
            this.add(value);
        }
    }

    /**
     * Returns the number of elements in the set.
     */
    get size(): number {
        return this._values.length;
    }

    /**
     * Adds a value to the set.
     *
     * @param value - The value to add to the set.
     *
     * @returns The set object, for chaining purposes.
     */
    add(value: T): this {
        const i = $i(this._values).indexOf(value, this._comparer);
        if (i === -1) {
            this._values.push(value);
        } else {
            this._values[i] = value;
        }
        return this;
    }

    /**
     * Returns a boolean indicating whether a value exists in the set or not.
     *
     * @param value - The value to search for in the set.
     *
     * @returns `true` if the given value exists in the set; otherwise, `false`.
     */
    has(value: T): boolean {
        return $i(this._values).includes(value, this._comparer);
    }

    /**
     * Removes the value from the set.
     *
     * @param value - The value to remove from the set.
     *
     * @returns `true` if the value was found and removed; otherwise, `false`.
     */
    delete(value: T): boolean {
        const i = $i(this._values).indexOf(value, this._comparer);
        if (i === -1) {
            return false;
        }

        this._values.splice(i, 1);
        return true;
    }

    /**
     * Removes all values from the set.
     */
    clear(): void {
        this._values.splice(0);
    }

    /**
     * Funnily enough, returns an iterator over the values in the set.
     *
     * @remarks
     *
     * This method exists because somebody thought that we need to keep
     * `Set`'s and `Map`'s APIs similar for some reason.
     */
    keys(): IterableIterator<T> {
        return this._values[Symbol.iterator]();
    }

    /**
     * Returns an iterator over the values in the set.
     */
    values(): IterableIterator<T> {
        return this._values[Symbol.iterator]();
    }

    /**
     * Returns a new {@link Iterator} object that contains an array of `[value, value]`
     * for each element in the {@link ArraySet} object, in insertion order.
     *
     * @remarks
     *
     * This method exists because somebody thought that we need to keep
     * `Set`'s and `Map`'s APIs similar for some reason.
     */
    *entries(): IterableIterator<[T, T]> {
        const values = this._values;
        for (let i = 0; i < values.length; ++i) {
            yield [values[i], values[i]];
        }
    }

    /**
     * Executes a provided function once per each value in the set.
     *
     * @param callbackFn - Function to execute for each value in the set.
     * @param thisArg - Object to use as `this` when executing `callbackFn`.
     */
    forEach(callbackFn: (value: T, theSameValueAgain: T, set: ArraySet<T>) => void, thisArg?: unknown): void {
        callbackFn = thisArg === undefined ? callbackFn : callbackFn.bind(thisArg);
        const values = this._values;

        for (let i = 0; i < values.length; ++i) {
            callbackFn(values[i], values[i], this);
        }
    }

    /**
     * Returns an iterator over the values in the set.
     */
    [Symbol.iterator](): IterableIterator<T> {
        return this._values[Symbol.iterator]();
    }

    /**
     * Returns a string representation of this object.
     */
    get [Symbol.toStringTag](): string {
        return "Set";
    }
}
