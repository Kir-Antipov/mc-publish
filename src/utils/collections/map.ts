import { EqualityComparer, createDefaultEqualityComparer } from "@/utils/comparison";
import { $i, asArray, isIterable } from "./iterable";

/**
 * Checks if a given value is an instance of a {@link Map}-like object.
 *
 * @template K - The key type of the `Map`-like object.
 * @template V - The value type of the `Map`-like object.
 *
 * @param value - The value to be checked.
 *
 * @returns A boolean indicating whether the value is a `Map`-like object or not.
 */
export function isMap<K, V>(value: unknown): value is Map<K, V> {
    if (value instanceof Map) {
        return true;
    }

    const map = value as Map<K, V>;
    return (
        !!map &&
        typeof map.keys === "function" &&
        typeof map.values === "function" &&
        typeof map.entries === "function" &&
        typeof map.get === "function" &&
        typeof map.set === "function" &&
        typeof map.has === "function" &&
        typeof map.delete === "function" &&
        typeof map[Symbol.iterator] === "function"
    );
}

/**
 * Checks if a given value is an instance of a {@link ReadOnlyMap}-like object.
 *
 * @template K - The key type of the `ReadOnlyMap`-like object.
 * @template V - The value type of the `ReadOnlyMap`-like object.
 *
 * @param value - The value to be checked.
 *
 * @returns A boolean indicating whether the value is a `ReadOnlyMap`-like object or not.
 */
export function isReadOnlyMap<K, V>(value: unknown): value is ReadonlyMap<K, V> {
    if (value instanceof Map) {
        return true;
    }

    const map = value as ReadonlyMap<K, V>;
    return (
        !!map &&
        typeof map.keys === "function" &&
        typeof map.values === "function" &&
        typeof map.entries === "function" &&
        typeof map.get === "function" &&
        typeof map.has === "function" &&
        typeof map[Symbol.iterator] === "function"
    );
}

/**
 * Checks if a given value is an instance of a {@link MultiMap}-like object.
 *
 * @template K - The key type of the `MultiMap`-like object.
 * @template V - The value type of the `MultiMap`-like object.
 *
 * @param value - The value to be checked.
 *
 * @returns A boolean indicating whether the value is a `MultiMap`-like object or not.
 */
export function isMultiMap<K, V>(value: unknown): value is MultiMap<K, V> {
    if (value instanceof MultiMap) {
        return true;
    }

    const multiMap = value as MultiMap<K, V>;
    return (
        isMap(multiMap) &&
        typeof multiMap.append === "function"
    );
}

/**
 * Implements {@link Map} using an array under the hood.
 *
 * @template K - The type of keys in the Map.
 * @template V - The type of values in the Map.
 *
 * @remarks
 *
 * Recommended for small collections and/or for occasions when you need to provide a custom equality comparer.
 */
export class ArrayMap<K, V> implements Map<K, V> {
    /**
     * The array of keys.
     */
    private readonly _keys: K[];

    /**
     * The array of values.
     */
    private readonly _values: V[];

    /**
     * The equality comparer used to compare keys.
     */
    private readonly _comparer: EqualityComparer<K>;

    /**
     * Constructs an empty {@link ArrayMap}.
     *
     * @param comparer - The equality comparer to use for comparing keys.
     */
    constructor(comparer?: EqualityComparer<K>);

    /**
     * Constructs an {@link ArrayMap} from an iterable of key-value pairs.
     *
     * @param entries - The iterable of key-value pairs.
     * @param comparer - The equality comparer to use for comparing keys.
     */
    constructor(entries: Iterable<readonly [K, V]>, comparer?: EqualityComparer<K>);

    /**
     * Constructs an {@link ArrayMap} from either an iterable of key-value pairs or an equality comparer.
     *
     * @param entriesOrComparer - The iterable of key-value pairs or the equality comparer to use for comparing keys.
     * @param comparer - The equality comparer to use for comparing keys (if `entriesOrComparer` is an iterable).
     */
    constructor(entriesOrComparer?: Iterable<readonly [K, V]> | EqualityComparer<K>, comparer?: EqualityComparer<K>) {
        // If entriesOrComparer is a function, it must be the comparer, so use it.
        // Otherwise, use the default comparer.
        comparer ??= typeof entriesOrComparer === "function" ? entriesOrComparer : createDefaultEqualityComparer<K>();

        this._keys = [] as K[];
        this._values = [] as V[];
        this._comparer = comparer;

        // If entriesOrComparer is undefined or is in fact a comparer, create an empty array of entries.
        const entries = entriesOrComparer && entriesOrComparer !== comparer ? entriesOrComparer as Iterable<readonly [K, V]> : [];

        for (const [key, value] of entries) {
            this.set(key, value);
        }
    }

