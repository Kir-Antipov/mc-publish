/**
 * Returns `T` if it extends `PropertyKey`; otherwise, returns `never`.
 *
 * This is useful to lift the constraints from a record key.
 *
 * @template T - The type to check if it extends `PropertyKey`.
 */
export type RecordKey<T> = T extends PropertyKey ? T : never;
