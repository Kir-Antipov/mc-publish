import { $i } from "@/utils/collections/iterable";
import { Func } from "@/utils/functions/func";
import { getAllNames, getSafe } from "@/utils/reflection/object-reflector";
import { stringEquals } from "@/utils/string-utils";
import { NamedType, TypeOfResult } from "@/utils/types";

/**
 * Represents a function that converts a value to some target type.
 *
 * @template TInput - The input data type.
 * @template UTarget - The target data type.
 * @template ROutput - The output data type.
 */
export interface Converter<TInput = unknown, UTarget = unknown, ROutput = unknown> {
    /**
     * Converts a value to some target type.
     *
     * @param value - The value to convert.
     * @param target - The target type of the conversion.
     *
     * @returns The converted value.
     */
    (value: TInput, target: UTarget): ROutput;
}

/**
 * Returns whether the given `obj` is `null`, `undefined`, or `NaN`.
 *
 * @param obj - The object to check.
 *
 * @returns `true` if the `obj` is `null`, `undefined`, or `NaN`; otherwise, `false`.
 */
function isInvalid(obj: unknown): boolean {
    return obj === null || obj === undefined || typeof obj === "number" && isNaN(obj);
}

/**
 * Always returns `undefined`, ignoring the input value.
 *
 * @param _obj - The input value to ignore.
 *
 * @returns `undefined`.
 */
export function toUndefined(_obj: unknown): undefined {
    return undefined;
}

/**
 * Converts the given `obj` to a string.
 *
 * @param obj - The object to convert.
 *
 * @returns The string representation of `obj`, or `undefined` if the input is `null`, `undefined`, or `NaN`.
 */
export function toString(obj: unknown): string {
    return isInvalid(obj) ? undefined : String(obj);
}

/**
 * Converts an input value to a boolean value.
 *
 * @param obj - The object to convert.
 *
 * @returns The converted boolean value, or `undefined` if the input value cannot be converted to boolean.
 */
export function toBoolean(obj: unknown): boolean {
    if (isInvalid(obj)) {
        return undefined;
    }

    switch (typeof obj) {
        case "boolean":
            return !!obj;

        case "number":
            return obj !== 0;

        case "string":
            if (stringEquals("true", obj, { ignoreCase: true })) {
                return true;
            }
            if (stringEquals("false", obj, { ignoreCase: true })) {
                return false;
            }
            break;

        default:
            return undefined;
    }

    // ESLint
    return undefined;
}

/**
 * Converts an input value to a number type.
 *
 * @param obj - The input value to be converted.
 * @param parser - A function to parse the input value.
 *
 * @returns The converted number value, or `undefined` if the input value cannot be converted to a number type.
 */
function toNumber(obj: unknown, parser: (value: string | number) => number): number {
    if (isInvalid(obj)) {
        return undefined;
    }

    switch (typeof obj) {
        case "number":
            return parser(obj);

        case "boolean":
            return obj ? 1 : 0;

        case "string":
            const parsedNumber = parser(obj);
            return isNaN(parsedNumber) ? undefined : parsedNumber;

        case "object":
            if (obj instanceof Date && !isNaN(obj.getTime())) {
                return obj.getTime();
            }
            break;

        default:
            return undefined;
    }

    // ESLint
    return undefined;
}

/**
 * Converts an input value to an integer number.
 *
 * @param obj - The input value to be converted.
 *
 * @returns The converted integer number value, or `undefined` if the input value cannot be converted to an integer number type.
 */
export function toInteger(obj: unknown): number {
    return toNumber(obj, parseInt);
}

/**
 * Converts an input value to a floating-point number.
 *
 * @param obj - The input value to be converted.
 *
 * @returns The converted floating-point number value, or `undefined` if the input value cannot be converted to a floating-point number type.
 */
export function toFloat(obj: unknown): number {
    return toNumber(obj, parseFloat);
}

/**
 * Converts a value to a {@link Date}.
 *
 * @param obj - The value to convert.
 *
 * @returns The converted {@link Date}, or `undefined` if the value is invalid.
 */
