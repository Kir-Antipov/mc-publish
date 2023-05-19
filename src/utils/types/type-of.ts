/**
 * Transpile-time version of the `typeof` operator.
 *
 * @template T - The type of the input value.
 *
 * @returns
 * - "undefined" if the input value is `undefined` or `null` (there's nothing I can do about it)
 * - "string" if it's a `string`
 * - "number" if it's a `number`
 * - "bigint" if it's a `bigint`
 * - "boolean" if it's a `boolean`
 * - "symbol" if it's a `symbol`
 * - "function" if it's a `Function`
 * - "object" if it's an `object`
 */
export type TypeOf<T> =
    T extends undefined ? "undefined" :
    T extends string ? "string" :
    T extends number ? "number" :
    T extends bigint ? "bigint" :
    T extends boolean ? "boolean" :
    T extends symbol ? "symbol" :
    T extends (...args: unknown[]) => unknown ? "function" :
    T extends object ? "object" :
    TypeOfResult;

/**
 * This constant is used to infer the type of the `typeof` operator's result.
 */
const _inferredTypeOfTypeOf = typeof (undefined as unknown);

/**
 * The type of `typeof` operator's result.
 */
export type TypeOfResult = typeof _inferredTypeOfTypeOf;

/**
 * A map of the all possible types that can be returned by `typeof`.
 */
interface TypeMap {
    string: string;
    number: number;
    bigint: bigint;
    boolean: boolean;
    symbol: symbol;
    undefined: undefined;
    object: object;
    function: (...args: unknown[]) => unknown;
}

/**
 * Returns the corresponding type for a given `TypeOfResult`.
 *
 * @template T - The input `TypeOfResult`.
 */
export type NamedType<T extends TypeOfResult> = TypeMap[T];
