/**
 * Represents a record object where all properties are optional.
 */
export type PartialRecord<K extends PropertyKey, V> = Partial<Record<K, V>>;
