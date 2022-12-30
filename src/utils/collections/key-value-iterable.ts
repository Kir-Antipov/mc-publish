/**
 * Represents an object that contains key-value pairs and exposes an `entries()` method
 * to iterate over those pairs.
 */
export interface KeyValueIterable<K, V> {
    /**
     * Returns an iterable containing the key-value pairs of the object.
     */
    entries(): Iterable<[K, V]>;
}

/**
 * Type guard to check if the given object implements the {@link KeyValueIterable} interface.
 *
 * @template K - The key type.
 * @template V - The value type.
 *
 * @param obj - The object to check.
 *
 * @returns `true` if the object implements the {@link KeyValueIterable} interface; otherwise, `false`.
 */
export function isKeyValueIterable<K, V>(obj: unknown): obj is KeyValueIterable<K, V> {
    return typeof (obj as KeyValueIterable<K, V>)?.entries === "function";
}
