import { IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER, IGNORE_CASE_EQUALITY_COMPARER, IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER, ORDINAL_EQUALITY_COMPARER } from "@/utils/comparison";
import { EnumDescriptor, getEnumDescriptorByUnderlyingType } from "./descriptors";
import { ConstructedEnum, DynamicEnum, DynamicEnumOptions } from "./dynamic-enum";
import { enumKeys } from "./enum-key";
import { enumValues } from "./enum-value";
import { enumEntries } from "./enum-entry";

/**
 * The options to use when creating the new enum.
 */
export interface EnumOptions extends DynamicEnumOptions {
    /**
     * Indicates whether to ignore the case when comparing enum keys.
     */
    ignoreCase?: boolean;

    /**
     * Indicates whether to ignore non-word characters when comparing enum keys.
     */
    ignoreNonWordCharacters?: boolean;
}

/**
 * Determines whether the given `value` contains the specified `flag`.
 *
 * @template T - Type of the enum.
 *
 * @param value - The value to check for the presence of the flag.
 * @param flag - The flag to check for.
 *
 * @returns `true` if the value has the flag; otherwise, `false`.
 */
export function hasFlag<T>(value: T, flag: T): boolean {
    const descriptor = getEnumDescriptorByUnderlyingType(typeof flag) as EnumDescriptor<T>;
    return !!descriptor?.hasFlag(value, flag);
}

/**
 * Creates a new enum object from the specified `enumFactory` with the specified `options`.
 *
 * @template T - Type of the enum.
 *
 * @param enumFactory - The enum factory to use for the new enum.
 * @param options - The options to use when creating the new enum.
 *
 * @returns The constructed enum object.
 */
export function createEnum<T>(enumFactory: () => T, options?: EnumOptions): ConstructedEnum<T>;

/**
 * Creates a new enum object from the specified `enumFactory` with the specified `options`.
 *
 * @template T - Type of the enum.
 *
 * @param enumFactory - The enum factory to use for the new enum.
 * @param options - The options to use when creating the new enum.
 *
 * @returns The constructed enum object.
 */
export function createEnum<T, U>(enumFactory: () => T, options: EnumOptions, methods: U): ConstructedEnum<T> & Readonly<U>;

/**
 * Creates a new enum object from the specified underlying enum with the specified `options`.
 *
 * @template T - Type of the enum.
 *
 * @param underlyingEnum - The underlying enum to use for the new enum.
 * @param options - The options to use when creating the new enum.
 *
 * @returns The constructed enum object.
 */
export function createEnum<T>(underlyingEnum: T, options?: EnumOptions): ConstructedEnum<T>;

/**
 * Creates a new enum object from the specified underlying enum with the specified `options`.
 *
 * @template T - Type of the enum.
 *
 * @param underlyingEnum - The underlying enum to use for the new enum.
 * @param options - The options to use when creating the new enum.
 *
 * @returns The constructed enum object.
 */
export function createEnum<T, U>(underlyingEnum: T, options: EnumOptions, methods: U): ConstructedEnum<T> & Readonly<U>;

/**
 * Creates a new enum object from the specified `enumFactory` or `underlyingEnum` with the specified `options`.
 *
 * @template T - Type of the enum.
 *
 * @param e - The enum factory or underlying enum to use for the new enum.
 * @param options - The options to use when creating the new enum.
 *
 * @returns The constructed enum object.
 */
export function createEnum<T>(e: T | (() => T), options?: EnumOptions, methods?: unknown): ConstructedEnum<T> {
    const underlyingEnum = typeof e === "function" ? (e as () => T)() : e;
    const dynamicEnumOptions = toDynamicEnumOptions(options);

    const dynamicEnum = DynamicEnum.create(underlyingEnum, dynamicEnumOptions);
    if (methods) {
        Object.assign(dynamicEnum, methods);
    }

    return dynamicEnum;
}

/**
 * Converts specified `options` into an instance acceptable by the {@link DynamicEnum}'s constructor.
 *
 * @param options - The options to be converted.
 *
 * @returns The options acceptable by the {@link DynamicEnum}'s constructor.
 */
function toDynamicEnumOptions(options?: EnumOptions): DynamicEnumOptions {
    if (!options || (options as DynamicEnumOptions).comparer) {
        return options;
    }

    const o = options as EnumOptions;
    const comparer = o.ignoreCase ? o.ignoreNonWordCharacters
        ? IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER
        : IGNORE_CASE_EQUALITY_COMPARER
            : o.ignoreNonWordCharacters
                ? IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER
                : ORDINAL_EQUALITY_COMPARER;

    return { ...o, comparer };
}

/**
 * An object that emulates the `Object` API for `Enum` objects.
 */
export const Enum = {
    hasFlag,
    create: createEnum,
    keys: enumKeys,
    values: enumValues,
    entries: enumEntries,
} as const;

/**
 * A type that extracts definition of the original enum
 * from the dynamically created one.
 *
 * @template T - Type of the dynamically created enum.
 */
export type Enum<T> = {
    [K in keyof T]: K extends "size" | "underlyingType" | typeof Symbol.toStringTag
        ? never
        : T[K] extends (...args: unknown[]) => unknown
            ? never
            : T[K];
}[keyof T];
