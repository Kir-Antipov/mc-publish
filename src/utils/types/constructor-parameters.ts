/**
 * Obtains the parameters of a constructor function.
 *
 * @template T - The constructor function.
 */
export type ConstructorParameters<T extends new (...args: unknown[]) => unknown> = T extends new (...args: infer P) => unknown ? P : never;
