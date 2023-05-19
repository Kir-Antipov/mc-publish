import { NamedType, TypeOf, TypeOfResult } from "@/utils/types";
import { BigIntDescriptor } from "./bigint-descriptor";
import { BooleanDescriptor } from "./boolean-descriptor";
import { NumberDescriptor } from "./number-descriptor";
import { StringDescriptor } from "./string-descriptor";

/**
 * Interface that defines operations that should be implemented by an underlying type of an `Enum`.
 *
 * @template T - The underlying type that the enum is based on.
 */
export interface EnumDescriptor<T> {
    /**
     * Gets the name of the underlying type.
     */
    get name(): TypeOf<T>;

    /**
     * Gets the default value for the underlying type.
     */
    get defaultValue(): T;

    /**
     * Determines if a value has a specific flag.
     *
     * @param value - The value to check.
     * @param flag - The flag to check for.
     *
     * @returns A boolean indicating whether the value has the specified flag.
     */
    hasFlag(value: T, flag: T): boolean;

    /**
     * Adds a flag to a value.
     *
     * @param value - The value to add the flag to.
     * @param flag - The flag to add.
     *
     * @returns The updated value with the added flag.
     */
    addFlag(value: T, flag: T): T;

    /**
     * Removes a flag from a value.
     *
     * @param value - The value to remove the flag from.
     * @param flag - The flag to remove.
     *
     * @returns The updated value with the removed flag.
     */
    removeFlag(value: T, flag: T): T;
}

/**
 * A map of known `EnumDescriptor`s, keyed by the string representation of their underlying type.
 */
const KNOWN_ENUM_DESCRIPTORS = new Map<TypeOfResult, EnumDescriptor<unknown>>([
    ["bigint", new BigIntDescriptor()],
    ["boolean", new BooleanDescriptor()],
    ["number", new NumberDescriptor()],
    ["string", new StringDescriptor()],
]);

/**
 * Gets the {@link EnumDescriptor} for the provided type name.
 *
 * @template T - The type of the result to return
 * @param type - The name of the type to get the descriptor for
 *
 * @returns The descriptor for the specified type, or `undefined` if there is no such descriptor.
 */
export function getEnumDescriptorByUnderlyingType<T extends TypeOfResult>(type: T): EnumDescriptor<NamedType<T>> | undefined {
    return KNOWN_ENUM_DESCRIPTORS.get(type) as EnumDescriptor<NamedType<T>>;
}

/**
 * Infers the descriptor for an enum based on its values.
 *
 * @template T - Type of the enum.
 *
 * @param values - The values of the enum.
 *
 * @returns The inferred descriptor for the enum.
 *
 * @throws An error if the enum contains objects of different types or an invalid underlying type.
 */
export function inferEnumDescriptorOrThrow<T>(values: readonly T[]): EnumDescriptor<T> | never {
    if (!values.every((x, i, self) => i === 0 || typeof x === typeof self[i - 1])) {
        throw new Error("The enum must contain objects of the same type.");
    }

    const underlyingType = values.length ? typeof values[0] : "number";
    const descriptor = getEnumDescriptorByUnderlyingType(underlyingType) as EnumDescriptor<T>;
    if (!descriptor) {
        throw new Error(`'${underlyingType}' is not an acceptable enum type.`);
    }

    return descriptor;
}
