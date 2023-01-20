import { isReadOnlyMap } from "@/utils/collections";
import { EnumKey, enumKeys } from "./enum-key";

/**
 * Extracts the type of values stored in an enum.
 *
 * @template T - The type of the enum.
 */
export type EnumValue<T> = T[keyof T];

/**
 * Retrieves an array of the values of the specified `enum` object.
 *
 * @template T - Type of the enum.
 *
 * @param e - The enum object to retrieve the values for.
 *
 * @returns An array of the values of the specified `enum` object.
 */
export function enumValues<T>(e: T): EnumValue<T>[] {
    if (isReadOnlyMap<EnumKey<T>, EnumValue<T>>(e)) {
        return [...e.values()];
    }

    return enumKeys(e).map(key => e[key]);
}