    /**
     * The number of key-value pairs in the map.
     */
    get size(): number {
        return this._keys.length;
    }

    /**
     * Gets the value associated with the specified key.
     *
     * @param key - The key of the value to get.
     *
     * @returns The value associated with the specified key, or `undefined` if the key is not found.
     */
    get(key: K): V | undefined {
        const i = $i(this._keys).indexOf(key, this._comparer);

        // Will return `undefined` if i === -1, which is exactly what we are looking for.
        return this._values[i];
    }

    /**
     * Sets the value associated with the specified key.
     *
     * @param key - The key of the value to set.
     * @param value - The value to set.
     *
     * @returns This {@link ArrayMap} instance for chaining purposes.
     */
    set(key: K, value: V): this {
        const i = $i(this._keys).indexOf(key, this._comparer);
        if (i === -1) {
            this._keys.push(key);
            this._values.push(value);
        } else {
            // Since we use a custom comparer, we need to update the key too.
            this._keys[i] = key;
            this._values[i] = value;
        }
        return this;
    }

    /**
     * Determines whether the map contains the specified key.
     *
     * @param key - The key to check for.
     *
     * @returns `true` if the map contains the key; otherwise, `false`.
     */
    has(key: K): boolean {
        return $i(this._keys).includes(key, this._comparer);
    }

    /**
     * Removes the entry with the specified key from the map.
     *
     * @param key - The key of the entry to remove.
     *
     * @returns `true` if an entry with the specified key was found and removed; otherwise, `false`.
     */
    delete(key: K): boolean {
        const i = $i(this._keys).indexOf(key, this._comparer);
        if (i === -1) {
            return false;
        }

        this._keys.splice(i, 1);
        this._values.splice(i, 1);
        return true;
    }

    /**
     * Removes all key-value pairs from the map.
     */
    clear(): void {
        this._keys.splice(0);
        this._values.splice(0);
    }

    /**
     * Returns an iterator over the keys in the map.
     */
    keys(): IterableIterator<K> {
        return this._keys[Symbol.iterator]();
    }

    /**
     * Returns an iterator over the values in the map.
     */
    values(): IterableIterator<V> {
        return this._values[Symbol.iterator]();
    }

    /**
     * Returns an iterator over the entries in the map.
     */
    *entries(): IterableIterator<[K, V]> {
        const keys = this._keys;
        const values = this._values;

        for (let i = 0; i < keys.length; ++i) {
            yield [keys[i], values[i]];
        }
    }

    /**
     * Calls the specified callback function for each key-value pair in the map.
     *
     * @param callbackFn - This function is called one time for each element in the map. It takes the value, key, and the map itself as arguments.
     * @param thisArg - An optional object to which `this` keyword can refer in the `callbackFn` function.
     */
    forEach(callbackFn: (value: V, key: K, map: ArrayMap<K, V>) => void, thisArg?: unknown): void {
        callbackFn = thisArg === undefined ? callbackFn : callbackFn.bind(thisArg);
        const keys = this._keys;
        const values = this._values;

        for (let i = 0; i < keys.length; ++i) {
            callbackFn(values[i], keys[i], this);
        }
    }

    /**
     * Returns an iterator over the entries in the map.
     */
    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    /**
     * Returns a string representation of this object.
     */
    get [Symbol.toStringTag](): string {
        return "Map";
    }
}

/**
 * A multi-map class that allows multiple values per key.
 *
 * @template K - The type of keys in the MultiMap.
 * @template V - The type of values in the MultiMap.
 *
 * @remarks
 *
 * This class extends {@link ArrayMap} and stores values in arrays.
 */
export class MultiMap<K, V> extends ArrayMap<K, V[]> {
    /**
     * Gets the first value associated with the specified key.
     *
     * @param key - The key of the value to get.
     *
     * @returns The first value associated with the specified key, or `undefined` if the key is not found.
     */
    getFirst(key: K): V | undefined {
        return this.get(key)?.[0];
    }

