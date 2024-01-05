import { $i, isIterable, KeyValueIterable, isKeyValueIterable, asArray } from "@/utils/collections";
import { RecordKey, UnionToIntersection } from "@/utils/types";

/**
 * Defines nested properties on an object.
 *
 * @template T - The type of the object to define nested properties on.
 *
 * @param obj - The object to define nested properties on.
 * @param properties - A map or iterable of property paths and property descriptors.
 * @param factory - An optional factory function for creating property descriptors for nested objects.
 *
 * @returns The input object with the nested properties defined.
 * @throws {TypeError} - If a path tries to define a property on a non-object value, e.g., `boolean`, `number`, etc.
 */
export function defineNestedProperties<T>(obj: T, properties: PropertyDescriptorMap | Iterable<readonly [string | readonly PropertyKey[], PropertyDescriptor]>, factory?: (obj: unknown, property: PropertyKey) => PropertyDescriptor): T | never {
    const iterableProperties = isIterable(properties) ? properties : Object.entries(properties);
    for (const [path, descriptor] of iterableProperties) {
        defineNestedProperty(obj, path, descriptor, factory);
    }
    return obj;
}

/**
 * Defines a single nested property on an object using a property descriptor and an optional factory function.
 *
 * @template T - The type of the object to define the nested property on.
 *
 * @param obj - The object to define the nested property on.
 * @param path - The path of the nested property to define, as a dot-separated string (e.g., "a.b.c") or an array of property keys.
 * @param property - The property descriptor for the nested property.
 * @param factory - An optional factory function for creating property descriptors for nested objects.
 *
 * @returns The input object with the nested property defined.
 * @throws {TypeError} - If a path tries to define a property on a non-object value, e.g., `boolean`, `number`, etc.
 */
export function defineNestedProperty<T>(obj: T, path: string | readonly PropertyKey[], property: PropertyDescriptor, factory?: (obj: unknown, property: PropertyKey) => PropertyDescriptor): T | never {
    path = typeof path === "string" ? path.split(".") : path;
    factory ||= () => ({ value: { }, writable: true, configurable: true, enumerable: true });

    let currentObj = obj as Record<PropertyKey, unknown>;
    const depth = path.length - 1;
    for (let i = 0; i < depth; ++i) {
        const propertyName = path[i];
        const existingValue = currentObj[propertyName];
        if (existingValue === undefined || existingValue === null) {
            const nestedDescriptor = factory(currentObj, propertyName);
            Object.defineProperty(currentObj, propertyName, nestedDescriptor);
        }
        currentObj = currentObj[propertyName] as Record<PropertyKey, unknown>;
    }

    const name = path[depth];
    Object.defineProperty(currentObj, name, property);

    return obj;
}

/**
 * Returns an iterable of all property descriptors from the given object and its prototypes.
 *
 * @param obj - The object to get the property descriptors from.
 *
 * @returns An iterable of key-descriptor pairs.
 */
export function* getAllPropertyDescriptors(obj: unknown): Iterable<[string | symbol, PropertyDescriptor]> {
    const visited = new Set<string | symbol>();

    while (obj !== undefined && obj !== null) {
        const keys = Array.prototype.concat(
            Object.getOwnPropertyNames(obj),
            Object.getOwnPropertySymbols(obj)
        );
        const descriptors = Object.getOwnPropertyDescriptors(obj);

        for (const key of keys) {
            if (!visited.has(key)) {
                visited.add(key);
                yield [key, descriptors[key]];
            }
        }

        obj = Object.getPrototypeOf(obj);
    }
}

/**
 * Retrieves a property descriptor from the given object, considering its prototype chain.
 *
 * @param obj - The object to get the property descriptor from.
 * @param key - The property key.
 *
 * @returns The property descriptor, or `undefined` if not found.
 */
export function getPropertyDescriptor(obj: unknown, key: PropertyKey): PropertyDescriptor {
    key = typeof key === "number" ? String(key) : key;

    const ownPropertyDescriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (ownPropertyDescriptor) {
        return ownPropertyDescriptor;
    }

    return $i(getAllPropertyDescriptors(obj)).find(([x]) => x === key)?.[1];
}

