import { $i } from "@/utils/collections";
import { EqualityComparer, ORDINAL_EQUALITY_COMPARER } from "@/utils/comparison";
import { toType } from "@/utils/convert";
import { split, toPascalCase } from "@/utils/string-utils";
import { TypeOf } from "@/utils/types";
import { EnumDescriptor, inferEnumDescriptorOrThrow } from "./descriptors";
import { EnumEntry, enumEntries } from "./enum-entry";
import { EnumKey } from "./enum-key";
import { DEFAULT_ENUM_SEPARATOR, ENUM_SEPARATORS } from "./enum-separators";
import { EnumValue } from "./enum-value";

/**
 * Options for constructing a dynamic enum.
 */
export interface DynamicEnumOptions {
    /**
     * Specifies whether the enum should be treated as a set of flags.
     */
    hasFlags?: boolean;

    /**
     * The equality comparer used to compare enum keys.
     */
    comparer?: EqualityComparer<string>;

    /**
     * An iterable of tuples containing enum keys and their corresponding display names.
     *
     * The display names can be used for more human-readable representations of the enum keys.
     */
    names?: Iterable<readonly [string, string]>;
}

/**
 * A dynamic enum implementation that allows you to create an enum at runtime.
 *
 * @template T - The type of the enum.
 */
export class DynamicEnum<T> implements ReadonlyMap<EnumKey<T>, EnumValue<T>> {
    /**
     * An array of enum keys.
     */
    private readonly _keys: readonly EnumKey<T>[];

    /**
     * An array of enum values.
     */
    private readonly _values: readonly EnumValue<T>[];

    /**
     * A map containing the enum keys and their corresponding display names.
     */
    private readonly _names: ReadonlyMap<string, string>;

    /**
     * The enum descriptor.
     */
    private readonly _descriptor: EnumDescriptor<EnumValue<T>>;

    /**
     * A boolean indicating whether the enum should be treated as a set of flags.
     */
    private readonly _hasFlags: boolean;

    /**
     * The equality comparer used to compare enum keys.
     */
    private readonly _comparer: EqualityComparer<string>;

    /**
     * Constructs a new {@link DynamicEnum} instance.
     *
     * @param entries - An array of key-value pairs representing the entries of the enum.
     * @param options - An object containing options for the `DynamicEnum` instance, such as whether the enum is a flags enum.
     */
    private constructor(entries: readonly EnumEntry<T>[], options?: DynamicEnumOptions) {
        this._keys = entries.map(([key]) => key);
        this._values = entries.map(([, value]) => value);
        this._names = new Map(options?.names || []);
        this._descriptor = inferEnumDescriptorOrThrow(this._values);
        this._hasFlags = options?.hasFlags ?? false;
        this._comparer = options?.comparer || ORDINAL_EQUALITY_COMPARER;

        const properties = $i(entries).map(([key, value]) => [key, { value, enumerable: true }] as const).toRecord();
        Object.defineProperties(this, properties);
    }

    /**
     * Creates a dynamic enum from an existing enum object.
     *
     * @param underlyingEnum - The underlying enum object.
     * @param options - The options to use when creating the new enum.
     *
     * @returns A new dynamic enum.
     */
    static create<TEnum>(underlyingEnum: TEnum, options?: DynamicEnumOptions): ConstructedEnum<TEnum> {
        const entries = enumEntries(underlyingEnum);
        return new DynamicEnum(entries, options) as ConstructedEnum<TEnum>;
    }

    /**
     * Returns a string representation of this object.
     */
    get [Symbol.toStringTag](): string {
        return "Enum";
    }

    /**
     * The number of values in the enum.
     */
    get size(): number {
        return this._keys.length;
    }

    /**
     * The underlying type of the enum.
     */
    get underlyingType(): TypeOf<EnumValue<T>> {
        return this._descriptor.name;
    }

    /**
     * Determines whether the given `value` contains the specified `flag`.
     *
     * @param value - The value to check for the presence of the flag.
     * @param flag - The flag to check for.
     *
     * @returns `true` if the value has the flag; otherwise, `false`.
     */
    hasFlag(value: EnumValue<T>, flag: EnumValue<T>): boolean {
        return this._descriptor.hasFlag(value, flag);
    }

    /**
     * Gets the enum value associated with the specified key.
     *
     * @param key - The key to look up.
     *
     * @returns The enum value associated with the key, or `undefined` if the key is not found.
     */
    get(key: EnumKey<T> | string): EnumValue<T> | undefined {
        // Attempt to retrieve the value from this object's properties.
        const value = (this as unknown as T)[key as EnumKey<T>];
        if (typeof value === this.underlyingType || this._comparer === ORDINAL_EQUALITY_COMPARER) {
            return value;
        }

        // Apply the custom comparer.
        const comparer = this._comparer;
        const keys = this._keys;
        const values = this._values;
        for (let i = 0; i < keys.length; ++i) {
            if (comparer(key, keys[i])) {
                return values[i];
            }
        }

        // Nothing we can do about it.
        return undefined;
    }