export function toDate(obj: unknown): Date {
    if (isInvalid(obj)) {
        return undefined;
    }

    switch (typeof obj) {
        case "object":
            if (obj instanceof Date && !isNaN(obj.getTime())) {
                return obj;
            }
            break;

        case "string":
        case "number":
            const date = new Date(obj);
            return isNaN(date.getTime()) ? undefined : date;

        default:
            return undefined;
    }

    // ESLint
    return undefined;
}

/**
 * The regular expression used to parse a string representation of a regex into its pattern and flags parts.
 */
const REGEX_PARSER_REGEX = /\/(?<pattern>.*)\/(?<flags>[a-z]*)/;

/**
 * Converts a value to a {@link RegExp}.
 *
 * @param obj - The value to convert.
 *
 * @returns A {@link RegExp} representing the given `obj`, or `undefined` if the input is invalid or cannot be converted to a regex.
 */
export function toRegExp(obj: unknown): RegExp | undefined {
    if (obj instanceof RegExp) {
        return obj;
    }

    if (typeof obj !== "string") {
        return undefined;
    }

    const match = obj.match(REGEX_PARSER_REGEX);
    if (!match) {
        return undefined;
    }

    try {
        return new RegExp(match.groups.pattern, match.groups.flags);
    } catch {
        return undefined;
    }
}

/**
 * A type alias for `globalThis`, the global object in a runtime environment.
 */
type GlobalThis = typeof globalThis;

/**
 * A constructor function that creates instances of a given type.
 */
type Constructor<T> = new (...args: unknown[]) => T;

/**
 * Represents the return type of a constructor function.
 *
 * @template T - The constructor function to extract the return type from.
 */
type ConstructorReturnType<T> = T extends Constructor<infer U> ? U : never;

/**
 * Represents a member of the `globalThis` object that can be constructed.
 *
 * @template T - The name of the member of the `globalThis` object to check for constructibility.
 */
type ConstructibleGlobalThisMember<T extends keyof GlobalThis> = GlobalThis[T] extends Constructor<unknown> ? T : never;

/**
 * The prefixes that indicate a method is a conversion method.
 */
const CONVERT_METHOD_PREFIXES = ["convert", "from"] as const;

/**
 * A function that converts an unknown value to a typed value of a given type.
 */
type Convert<T> = (obj: unknown) => T;

/**
 * Obtains the type of a method on a class or object that performs a conversion using a {@link Convert} function.
 */
type ConvertMethod<T> = {
    [K in keyof T]: T[K] extends Convert<unknown>
        ? K extends `${typeof CONVERT_METHOD_PREFIXES[number]}${string}`
            ? T[K]
            : never
        : never;
}[keyof T];

/**
 * A type that is convertible if it has at least one method that performs a conversion using a {@link Convert} function.
 */
type Convertible<T> = ConvertMethod<T> extends never ? never : T;

/**
 * Represents a member of the `globalThis` object that is "convertible" based on whether it has at least one method that performs conversion using a {@link Convert} function.
 *
 * @template T - The name of the member of the `globalThis` object to check for convertibility.
 */
type ConvertibleGlobalThisMember<T extends keyof GlobalThis> = ConvertMethod<GlobalThis[T]> extends never ? never : T;

/**
 * The prefixes that indicate a method is a parsing method.
 */
const PARSE_METHOD_PREFIXES = ["parse"] as const;

/**
 * A function that parses a string and returns a value of a given type.
 */
type Parse<T> = (pattern: string) => T;

/**
 * Obtains the type of a method on a class or object that performs parsing using a {@link Parse} function.
 */
type ParseMethod<T> = {
    [K in keyof T]: T[K] extends Parse<unknown>
        ? K extends `${typeof PARSE_METHOD_PREFIXES[number]}${string}`
            ? T[K]
            : never
        : never;
}[keyof T];

/**
 * Represents a type `T` which is considered "parsable" if it has at least one method that performs parsing using a {@link Parse} function.
 */
type Parsable<T> = ParseMethod<T> extends never ? never : T;

/**
 * Represents a member of the `globalThis` object that is "parsable" based on whether it has at least one method that performs parsing using a {@link Parse} function.
 *
 * @template T - The name of the member of the `globalThis` object to check for parsability.
 */
type ParsableGlobalThisMember<T extends keyof GlobalThis> = ParseMethod<GlobalThis[T]> extends never ? never : T;

