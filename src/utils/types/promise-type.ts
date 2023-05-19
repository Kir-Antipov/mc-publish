/**
 * Obtains the underlying type of a {@link Promise}.
 *
 * @template T - A `Promise` type to extract the underlying type from.
 */
export type PromiseType<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never;