    /**
     * Returns the key of the first occurrence of a value in the enum.
     *
     * @param value - The value to locate in the enum.
     *
     * @returns The key of the first occurrence of a value in the enum, or `undefined` if it is not present.
     */
    keyOf(value: EnumValue<T>): EnumKey<T> | undefined {
        const i = this._values.indexOf(value);
        return i >= 0 ? this._keys[i] : undefined;
    }

    /**
     * Returns the friendly name of the key of the first occurrence of a value in the enum.
     *
     * @param value - The value to locate in the enum.
     *
     * @returns The friendly name of the key of the first occurrence of a value in the enum, or `undefined` if it is not present.
     */
    friendlyNameOf(value: EnumValue<T>): string | undefined {
        const key = this.keyOf(value);
        if (key === undefined) {
            return undefined;
        }

        const friendlyName = this._names.get(key) ?? toPascalCase(key);
        return friendlyName;
    }

    /**
     * Returns the first element in the enum that satisfies the provided `predicate`.
     *
     * @param predicate - A function to test each key/value pair in the enum. It should return `true` to indicate a match; otherwise, `false`.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The first element in the enum that satisfies the provided `predicate`, or `undefined` if no value satisfies the function.
     */
    find(predicate: (value: EnumValue<T>, key: EnumKey<T>, e: ConstructedEnum<T>) => boolean, thisArg?: unknown): EnumValue<T> | undefined {
        const key = this.findKey(predicate, thisArg);
        return key === undefined ? undefined : this.get(key);
    }

    /**
     * Returns the key for the first element in the enum that satisfies the provided `predicate`.
     *
     * @param predicate - A function to test each key/value pair in the enum. It should return `true` to indicate a match; otherwise, `false`.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The key of the first element in the enum that satisfies the provided `predicate`, or `undefined` if no key satisfies the function.
     */
    findKey(predicate: (value: EnumValue<T>, key: EnumKey<T>, e: ConstructedEnum<T>) => boolean, thisArg?: unknown): EnumKey<T> | undefined {
        predicate = thisArg === undefined ? predicate : predicate.bind(thisArg);

        const keys = this._keys;
        const values = this._values;
        for (let i = 0; i < values.length; ++i) {
            if (predicate(values[i], keys[i], this as unknown as ConstructedEnum<T>)) {
                return keys[i];
            }
        }
        return undefined;
    }

    /**
     * Checks whether the specified key exists in the enum.
     *
     * @param key - The key to check.
     *
     * @returns `true` if the key exists in the enum; otherwise, `false`.
     */
    has(key: EnumKey<T> | string): boolean {
        return this.get(key) !== undefined;
    }

    /**
     * Checks whether the specified value exists in the enum.
     *
     * @param value - The enum value to check.
     *
     * @returns `true` if the enum value exists in the enum; otherwise, `false`.
     */
    includes(value: EnumValue<T>): boolean {
        return this._values.includes(value);
    }

    /**
     * Returns an iterator that yields the keys of the enum.
     */
    keys(): IterableIterator<EnumKey<T>> {
        return this._keys[Symbol.iterator]();
    }

    /**
     * Returns an iterator that yields the values of the enum.
     */
    values(): IterableIterator<EnumValue<T>> {
        return this._values[Symbol.iterator]();
    }

    /**
     * Returns an iterator that yields the key/value pairs for every entry in the enum.
     */
    *entries(): IterableIterator<EnumEntry<T>> {
        const keys = this._keys;
        const values = this._values;
        for (let i = 0; i < keys.length; ++i) {
            yield [keys[i], values[i]];
        }
    }

    /**
     * Returns an iterator that yields the key/value pairs for every entry in the enum.
     */
    [Symbol.iterator](): IterableIterator<EnumEntry<T>> {
        return this.entries();
    }

    /**
     * Executes a provided function once per each key/value pair in the enum, in definition order.
     *
     * @param callbackFn - The function to call for each element in the enum.
     * @param thisArg - The value to use as `this` when calling `callbackFn`.
     */
    forEach(callbackFn: (value: EnumValue<T>, key: EnumKey<T>, e: ConstructedEnum<T>) => void, thisArg?: unknown): void {
        callbackFn = thisArg === undefined ? callbackFn : callbackFn.bind(thisArg);

        const keys = this._keys;
        const values = this._values;
        for (let i = 0; i < keys.length; ++i) {
            callbackFn(values[i], keys[i], this as unknown as ConstructedEnum<T>);
        }
    }