/**
 * Retrieves a `Converter` function from the given object, if one is defined.
 *
 * @param obj - The object to retrieve the `Converter` function from.
 * @param prioritizeParsing - Indicates wether the parsing should be prioritized.
 *
 * @returns A `Converter` function that can convert an unknown value to the target type `T`, or `undefined` if none was found.
 */
function getConverter<T>(obj: unknown, prioritizeParsing?: boolean): Convert<T> | undefined {
    const strategies = [
        [CONVERT_METHOD_PREFIXES],
        [PARSE_METHOD_PREFIXES, (parser: Func) => (x: unknown) => typeof x === "string" ? parser(x) : undefined],
    ] as const;

    const resolvedStrategies = prioritizeParsing ? [...strategies].reverse() : strategies;

    for (const [prefixes, mapper] of resolvedStrategies) {
        const parseLike = getParseLikeFunction(obj, prefixes);
        if (!parseLike) {
            continue;
        }

        const mapped = mapper ? mapper(parseLike) : parseLike;
        return mapped as Convert<T>;
    }

    return undefined;
}

/**
 * Attempts to retrieve a parsing method from the given object using the specified prefixes.
 *
 * @param obj - The object to retrieve the method from.
 * @param prefixes - The list of method name prefixes to search for.
 *
 * @returns The first matching parse-like function that was found, or `undefined` if none were found.
 */
function getParseLikeFunction(obj: unknown, prefixes: readonly string[]): (obj: unknown) => unknown {
    // If the object is invalid, return undefined.
    if (isInvalid(obj)) {
        return undefined;
    }

    // If the object has a method named exactly like one of the given prefix, we should use it.
    const prioritizedParseMethodName = $i(prefixes).first(x => typeof getSafe(obj, x) === "function");
    if (prioritizedParseMethodName) {
        return x => obj[prioritizedParseMethodName](x);
    }

    // Find all method names on the object that start with one of the specified prefixes.
    const propertyNames = getAllNames(obj);
    const parseMethodNames = $i(propertyNames).filter(x => prefixes.some(p => x.startsWith(p) && typeof getSafe(obj, x) === "function"));

    // Determine the first parse-like method name by sorting them based on prefix precedence and taking the first result.
    const firstParseMethodName = $i(parseMethodNames).min(
        (a, b) => prefixes.findIndex(p => a.startsWith(p)) - prefixes.findIndex(p => b.startsWith(p))
    );

    // If no parse-like method names were found, return undefined.
    if (!firstParseMethodName) {
        return undefined;
    }

    // Return a function that invokes the first parse-like method with the specified input.
    return x => obj[firstParseMethodName](x);
}

/**
 * Map of known constructors and their corresponding converters.
 */
const KNOWN_CONSTRUCTORS = new Map<Constructor<unknown>, Convert<unknown>>([
    [String, toString],
    [Number, toFloat],
    [Boolean, toBoolean],
    [Date, toDate],
    [RegExp, toRegExp],
]);

/**
 * Map of known types and their corresponding converters.
 */
const KNOWN_TYPES = new Map<TypeOfResult, Convert<unknown>>([
    ["string", toString],
    ["number", toFloat],
    ["boolean", toBoolean],
    ["undefined", toUndefined],
]);

/**
 * Converts a given object to the target type.
 *
 * @template T - The type of the returned value.
 * @param obj - Value to be converted.
 * @param type - Name of the type to convert the value to.
 *
 * @returns The converted value, or `undefined` if the conversion fails.
 */
export function toType<T extends TypeOfResult>(obj: unknown, type: T): NamedType<T>;

/**
 * Converts a given object to the target type.
 *
 * @template T - A key of the `globalThis` object that represents the type to convert to, which must be a constructible type.
 *
 * @param obj - The unknown value to convert.
 * @param type - The name of the constructor function corresponding to the target type `T`.
 *
 * @returns The converted value, or `undefined` if the conversion fails.
 */
export function toType<T extends keyof GlobalThis>(obj: unknown, type: T & ConstructibleGlobalThisMember<T>): ConstructorReturnType<GlobalThis[T]>;

