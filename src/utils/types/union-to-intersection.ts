/**
 * Converts a union type to an intersection type.
 *
 * This type takes advantage of TypeScript's inference and distributive conditional types.
 * It starts by using a mapped type to distribute the conditional type over the union type `T`.
 * For each distributed type, it creates a function type with the type parameter as its argument.
 * Then, it infers the intersection type `U` by analyzing the compatibility of the function types.
 * The process results in an intersection type representing the combination of all distributed types.
 *
 * @template T - The union type to be converted into an intersection type.
 *
 * @returns The intersection type created from the union type `T`.
 */
export type UnionToIntersection<T> = (
    T extends unknown ? (x: T) => void : never
) extends (x: infer U) => void ? U : never;
