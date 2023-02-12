import { toBoolean, toFloat, toDate, toRegExp } from "@/utils/convert";
import { $i } from "@/utils/collections";
import { getOwnEntries } from "@/utils/reflection";

/**
 * Represents a query string.
 */
export class QueryString extends URLSearchParams implements Map<string, string> {
    /**
     * Constructs a new {@link QueryString} instance.
     *
     * @param params - Url parameters.
     */
    constructor(params?: string | Iterable<[unknown, unknown]> | Record<PropertyKey, unknown>) {
        super(normalizeUrlParams(params) as string | string[][]);
    }

    /**
     * Parses a query string into a {@link QueryString} object.
     *
     * @param queryString - The input string to parse as a query string.
     *
     * @returns A new {@link QueryString} instance.
     */
    static parse(queryString: string): QueryString {
        return new QueryString(queryString);
    }

    /**
     * Returns the number of key-value pairs in the query string.
     */
    get size(): number {
        return $i(this.entries()).count();
    }

    /**
     * Returns the value of the first name-value pair whose name is name.
     *
     * @param key - The key to look up in the query string.
     *
     * @returns The value of the first name-value pair whose name is name, or `undefined` if there is none.
     */
    get(key: string): string | undefined {
        return super.get(key) ?? undefined;
    }

    /**
     * Appends a single value to the values associated with the specified key.
     *
     * @param key - The key of the value to append.
     * @param value - The value to append.
     *
     * @returns This {@link QueryString} instance for chaining purposes.
     */
    append(name: string, value: string): this {
        super.append(name, value);
        return this;
    }

    /**
     * Sets a single value associated with the specified key, replacing any existing values.
     *
     * @param key - The key of the value to set.
     * @param value - The value to set.
     *
     * @returns This {@link QueryString} instance for chaining purposes.
     */
    set(name: string, value: string): this {
        super.set(name, value);
        return this;
    }

    /**
     * Removes the entry with the specified key from the query string.
     *
     * @param key - The key of the entry to remove.
     *
     * @returns `true` if an entry with the specified key was found and removed; otherwise, `false`.
     */
    delete(name: string): boolean {
        const existed = this.has(name);
        if (existed) {
            super.delete(name);
        }
        return existed;
    }

    /**
     * Deletes all key-value pairs.
     */
    clear(): void {
        for (const key of [...super.keys()]) {
            this.delete(key);
        }
    }

    /**
     * Gets the value of the parameter with the specified name as a string.
     *
     * @param paramName - The name of the parameter to get.
     *
     * @returns The value of the parameter as a string, or `undefined` if the parameter is not found.
     */
    getString(paramName: string): string | undefined {
        return this.get(paramName);
    }

    /**
     * Gets the value of the parameter with the specified name as a boolean.
     *
     * @param paramName - The name of the parameter to get.
     *
     * @returns The value of the parameter as a boolean, or `undefined` if the parameter is not found or cannot be converted to a boolean.
     */
    getBoolean(paramName: string): boolean | undefined {
        const rawValue = this.get(paramName);
        return rawValue === "" || toBoolean(rawValue);
    }

    /**
     * Gets the value of the parameter with the specified name as a number.
     *
     * @param paramName - The name of the parameter to get.
     *
     * @returns The value of the parameter as a number, or `undefined` if the parameter is not found or cannot be converted to a number.
     */
    getNumber(paramName: string): number | undefined {
        const rawValue = this.get(paramName);
        return toFloat(rawValue);
    }

    /**
     * Gets the value of the parameter with the specified name as a date.
     *
     * @param paramName - The name of the parameter to get.
     *
     * @returns The value of the parameter as a date, or `undefined` if the parameter is not found or cannot be converted to a date.
     */
    getDate(paramName: string): Date | undefined {
        const rawValue = this.get(paramName);
        return toDate(rawValue);
    }

    /**
     * Gets the value of the parameter with the specified name as a regular expression.
     *
     * @param paramName - The name of the parameter to get.
     *
     * @returns The value of the parameter as a regular expression, or `undefined` if the parameter is not found or cannot be converted to a regular expression.
     */
    getRegExp(paramName: string): RegExp | undefined {
        const rawValue = this.get(paramName);
        return toRegExp(rawValue);
    }

    /**
     * Calls the specified callback function for each element in the query string.
     *
     * @param callbackFn - Function to execute for each element.
     * @param thisArg - Object to use as `this` when executing the callback function.
     */
    forEach(callbackFn: (value: string, key: string, qs: QueryString) => void, thisArg?: unknown): void {
        super.forEach(callbackFn, thisArg);
    }

    /**
     * Returns a string representing the object.
     *
     * @returns A string representing the object.
     */
    get [Symbol.toStringTag](): string {
        return super[Symbol.toStringTag];
    }
}

/**
 * Checks if the provided object is an instance of {@link URLSearchParams}.
 *
 * @param urlParams - The object to be checked.
 *
 * @returns `true` if the provided object is an instance of {@link URLSearchParams}; otherwise, `false`.
 */
export function isURLSearchParams(urlParams: unknown): urlParams is URLSearchParams {
    return urlParams?.[Symbol.toStringTag] === "URLSearchParams";
}

/**
 * Checks if the provided object is an instance of {@link QueryString}.
 *
 * @param queryString - The object to be checked.
 *
 * @returns `true` if the provided object is an instance of {@link QueryString}; otherwise, `false`.
 */
export function isQueryString(queryString: unknown): queryString is QueryString {
    return queryString instanceof QueryString;
}

/**
 * Normalizes url parameters.
 *
 * - If the input is a string, the function removes the leading "?" character if present.
 * - If the input is an `Iterable` or a `Record`, the function transforms it into an iterable of key-value pairs,
 * filtering out pairs with `undefined` or `null` values.
 *
 * @param params - The url parameters to normalize.
 *
 * @returns The normalized URL parameters as a string, or an iterable of key-value pairs.
 */
function normalizeUrlParams(params?: string | Iterable<[unknown, unknown]> | Record<PropertyKey, unknown>): string | Iterable<[unknown, unknown]> {
    if (params === undefined || params === null) {
        return undefined;
    }

    if (typeof params === "string") {
        const start = params.indexOf("?");
        return start >= 0 ? params.substring(start + 1) : params;
    }

    return $i(Array.isArray(params) ? params : getOwnEntries(params))
        .flatMap<[unknown, unknown]>(([key, value]) => Array.isArray(value)
            ? $i(value).map(v => [key, v])
            : [[key, value]]
        )
        .filter(([, value]) => value !== undefined && value !== null);
}