    /**
     * Sets a single value associated with the specified key, replacing any existing values.
     *
     * @param key - The key of the value to set.
     * @param value - The value to set.
     *
     * @returns This {@link MultiMap} instance for chaining purposes.
     */
    set(key: K, value: V): this;

    /**
     * Sets multiple values associated with the specified key, replacing any existing values.
     *
     * @param key - The key of the values to set.
     * @param value - The iterable of values to set.
     *
     * @returns This {@link MultiMap} instance for chaining purposes.
     */
    set(key: K, value: Iterable<V>): this;

    /**
     * Sets a single value or multiple values associated with the specified key, replacing any existing values.
     *
     * @param key - The key of the value to set.
     * @param value - The value or values to set.
     *
     * @returns This {@link MultiMap} instance for chaining purposes.
     */
    set(key: K, value: V | Iterable<V>): this {
        const values = typeof value !== "string" && isIterable(value) ? asArray(value) : [value];
        return super.set(key, values);
    }

    /**
     * Appends a single value to the values associated with the specified key.
     *
     * @param key - The key of the value to append.
     * @param value - The value to append.
     *
     * @returns This {@link MultiMap} instance for chaining purposes.
     */
    append(key: K, value: V): this;

    /**
     * Appends multiple values to the values associated with the specified key.
     *
     * @param key - The key of the values to append.
     * @param value - The iterable of values to append.
     *
     * @returns This {@link MultiMap} instance for chaining purposes.
     */
    append(key: K, value: Iterable<V>): this;

    /**
     * Appends a single value or multiple values to the values associated with the specified key.
     *
     * @param key - The key of the values to append.
     * @param value - The iterable of values to append.
     *
     * @returns This {@link MultiMap} instance for chaining purposes.
     */
    append(key: K, value: V | Iterable<V>): this {
        const existingValues = this.get(key);
        if (!existingValues) {
            return this.set(key, value as V);
        }

        if (typeof value !== "string" && isIterable(value)) {
            existingValues.push(...value);
        } else {
            existingValues.push(value);
        }
        return this;
    }

    /**
     * Removes all values associated with the specified key.
     *
     * @param key - The key of the values to remove.
     *
     * @returns `true` if values were found and removed; otherwise, `false`.
     */
    delete(key: K): boolean;

    /**
     * Removes a specific value associated with the specified key using the optional comparer.
     *
     * @param key - The key of the value to remove.
     * @param value - The value to remove.
     * @param comparer - The optional equality comparer to use for comparing values.
     *
     * @returns `true` if the value was found and removed; otherwise, `false`.
     */
    delete(key: K, value: V, comparer?: EqualityComparer<V>): boolean;

    /**
     * Removes value/values associated with the specified key.
     *
     * @param key - The key of the values to remove.
     * @param value - The value to remove.
     * @param comparer - The optional equality comparer to use for comparing values.
     *
     * @returns `true` if value/values were found and removed; otherwise, `false`.
     */
    delete(key: K, value?: V, comparer?: EqualityComparer<V>): boolean {
        if (value === undefined) {
            return super.delete(key);
        }

        const values = this.get(key);
        if (!values) {
            return false;
        }

        const i = $i(values).indexOf(value, comparer);
        if (i === -1) {
            return false;
        }

        values.splice(i, 1);
        return true;
    }

    /**
     * Returns an iterable of all values in the MultiMap.
     */
    flatValues(): Iterable<V> {
        return $i(this.values()).flatMap(x => x);
    }

    /**
     * Returns an iterable of key-value pairs in the MultiMap, where each key is associated with a single value.
     */
    flatEntries(): Iterable<[K, V]> {
        return $i(this.entries()).flatMap(([key, values]) => $i(values).map(value => [key, value]));
    }

    /**
     * Calls the specified callback function for each key-value pair in the MultiMap, with each key associated with a single value.
     *
     * @param callbackFn - This function is called one time for each key-value pair in the MultiMap. It takes the value, key, and the MultiMap itself as arguments.
     * @param thisArg - An optional object to which `this` keyword can refer in the `callbackFn` function.
     */
    forEachFlat(callbackFn: (value: V, key: K, map: MultiMap<K, V>) => void, thisArg?: unknown): void {
        callbackFn = thisArg === undefined ? callbackFn : callbackFn.bind(thisArg);

        for (const [key, value] of this.flatEntries()) {
            callbackFn(value, key, this);
        }
    }
}