/**
 * Generates an iterable of all keys from the given object and its prototypes.
 *
 * @param obj - The object to get the keys from.
 *
 * @returns An iterable of property keys.
 */
export function getAllKeys(obj: unknown): Iterable<string | symbol> {
    return $i(getAllPropertyDescriptors(obj)).map(([key]) => key);
}

/**
 * Generates an iterable of all string keys from the given object and its prototypes.
 *
 * @param obj - The object to get the string keys from.
 *
 * @returns An iterable of string property keys.
 */
export function getAllNames(obj: unknown): Iterable<string> {
    return $i(getAllKeys(obj)).filter((key): key is string => typeof key === "string");
}

/**
 * Generates an iterable of all symbol keys from the given object and its prototypes.
 *
 * @param obj - The object to get the symbol keys from.
 *
 * @returns An iterable of symbol property keys.
 */
export function getAllSymbols(obj: unknown): Iterable<symbol> {
    return $i(getAllKeys(obj)).filter((key): key is symbol => typeof key === "symbol");
}

/**
 * Generates an iterable of all property values from the given object and its prototypes.
 *
 * @param obj - The object to get the property values from.
 *
 * @returns An iterable of property values.
 */
export function getAllValues(obj: unknown): Iterable<unknown> {
    return $i(getAllPropertyDescriptors(obj)).map(([key]) => obj[key]);
}

/**
 * Generates an iterable of all entries from the given object and its prototypes.
 *
 * @param obj - The object to get the entries from.
 *
 * @returns An iterable of key-value pairs.
 */
export function getAllEntries(obj: unknown): Iterable<[string | symbol, unknown]> {
    return $i(getAllPropertyDescriptors(obj)).map(([key]) => [key, obj[key]]);
}

/**
 * Retrieves the key-value pairs from an object.
 *
 * @template K - The key type.
 * @template V - The value type.
 *
 * @param obj - The object to extract key-value pairs from.
 *
 * @returns An iterable containing the key-value pairs.
 */
export function getOwnEntries<K, V>(obj: KeyValueIterable<K, V> | Iterable<readonly [K, V]> | Record<RecordKey<K>, V>): Iterable<[K, V]> {
    if (!obj) {
        return [];
    }

    if (!Array.isArray(obj) && isKeyValueIterable(obj)) {
        return obj.entries();
    }

    if (isIterable<[unknown, unknown]>(obj)) {
        const entries = asArray(obj);
        if (entries.every(x => Array.isArray(x))) {
            return entries as Iterable<[K, V]>;
        }
    }

    if (Array.isArray(obj)) {
        return obj.entries() as Iterable<[K, V]>;
    }

    return Object.entries(obj) as Iterable<[K, V]>;
}

/**
 * Merges multiple objects into a single object while preserving property descriptors.
 * If a property exists in multiple objects, the last object's descriptor takes precedence.
 *
 * @template T - A tuple of objects to be merged.
 *
 * @param values - The objects to be merged.
 *
 * @returns A single object resulting from the merge of input objects.
 */
export function merge<T extends unknown[]>(...values: T): UnionToIntersection<T[number]> {
    const result = { } as UnionToIntersection<T[number]>;
    const descriptors = $i(values).flatMap(x => getAllPropertyDescriptors(x));
    for (const [property, descriptor] of descriptors) {
        Object.defineProperty(result, property, descriptor);
    }
    return result;
}

/**
 * Safely retrieves a property value from an object, or returns `undefined` if the property is not accessible.
 *
 * @template T - The type of the object.
 * @template K - The type of the property key.
 *
 * @param target - The object from which to retrieve the property value.
 * @param key - The key of the property to retrieve.
 *
 * @returns The value of the property if accessible, otherwise `undefined`.
 */
export function getSafe<T, K extends PropertyKey>(target: T, key: K): (K extends keyof T ? T[K] : unknown) | undefined {
    if (target === null || target === undefined) {
        return undefined;
    }

    try {
        return target[key as string];
    } catch {
        return undefined;
    }
}
