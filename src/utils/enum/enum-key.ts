import { isReadOnlyMap } from "@/utils/collections";

/**
 * A type that represents the key of an enum type `T`.
 *
 * @template T - The enum type whose keys are being represented.
 */
export type EnumKey<T> = keyof T extends string ? keyof T : never;

/**
 * Retrieves an array of the string keys of the specified `enum` object.
 *
 * @template T - Type of the enum.
 *
 * @param e - The enum object to retrieve the keys for.
 *
 * @returns An array of the string keys of the specified `enum` object.
 */
export function enumKeys<T>(e: T): EnumKey<T>[] {
    if (isReadOnlyMap<EnumKey<T>, unknown>(e)) {
        return [...e.keys()];
    }

    return Object.getOwnPropertyNames(e).filter(key => isEnumKey(e, key)) as EnumKey<T>[];
}

/**
 * Determines if the provided key is an enumeration key.
 *
 * @template T - Type of the enum.
 *
 * @param e - The enum object to check the key against.
 * @param key - The key to be checked.
 *
 * @returns `true` if the key is an enumeration key; otherwise, `false`.
 */
function isEnumKey<T>(e: T, key: string): key is EnumKey<T> {
    return typeof e[key] !== "function" && key !== String(+key);
}
