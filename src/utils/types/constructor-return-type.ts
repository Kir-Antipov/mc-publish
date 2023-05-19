/**
 * Obtains the return type of a constructor function.
 *
 * @template T - The constructor function.
 */
export type ConstructorReturnType<T extends new (...args: unknown[]) => unknown> = T extends new () => infer R ? R : never;