/**
 * Converts a given object to the target type.
 *
 * @template T - A key of the `globalThis` object that represents the type to convert to, which must have at least one method with a signature that matches the {@link ConvertMethod} type.
 *
 * @param obj - The unknown value to convert.
 * @param type - The name of the convertible method corresponding to the target type `T`.
 *
 * @returns The converted value, or `undefined` if the conversion fails.
 */
export function toType<T extends keyof GlobalThis>(obj: unknown, type: T & ConvertibleGlobalThisMember<T>): ReturnType<ConvertMethod<GlobalThis[T]>>;

/**
 * Parses the given string as the target type.
 *
 * @template T - A key of the `globalThis` object that represents the type to convert to, which must have at least one method with a signature that matches the {@link ParseMethod} type.
 *
 * @param obj - The string to parse and convert.
 * @param type - The name of the parsing method corresponding to the target type `T`.
 *
 * @returns The parsed value, or `undefined` if the parsing fails.
 */
export function toType<T extends keyof GlobalThis>(obj: string, type: T & ParsableGlobalThisMember<T>): ReturnType<ParseMethod<GlobalThis[T]>>;

/**
 * Converts a given object to the target type.
 *
 * @template T - The type of the returned value.
 * @param obj - Value to be converted.
 * @param convertible - Convertible type to convert the value to.
 *
 * @returns The converted value, or `undefined` if the conversion fails.
 */
export function toType<T>(obj: unknown, convertible: T & Convertible<T>): ReturnType<ConvertMethod<T>>;

/**
 * Parses the given string as the target type.
 *
 * @template T - The type of the returned value.
 * @param s - String to be parsed.
 * @param parsable - Parsable type to convert the value to.
 *
 * @returns The parsed value, or `undefined` if the parsing fails.
 */
export function toType<T>(s: string, parsable: T & Parsable<T>): ReturnType<ParseMethod<T>>;

/**
 * Converts a given object to the target type.
 *
 * @template T - The type of the returned value.
 * @param obj - Value to be converted.
 * @param constructor - Constructor of the type to convert the value to.
 *
 * @returns The converted value, or `undefined` if the conversion fails.
 */
export function toType<T>(obj: unknown, constructor: Constructor<T>): T;

/**
 * A function that converts an unknown object to an unknown target type.
 *
 * @template T - The type to convert the value to.
 * @param obj - The value to convert.
 * @param target - The type or constructor function to use for the conversion.
 *
 * @returns The converted value of type `T`, or `undefined` if the conversion fails.
 */
export function toType<T = unknown>(obj: unknown, target: unknown): T;

/**
 * Converts an object to the specified target type.
 *
 * @param obj - The object to convert.
 * @param target - The target type to convert to.
 *
 * @returns An object of the specified target type, or `undefined` if the conversion failed.
 */
export function toType(obj: unknown, target: unknown): unknown {
    // If the input object is invalid, return undefined.
    if (isInvalid(obj)) {
        return undefined;
    }

    if (typeof target === "string") {
        // If the target is a string representing a known type, use the corresponding conversion function.
        const knownConverter = KNOWN_TYPES.get(target as TypeOfResult);
        if (knownConverter) {
            return knownConverter(obj);
        }

        // If the target is a key of the `globalThis` object, convert the input to its type.
        const globalThisMember = globalThis[target];
        if (globalThisMember) {
            return toType(obj, globalThisMember);
        }

        return undefined;
    }

    // If the target is a known constructor function, use its corresponding conversion function.
    if (typeof target === "function" && KNOWN_CONSTRUCTORS.has(target as Constructor<unknown>)) {
        const knownConverter = KNOWN_CONSTRUCTORS.get(target as Constructor<unknown>);
        return knownConverter(obj);
    }

    try {
        // Attempt to retrieve a converter function from the target type.
        const converter = getConverter(target, typeof obj === "string");

        // If the converter function was found, use it to convert the input object.
        if (converter !== undefined) {
            const converted = converter(obj);
            return isInvalid(converted) ? undefined : converted;
        }

        // If no converter function was found, assume that target is a constructor,
        // since we've exhausted every over possibility.
        return new (target as Constructor<unknown>)(obj);
    } catch {
        // If an error occurs during conversion, return undefined.
        return undefined;
    }
}
