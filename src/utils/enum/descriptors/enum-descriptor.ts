import { NamedType, TypeOf, TypeOfResult } from "@/utils/types";

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
