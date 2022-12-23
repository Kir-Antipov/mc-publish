/**
 * Represents a type that can either be a value of type `T` or a promise of type `T`.
 *
 * @template T - The type of value that may be awaited.
 */
export type Awaitable<T> = T | Promise<T>;
