import { isReadOnlyMap } from "@/utils/collections";
import { EnumKey, enumKeys } from "./enum-key";
import { EnumValue } from "./enum-value";

/**
 * Represents an entry in an enum, where the first element is the key and the second element is the value.
 *
 * @template T - Type of the enum.
 */
export type EnumEntry<T> = [EnumKey<T>, EnumValue<T>];

/**
 * Retrieves an array of the entries of the specified `enum` object.
 *
 * @template T - Type of the enum.
 *
 * @param e - The enum object to retrieve the entries for.
 *
 * @returns An array of the entries of the specified `enum` object.
 */
export function enumEntries<T>(e: T): [EnumKey<T>, EnumValue<T>][] {
    if (isReadOnlyMap<EnumKey<T>, EnumValue<T>>(e)) {
        return [...e.entries()];
    }

    return enumKeys(e).map(key => [key, e[key]]);
}