    /**
     * Formats the given value as a string.
     *
     * @param value - The value to format.
     *
     * @returns The formatted string, or `undefined` if the value does not belong to the enum.
     */
    format(value: EnumValue<T>): string | undefined {
        // Unsupported value cannot be formatted.
        if (typeof value !== this.underlyingType) {
            return undefined;
        }

        // Attempt to find an existing key for the provided value.
        const existingKey = this.keyOf(value);
        if (existingKey !== undefined) {
            return existingKey;
        }

        // In case values in this enum are not flags,
        // and we did not find a key for the `value` during the previous step,
        // just return its string representation.
        //
        // Note: we don't return `undefine` or throw error,
        // because the `value` has the same type as other enum members.
        // E.g., `42` is considered a valid value for any number enum,
        // even if it was not directly specified.
        if (!this._hasFlags) {
            return String(value);
        }

        // Retrieve the keys, values, and descriptor,
        // so we won't need to directly access them every time it's necessary.
        const keys = this._keys;
        const values = this._values;
        const descriptor = this._descriptor;

        // Prepare for generating the string representation.
        let name = "";
        let remainingValue = value;

        // Iterate over each flag value in reverse order.
        // (because the flags with higher values are likely to be
        // more significant than the flags with lower values)
        for (let i = values.length - 1; i >= 0; --i) {
            const flag = values[i];

            // If the current flag is not present in the remaining value,
            // or is the default value (e.g., `0` for number enums), skip to the next flag.
            const isZero = flag === descriptor.defaultValue;
            const isFlagPresent = descriptor.hasFlag(remainingValue, flag);
            if (isZero || !isFlagPresent) {
                continue;
            }

            // If this is not the first flag to be added to the name, add a separator to the current name.
            name = name ? `${keys[i]}${DEFAULT_ENUM_SEPARATOR} ${name}` : keys[i];

            // Remove the current flag from the remaining value to ensure that
            // we won't add aliases of the same value to the result string.
            remainingValue = descriptor.removeFlag(remainingValue, flag);
        }

        // If the remaining value is equal to the default value for the descriptor
        // (e.g., `0` for number enums), return the generated name.
        //
        // Otherwise, it means there were some flags, which aren't specified in the enum,
        // so just return the string representation of the provided value.
        return remainingValue === descriptor.defaultValue && name ? name : String(value);
    }

    /**
     * Parses the specified string and returns the corresponding enum value.
     *
     * @param key - The string to parse.
     *
     * @returns The corresponding enum value, or `undefined` if the string could not be parsed.
     */
    parse(key: string): EnumValue<T> {
        // Attempt to find an existing value for the provided key.
        const existingValue = this.findOrParseValue(key);
        if (existingValue !== undefined) {
            return existingValue;
        }

        // In case values in this enum are not flags,
        // and we did not find a value for the `key` during the previous step,
        // return `undefined`, since the key is not valid for this enum.
        if (!this._hasFlags) {
            return undefined;
        }

        // Otherwise, we need to parse the key into individual flags and combine them into a single value.
        const formattedFlags = split(key, ENUM_SEPARATORS, { trimEntries: true, removeEmptyEntries: true });
        const descriptor = this._descriptor;

        // Start with the default value for the enum.
        let result = descriptor.defaultValue;

        for (const formattedFlag of formattedFlags) {
            // Try to find the value for the current string representation of flag.
            const flag = this.findOrParseValue(formattedFlag);

            // If the value is not found, return `undefined`.
            // In this case a single failure makes the whole input invalid.
            if (flag === undefined) {
                return undefined;
            }

            // Otherwise, combine it with the result.
            result = descriptor.addFlag(result, flag);
        }

        // Return the final combined value.
        return result;
    }

    /**
     * Finds the enum value for the given key.
     *
     * @param key - The key of the enum value to find.
     *
     * @returns The enum value with the given key, or `undefined` if no element with that key exists.
     */
    private findOrParseValue(key: string): EnumValue<T> | undefined {
        // If the value was found, return it as is.
        const value = this.get(key as EnumKey<T>);
        if (value !== undefined) {
            return value;
        }

        // If the key couldn't be found in the enumeration, try to parse it as a value.
        // E.g., `42` is considered a valid value for any number enum,
        // even if it was not directly specified.
        const keyAsValue = toType(key, this.underlyingType) as unknown as EnumValue<T>;
        if (keyAsValue !== undefined) {
            return keyAsValue;
        }

        // If the key couldn't be found in the enum and it couldn't be parsed as a value,
        // there's not much we can do about it, so just return `undefined`.
        return undefined;
    }
}

/**
 * A type of the constructed enum, which has all the methods and properties of `DynamicEnum`
 * and all the entries of the underlying enum `TEnum`.
 *
 * @template TEnum - Type of underlying enum used to construct the `DynamicEnum` instance.
 */
export type ConstructedEnum<TEnum> = DynamicEnum<TEnum> & Readonly<TEnum>;
