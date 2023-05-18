import { Comparer, createDefaultComparer, createDefaultEqualityComparer, EqualityComparer } from "@/utils/comparison";
import { ArrayMap } from "./map";
import { ArraySet } from "./set";

/**
 * Determines whether a value is iterable.H
 *
 * @template T - The type of elements in the iterable.
 *
 * @param iterable - The value to check.
 *
 * @returns `true` if the value is iterable; otherwise, `false`.
 */
export function isIterable<T>(iterable: unknown): iterable is Iterable<T> {
    return typeof iterable?.[Symbol.iterator] === "function";
}

/**
 * Returns the elements of an iterable that meet the condition specified in a callback function.
 *
 * @template T - The type of the elements in the iterable.
 * @template S - The type of the elements in the resulting iterable.
 *
 * @param iterable - The iterable to filter.
 * @param predicate - A function to test each element of the iterable.
 * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
 *
 * @returns An iterable that contains the elements from the input iterable that satisfy the condition specified by the predicate function.
 */
export function filter<T, S extends T>(iterable: Iterable<T>, predicate: (value: T, index: number, iterable: Iterable<T>) => value is S, thisArg?: unknown): Iterable<S>;

/**
 * Returns the elements of an iterable that meet the condition specified in a callback function.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to filter.
 * @param predicate - A function to test each element of the iterable.
 * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
 *
 * @returns An iterable that contains the elements from the input iterable that satisfy the condition specified by the predicate function.
 */
export function filter<T>(iterable: Iterable<T>, predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): Iterable<T>;

/**
 * Returns the elements of an iterable that meet the condition specified in a callback function.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to filter.
 * @param predicate - A function to test each element of the iterable.
 * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
 *
 * @returns An iterable that contains the elements from the input iterable that satisfy the condition specified by the predicate function.
 */
export function* filter<T>(iterable: Iterable<T>, predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): Iterable<T> {
    predicate = thisArg === undefined ? predicate : predicate.bind(thisArg);

    let i = 0;
    for (const value of iterable) {
        if (predicate(value, i++, iterable)) {
            yield value;
        }
    }
}

/**
 * Returns an iterable that contains only the distinct elements of the input iterable.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to filter.
 * @param comparer - An optional function to compare values for equality.
 *
 * @returns An iterable containing only the distinct elements of the input iterable.
 */
export function distinct<T>(iterable: Iterable<T>, comparer?: EqualityComparer<T>): Iterable<T> {
    return comparer ? new ArraySet(iterable, comparer) : new Set(iterable);
}

/**
 * Returns a new iterable that contains only the distinct elements of the input iterable, based on the selected property.
 *
 * @template T - The type of the elements in the iterable.
 * @template U - The type of the property used for comparison.
 *
 * @param iterable - The iterable to filter.
 * @param selector - A function to select the property used for comparison.
 * @param comparer - An optional function to compare values for equality.
 *
 * @returns An iterable containing the distinct elements of the input iterable based on the selected property.
 */
export function distinctBy<T, U>(iterable: Iterable<T>, selector: (value: T) => U, comparer?: EqualityComparer<U>): Iterable<T> {
    if (comparer) {
        const valueComparer = (a: T, b: T) => comparer(selector(a), selector(b));
        return new ArraySet(iterable, valueComparer);
    }

    return new Map(map(iterable, x => [selector(x), x] as const)).values();
}

/**
 * Executes a provided function on every element of the iterable and returns the results in a new iterable.
 *
 * @template T - The type of the elements in the input iterable.
 * @template U - The type of the elements in the resulting iterable.
 *
 * @param iterable - The iterable to map.
 * @param callbackFn - The function to apply to each element in the input iterable.
 * @param thisArg - The value to use as `this` when executing the callback function.
 *
 * @returns A new iterable containing the results of applying the callback function to each element in the input iterable.
 */
export function* map<T, U>(iterable: Iterable<T>, callbackFn: (value: T, index: number, iterable: Iterable<T>) => U, thisArg?: unknown): Iterable<U> {
    callbackFn = thisArg === undefined ? callbackFn : callbackFn.bind(thisArg);

    let i = 0;
    for (const value of iterable) {
        yield callbackFn(value, i++, iterable);
    }
}

/**
 * Executes a provided function on every element of the iterable and flattens the results into a new iterable.
 *
 * @template T - The type of the elements in the input iterable.
 * @template U - The type of the elements in the resulting iterable.
 *
 * @param iterable - The iterable to flat map.
 * @param callbackFn - The function to apply to each element in the input iterable.
 * @param thisArg - The value to use as `this` when executing the callback function.
 *
 * @returns A new iterable containing the flattened results of applying the callback function to each element in the input iterable.
 */
export function* flatMap<T, U>(iterable: Iterable<T>, callbackFn: (value: T, index: number, iterable: Iterable<T>) => Iterable<U>, thisArg?: unknown): Iterable<U> {
    callbackFn = thisArg === undefined ? callbackFn : callbackFn.bind(thisArg);

    let i = 0;
    for (const value of iterable) {
        yield* callbackFn(value, i++, iterable);
    }
}

/**
 * Applies a provided function to each element of the iterable, ultimately reducing the iterable to a single value.
 *
 * @template T - The type of the elements in the input iterable.
 * @template U - The type of the accumulator and the resulting single value.
 *
 * @param iterable - The iterable to reduce.
 * @param callbackFn - The function to apply to each element in the input iterable and the accumulator.
 * @param initialValue - The initial value to use as the accumulator.
 * @param thisArg - The value to use as `this` when executing the callback function.
 *
 * @returns The accumulated single value resulting from applying the callback function to each element in the input iterable.
 */
export function reduce<T, U>(iterable: Iterable<T>, callbackFn: (accumulator: U, value: T, index: number, iterable: Iterable<T>) => U, initialValue: NonNullable<U>, thisArg?: unknown): U;

/**
 * Applies a provided function to each element of the iterable, ultimately reducing the iterable to a single value.
 *
 * @template T - The type of the elements in the input iterable.
 * @template U - The type of the accumulator and the resulting single value.
 *
 * @param iterable - The iterable to reduce.
 * @param callbackFn - The function to apply to each element in the input iterable and the accumulator.
 * @param initialValue - The initial value to use as the accumulator.
 * @param thisArg - The value to use as `this` when executing the callback function.
 *
 * @returns The accumulated single value resulting from applying the callback function to each element in the input iterable.
 */
export function reduce<T>(iterable: Iterable<T>, callbackFn: (accumulator: T, value: T, index: number, iterable: Iterable<T>) => T, initialValue?: T, thisArg?: unknown): T;

/**
 * Applies a provided function to each element of the iterable, ultimately reducing the iterable to a single value.
 *
 * @template T - The type of the elements in the input iterable.
 * @template U - The type of the accumulator and the resulting single value.
 *
 * @param iterable - The iterable to reduce.
 * @param callbackFn - The function to apply to each element in the input iterable and the accumulator.
 * @param initialValue - The initial value to use as the accumulator.
 * @param thisArg - The value to use as `this` when executing the callback function.
 *
 * @returns The accumulated single value resulting from applying the callback function to each element in the input iterable.
 */
export function reduce<T, U>(iterable: Iterable<T>, callbackFn: (accumulator: U, value: T, index: number, iterable: Iterable<T>) => U, initialValue?: U, thisArg?: unknown): U {
    callbackFn = thisArg === undefined ? callbackFn : callbackFn.bind(thisArg);

    let accumulator = initialValue;
    let i = 0;
    for (const value of iterable) {
        if (accumulator === undefined && i === 0) {
            accumulator = value as unknown as U;
        } else {
            accumulator = callbackFn(accumulator, value, i, iterable);
        }
        ++i;
    }

    return accumulator;
}

/**
 * Returns an iterable that skips the first `count` elements of the input iterable.
 *
 * @template T - The type of elements in the input iterable.
 *
 * @param iterable - The input iterable.
 * @param count - The number of elements to skip. Must be a non-negative integer.
 *
 * @returns An iterable that contains the remaining elements after skipping `count` elements.
 */
export function* skip<T>(iterable: Iterable<T>, count: number): Iterable<T> {
    const it = iterable[Symbol.iterator]();
    for (let i = 0; i < count; ++i) {
        const { done } = it.next();
        if (done) {
            return;
        }
    }
    yield* { [Symbol.iterator]: () => it };
}

/**
 * Returns an iterable that contains the first `count` elements of the input iterable.
 *
 * @template T - The type of elements in the input iterable.
 *
 * @param iterable - The input iterable.
 * @param count - The number of elements to take. Must be a non-negative integer.
 *
 * @returns An iterable that contains the first `count` elements of the input iterable.
 */
export function* take<T>(iterable: Iterable<T>, count: number): Iterable<T> {
    let i = 0;
    for (const value of iterable) {
        if (++i > count) {
            return;
        }

        yield value;
    }
}

/**
 * Returns an iterable containing the last `count` elements of the input iterable.
 *
 * @template T - The type of elements in the input iterable.
 *
 * @param iterable - The input iterable.
 * @param count - The number of elements to include in the output iterable.
 *
 * @returns An iterable containing the last `count` elements of the input iterable.
 */
export function takeLast<T>(iterable: Iterable<T>, count: number): Iterable<T> {
    const buffer = [] as T[];
    for (const item of iterable) {
        buffer.push(item);
        if (buffer.length > count) {
            buffer.shift();
        }
    }
    return buffer;
}

/**
 * Returns an iterable that contains a subset of the elements in the input iterable.
 *
 * @template T - The type of elements in the input iterable.
 *
 * @param iterable - The input iterable.
 * @param start - The starting index *(inclusive)*. If omitted, defaults to `0`.
 * @param end - The ending index *(exclusive)*. If omitted, returns all elements after the `start` index.
 *
 * @returns An iterable that contains a subset of the elements in the input iterable.
 */
export function slice<T>(iterable: Iterable<T>, start?: number, end?: number): Iterable<T> {
    if (end === 0) {
        return [];
    }

    const isRelative = start < 0 || end < 0;
    if (isRelative) {
        return asArray(iterable).slice(start, end);
    }

    start ||= 0;
    const skipped = start === 0 ? iterable : skip(iterable, start);
    const took = end === undefined ? skipped : take(skipped, end - start);
    return took;
}

/**
 * Returns a new array with the elements of the input iterable in reverse order.
 *
 * @remarks
 *
 * This function will eagerly iterate over the input iterable and return an array with its elements in reverse order.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to reverse.
 *
 * @returns A new array with the elements of the input iterable in reverse order.
 */
export function reverse<T>(iterable: Iterable<T>): T[] {
    return [...iterable].reverse();
}

/**
 * Returns a new array with the elements of the input iterable sorted according to the specified comparer function.
 *
 * @remarks
 *
 * This function will eagerly iterate over the input iterable and return a new array with its elements sorted in ascending order.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to sort.
 * @param comparer - An optional function that compares two elements and returns a number indicating their relative order.
 *
 * @returns A new array with the elements of the input iterable sorted according to the specified comparer function.
 */
export function sort<T>(iterable: Iterable<T>, comparer?: Comparer<T>): T[] {
    return [...iterable].sort(comparer || createDefaultComparer());
}

/**
 * Checks whether all elements of an iterable satisfy a specific condition.
 *
 * @template T - The type of the elements in the input iterable.
 * @template S - The type of the elements in the resulting iterable.
 *
 * @param iterable - The iterable to check.
 * @param predicate - This function will be called for each element in the iterable until it returns a value which is coercible to the `false` boolean value or until the end of the iterable.
 * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
 *
 * @returns `true` if every element of the iterable satisfies the condition; otherwise, `false`.
 */
export function every<T, S extends T>(iterable: Iterable<T>, predicate: (value: T, index: number, iterable: Iterable<T>) => value is S, thisArg?: unknown): iterable is Iterable<S>;

/**
 * Checks whether all elements of an iterable satisfy a specific condition.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to check.
 * @param predicate - This function will be called for each element in the iterable until it returns a value which is coercible to the `false` boolean value or until the end of the iterable.
 * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
 *
 * @returns `true` if every element of the iterable satisfies the condition; otherwise, `false`.
 */
export function every<T>(iterable: Iterable<T>, predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): boolean;

/**
 * Checks whether all elements of an iterable satisfy a specific condition.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to check.
 * @param predicate - This function will be called for each element in the iterable until it returns a value which is coercible to the `false` boolean value or until the end of the iterable.
 * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
 *
 * @returns `true` if every element of the iterable satisfies the condition; otherwise, `false`.
*/
export function every<T>(iterable: Iterable<T>, predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): boolean {
    predicate = thisArg === undefined ? predicate : predicate.bind(thisArg);

    let i = 0;
    for (const value of iterable) {
        if (!predicate(value, i++, iterable)) {
            return false;
        }
    }
    return true;
}

/**
 * Checks whether any element of an iterable satisfies a specific condition.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to check.
 * @param predicate - This function will be called for each element in the iterable until it returns a value which is coercible to the `true` boolean value or until the end of the iterable.
 * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
 *
 * @returns `true` if any element of the iterable satisfies the condition; otherwise, `false`.
 */
export function some<T>(iterable: Iterable<T>, predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): boolean {
    predicate = thisArg === undefined ? predicate : predicate.bind(thisArg);

    let i = 0;
    for (const value of iterable) {
        if (predicate(value, i++, iterable)) {
            return true;
        }
    }
    return false;
}

/**
 * A comparison function that compares two values in an iterable and returns a number indicating their relative order.
 *
 * @param left - The first value to compare.
 * @param right - The second value to compare.
 * @param leftIndex - The index of the first value in the iterable.
 * @param rightIndex - The index of the second value in the iterable.
 * @param iterable - The iterable being compared.
 *
 * @returns A number indicating the relative order of the two values. If the first value is less than the second, returns a negative number. If the first value is greater than the second, returns a positive number. If the values are equal, returns 0.
 */
interface IterableComparer<T> {
    (left: T, right: T, leftIndex: number, rightIndex: number, iterable: Iterable<T>): number;
}

/**
 * Returns the minimum value in an iterable based on a specified comparison function.
 *
 * @param iterable - The iterable from which to find the minimum value.
 * @param comparer - An optional comparison function that determines the order of the elements. If not provided, the default comparison function will be used.
 * @param thisArg - An optional object to use as `this` when executing the comparison function.
 *
 * @returns The minimum value in the iterable, or `undefined` if the iterable is empty.
 */
export function min<T>(iterable: Iterable<T>, comparer?: IterableComparer<T>, thisArg?: unknown): T | undefined {
    return extremum(iterable, -1, comparer, thisArg);
}

/**
 * Returns the maximum value in an iterable based on a specified comparison function.
 *
 * @param iterable - The iterable from which to find the maximum value.
 * @param comparer - An optional comparison function that determines the order of the elements. If not provided, the default comparison function will be used.
 * @param thisArg - An optional object to use as `this` when executing the comparison function.
 *
 * @returns The maximum value in the iterable, or `undefined` if the iterable is empty.
 */
export function max<T>(iterable: Iterable<T>, comparer?: IterableComparer<T>, thisArg?: unknown): T | undefined {
    return extremum(iterable, 1, comparer, thisArg);
}

/**
 * Finds the extreme value in an iterable based on a specified comparison sign and comparison function.
 *
 * @param iterable - The iterable from which to find the extreme value.
 * @param comparisonSign - A positive number to indicate maximum search; a negative number to indicate minimum search.
 * @param comparer - An optional comparison function that determines the order of the elements. If not provided, the default comparison function will be used.
 * @param thisArg - An optional object to use as `this` when executing the comparison function.
 *
 * @returns The extreme value in the iterable, or `undefined` if the iterable is empty.
 */
function extremum<T>(iterable: Iterable<T>, comparisonSign: 1 | -1, comparer?: IterableComparer<T>, thisArg?: unknown): T | undefined {
    comparer ||= createDefaultComparer();
    comparer = thisArg === undefined ? comparer : comparer.bind(thisArg);

    let currentValue = undefined;
    let currentValueIndex = -1;
    let i = -1;
    for (const value of iterable) {
        ++i;

        if (currentValueIndex === -1) {
            currentValue = value;
            currentValueIndex = i;
            continue;
        }

        if (Math.sign(comparer(value, currentValue, i, currentValueIndex, iterable)) === comparisonSign) {
            currentValue = value;
            currentValueIndex = i;
        }
    }
    return currentValue;
}

/**
 * Counts the number of elements in an iterable that satisfy a specific condition.
 *
 * @remarks
 *
 * If no predicate function is provided, this method returns the length of the iterable.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to check.
 * @param predicate - The count method calls the predicate function for each element in the iterable and increments the counter if the predicate returns a value which is coercible to the `true` boolean value.
 * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
 *
 * @returns The number of elements in the iterable that satisfy the condition.
 */
export function count<T>(iterable: Iterable<T>, predicate?: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): number {
    if (!predicate && Array.isArray(iterable)) {
        return iterable.length;
    }

    let count = 0;
    if (predicate) {
        predicate = thisArg === undefined ? predicate : predicate.bind(thisArg);
        let i = 0;
        for (const value of iterable) {
            if (predicate(value, i++, iterable)) {
                ++count;
            }
        }
    } else {
        for (const _value of iterable) {
            ++count;
        }
    }
    return count;
}

/**
 * Returns the index of the first occurrence of a specified value in an iterable object.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable object to search for the specified value.
 * @param searchElement - The value to search for in the iterable object.
 * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal; otherwise, `false`.
 *
 * @returns The index of the first occurrence of the specified value in the iterable object, or `-1` if it is not found.
 */
export function indexOf<T>(iterable: Iterable<T>, searchElement: T, comparer?: EqualityComparer<T>): number;

/**
 * Returns the index of the first occurrence of a specified value in an iterable object, starting the search at a specified index.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable object to search for the specified value.
 * @param searchElement - The value to search for in the iterable object.
 * @param fromIndex - The index to start the search at.
 * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal, otherwise `false`.
 *
 * @returns The index of the first occurrence of the specified value in the iterable object, or `-1` if it is not found.
 */
export function indexOf<T>(iterable: Iterable<T>, searchElement: T, fromIndex?: number, comparer?: EqualityComparer<T>): number;

/**
 * Returns the index of the first occurrence of a specified value in an iterable object, starting the search at a specified index.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable object to search for the specified value.
 * @param searchElement - The value to search for in the iterable object.
 * @param fromIndex - The index to start the search at.
 * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal, otherwise `false`.
 *
 * @returns The index of the first occurrence of the specified value in the iterable object, or `-1` if it is not found.
 */
export function indexOf<T>(iterable: Iterable<T>, searchElement: T, fromIndex?: number | EqualityComparer<T>, comparer?: EqualityComparer<T>): number {
    if (typeof fromIndex !== "number") {
        comparer = fromIndex;
        fromIndex = 0;
    }

    fromIndex ??= 0;
    comparer ??= createDefaultEqualityComparer<T>();

    let i = 0;
    for (const value of iterable) {
        if (i >= fromIndex && comparer(searchElement, value)) {
            return i;
        }
        ++i;
    }
    return -1;
}

/**
 * Returns the index of the last occurrence of a specified value in an iterable object.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable object to search for the specified value.
 * @param searchElement - The value to search for in the iterable object.
 * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal; otherwise, `false`.
 *
 * @returns The index of the last occurrence of the specified value in the iterable object, or `-1` if it is not found.
 */
export function lastIndexOf<T>(iterable: Iterable<T>, searchElement: T, comparer?: EqualityComparer<T>): number;

/**
 * Returns the index of the last occurrence of a specified value in an iterable object, starting the search at a specified index.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable object to search for the specified value.
 * @param searchElement - The value to search for in the iterable object.
 * @param fromIndex - The index at which to begin searching backward.
 * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal, otherwise `false`.
 *
 * @returns The index of the last occurrence of the specified value in the iterable object, or `-1` if it is not found.
 */
export function lastIndexOf<T>(iterable: Iterable<T>, searchElement: T, fromIndex?: number, comparer?: EqualityComparer<T>): number;

/**
 * Returns the index of the last occurrence of a specified value in an iterable object, starting the search at a specified index.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable object to search for the specified value.
 * @param searchElement - The value to search for in the iterable object.
 * @param fromIndex - The index at which to begin searching backward.
 * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal, otherwise `false`.
 *
 * @returns The index of the last occurrence of the specified value in the iterable object, or `-1` if it is not found.
 */
export function lastIndexOf<T>(iterable: Iterable<T>, searchElement: T, fromIndex?: number | EqualityComparer<T>, comparer?: EqualityComparer<T>): number {
    if (typeof fromIndex !== "number") {
        comparer = fromIndex;
        fromIndex = Infinity;
    }

    fromIndex ??= Infinity;
    comparer ??= createDefaultEqualityComparer<T>();

    let i = 0;
    let lastIndex = -1;
    for (const value of iterable) {
        if (i >= fromIndex) {
            break;
        }

        if (comparer(searchElement, value)) {
            lastIndex = i;
        }
        ++i;
    }
    return lastIndex;
}

/**
 * Determines whether an iterable includes a certain element, returning `true` or `false` as appropriate.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to search for the element.
 * @param searchElement - The element to search for.
 * @param comparer - An optional function to use for comparing elements.
 *
 * @returns A boolean indicating whether the element was found in the iterable.
 */
export function includes<T>(iterable: Iterable<T>, searchElement: T, comparer?: EqualityComparer<T>): boolean;

/**
 * Determines whether an iterable includes a certain element, returning `true` or `false` as appropriate.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to search for the element.
 * @param searchElement - The element to search for.
 * @param fromIndex - The position in the iterable at which to begin searching for the element.
 * @param comparer - An optional function to use for comparing elements.
 *
 * @returns A boolean indicating whether the element was found in the iterable.
 */
export function includes<T>(iterable: Iterable<T>, searchElement: T, fromIndex?: number, comparer?: EqualityComparer<T>): boolean;

/**
 * Determines whether an iterable includes a certain element, returning `true` or `false` as appropriate.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to search for the element.
 * @param searchElement - The element to search for.
 * @param fromIndex - The position in the iterable at which to begin searching for the element.
 * @param comparer - An optional function to use for comparing elements.
 *
 * @returns A boolean indicating whether the element was found in the iterable.
 */
export function includes<T>(iterable: Iterable<T>, searchElement: T, fromIndex?: number | EqualityComparer<T>, comparer?: EqualityComparer<T>): boolean {
    return indexOf(iterable, searchElement, fromIndex as number, comparer) !== -1;
}

/**
 * Checks if two iterables are equal, element by element, using an optional custom comparer.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param first - The first iterable to compare.
 * @param second - The second iterable to compare.
 * @param comparer - An optional function for comparing elements for equality.
 *
 * @returns A boolean indicating whether the iterables are equal.
 */
export function sequenceEqual<T>(first: Iterable<T>, second: Iterable<T>, comparer?: EqualityComparer<T>): boolean {
    comparer ??= createDefaultEqualityComparer<T>();

    const firstIterator = first[Symbol.iterator]();
    const secondIterator = second[Symbol.iterator]();

    let firstCurrentElement = firstIterator.next();
    let secondCurrentElement = secondIterator.next();

    while (!firstCurrentElement.done && !secondCurrentElement.done) {
        if (!comparer(firstCurrentElement.value, secondCurrentElement.value)) {
            return false;
        }

        firstCurrentElement = firstIterator.next();
        secondCurrentElement = secondIterator.next();
    }

    return firstCurrentElement.done && secondCurrentElement.done;
}

/**
 * Checks if an iterable starts with the specified search elements, using an optional custom comparer.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to search.
 * @param searchElements - The elements to search for at the start of the iterable.
 * @param comparer - An optional function for comparing elements for equality.
 *
 * @returns A boolean indicating whether the iterable starts with the search elements.
 */
export function startsWith<T>(iterable: Iterable<T>, searchElements: Iterable<T>, comparer?: EqualityComparer<T>): boolean;

/**
 * Checks if an iterable starts with the specified search elements, using an optional custom comparer.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to search.
 * @param searchElements - The elements to search for at the start of the iterable.
 * @param fromIndex - An optional index to start the search.
 * @param comparer - An optional function for comparing elements for equality.
 *
 * @returns A boolean indicating whether the iterable starts with the search elements.
 */
export function startsWith<T>(iterable: Iterable<T>, searchElements: Iterable<T>, fromIndex?: number, comparer?: EqualityComparer<T>): boolean;

/**
 * Checks if an iterable starts with the specified search elements, using an optional custom comparer.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to search.
 * @param searchElements - The elements to search for at the start of the iterable.
 * @param fromIndex - An optional index to start the search.
 * @param comparer - An optional function for comparing elements for equality.
 *
 * @returns A boolean indicating whether the iterable starts with the search elements.
 */
export function startsWith<T>(iterable: Iterable<T>, searchElements: Iterable<T>, fromIndex?: number | EqualityComparer<T>, comparer?: EqualityComparer<T>): boolean {
    if (typeof fromIndex !== "number") {
        comparer = fromIndex;
        fromIndex = 0;
    }
    fromIndex ||= 0;
    comparer ||= createDefaultEqualityComparer<T>();

    const iterableIterator = skip(iterable, fromIndex || 0)[Symbol.iterator]();
    const searchElementsIterator = searchElements[Symbol.iterator]();

    let iterableElement = iterableIterator.next();
    let searchElement = searchElementsIterator.next();

    while (!searchElement.done) {
        if (iterableElement.done || !comparer(iterableElement.value, searchElement.value)) {
            return false;
        }

        iterableElement = iterableIterator.next();
        searchElement = searchElementsIterator.next();
    }

    return true;
}

/**
 * Checks if an iterable ends with the specified search elements, using an optional custom comparer.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to search.
 * @param searchElements - The elements to search for at the end of the iterable.
 * @param comparer - An optional function for comparing elements for equality.
 *
 * @returns A boolean indicating whether the iterable ends with the search elements.
 */
export function endsWith<T>(iterable: Iterable<T>, searchElements: Iterable<T>, comparer?: EqualityComparer<T>): boolean;

/**
 * Checks if an iterable ends with the specified search elements, using an optional custom comparer.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to search.
 * @param searchElements - The elements to search for at the end of the iterable.
 * @param toIndex - An optional index to end the search.
 * @param comparer - An optional function for comparing elements for equality.
 *
 * @returns A boolean indicating whether the iterable ends with the search elements.
 */
export function endsWith<T>(iterable: Iterable<T>, searchElements: Iterable<T>, toIndex?: number, comparer?: EqualityComparer<T>): boolean;

/**
 * Checks if an iterable ends with the specified search elements, using an optional custom comparer.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to search.
 * @param searchElements - The elements to search for at the end of the iterable.
 * @param toIndex - An optional index to end the search.
 * @param comparer - An optional function for comparing elements for equality.
 *
 * @returns A boolean indicating whether the iterable ends with the search elements.
 */
export function endsWith<T>(iterable: Iterable<T>, searchElements: Iterable<T>, toIndex?: number | EqualityComparer<T>, comparer?: EqualityComparer<T>): boolean {
    if (typeof toIndex !== "number") {
        comparer = toIndex;
        toIndex = undefined;
    }

    const searchElementsBuffered = asArray(searchElements);
    const limitedIterable = typeof toIndex === "number" ? take(iterable, toIndex) : iterable;
    const lastElements = takeLast(limitedIterable, searchElementsBuffered.length);
    return sequenceEqual(lastElements, searchElementsBuffered, comparer);
}

/**
 * Returns the index of the first element in an iterable that satisfies the provided predicate function.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to search.
 * @param predicate - A function to test each element for a condition.
 * @param thisArg - An optional object to use as `this` when executing the `predicate`.
 *
 * @returns The index of the first element in the iterable that satisfies the provided predicate function, or `-1` if none are found.
 */
export function findIndex<T>(iterable: Iterable<T>, predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): number {
    predicate = thisArg === undefined ? predicate : predicate.bind(thisArg);

    let i = 0;
    for (const value of iterable) {
        if (predicate(value, i, iterable)) {
            return i;
        }
        ++i;
    }
    return -1;
}

/**
 * Returns the first element in an iterable that satisfies the provided type guard predicate function.
 *
 * @remarks
 *  - If the `predicate` is passed, this function returns the first element in the iterable for which the type predicate returns `true`, or `undefined` if none are found.
 *  - If the `predicate` is not passed, this function returns the first element in the iterable, or `undefined` if the iterable is empty.
 *
 * @template T - The type of the elements in the input iterable.
 * @template S - The type of the resulting element.
 *
 * @param iterable - The iterable to search.
 * @param predicate - A type guard function to test each element for a condition.
 * @param thisArg - An optional object to use as `this` when executing the `predicate`.
 *
 * @returns The first element in the iterable that satisfies the provided type guard predicate function, or `undefined` if none are found.
 */
export function first<T, S extends T>(iterable: Iterable<T>, predicate?: (value: T, index: number, iterable: Iterable<T>) => value is S, thisArg?: unknown): S | undefined;

/**
 * Returns the first element in an iterable that satisfies the provided predicate function.
 *
 * @remarks
 *  - If the `predicate` is passed, this function returns the first element in the iterable for which the predicate returns `true`, or `undefined` if none are found.
 *  - If the `predicate` is not passed, this function returns the first element in the iterable, or `undefined` if the iterable is empty.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to search.
 * @param predicate - A function to test each element for a condition.
 * @param thisArg - An optional object to use as `this` when executing the `predicate`.
 *
 * @returns The first element in the iterable that satisfies the provided predicate function, or `undefined` if none are found.
 */
export function first<T>(iterable: Iterable<T>, predicate?: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): T | undefined;

/**
 * Returns the first element in an iterable that satisfies the provided predicate function.
 *
 * @remarks
 *  - If the `predicate` is passed, this function returns the first element in the iterable for which the predicate returns `true`, or `undefined` if none are found.
 *  - If the `predicate` is not passed, this function returns the first element in the iterable, or `undefined` if the iterable is empty.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to search.
 * @param predicate - A function to test each element for a condition.
 * @param thisArg - An optional object to use as `this` when executing the `predicate`.
 *
 * @returns The first element in the iterable that satisfies the provided predicate function, or `undefined` if none are found.
 */
export function first<T>(iterable: Iterable<T>, predicate?: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): T | undefined {
    if (!predicate) {
        // eslint-disable-next-line no-unreachable-loop
        for (const value of iterable) {
            return value;
        }
        return undefined;
    }

    predicate = thisArg === undefined ? predicate : predicate.bind(thisArg);
    let i = 0;
    for (const value of iterable) {
        if (predicate(value, i++, iterable)) {
            return value;
        }
    }
    return undefined;
}

/**
 * Returns the last element in an iterable that satisfies the provided type guard predicate function.
 *
 * @remarks
 *  - If the `predicate` is passed, this function returns the last element in the iterable for which the type predicate returns `true`, or `undefined` if none are found.
 *  - If the `predicate` is not passed, this function returns the last element in the iterable, or `undefined` if the iterable is empty.
 *
 * @template T - The type of the elements in the input iterable.
 * @template S - The type of the resulting element.
 *
 * @param iterable - The iterable to search.
 * @param predicate - A type guard function to test each element for a condition.
 * @param thisArg - An optional object to use as `this` when executing the `predicate`.
 *
 * @returns The last element in the iterable that satisfies the provided type guard predicate function, or `undefined` if none are found.
 */
export function last<T, S extends T>(iterable: Iterable<T>, predicate?: (value: T, index: number, iterable: Iterable<T>) => value is S, thisArg?: unknown): S | undefined;

/**
 * Returns the last element in an iterable that satisfies the provided predicate function.
 *
 * @remarks
 *  - If the `predicate` is passed, this function returns the last element in the iterable for which the predicate returns `true`, or `undefined` if none are found.
 *  - If the `predicate` is not passed, this function returns the last element in the iterable, or `undefined` if the iterable is empty.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to search.
 * @param predicate - A function to test each element for a condition.
 * @param thisArg - An optional object to use as `this` when executing the `predicate`.
 *
 * @returns The last element in the iterable that satisfies the provided predicate function, or `undefined` if none are found.
 */
export function last<T>(iterable: Iterable<T>, predicate?: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): T | undefined;

/**
 * Returns the last element in an iterable that satisfies the provided predicate function.
 *
 * @remarks
 *  - If the `predicate` is passed, this function returns the last element in the iterable for which the predicate returns `true`, or `undefined` if none are found.
 *  - If the `predicate` is not passed, this function returns the last element in the iterable, or `undefined` if the iterable is empty.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable to search.
 * @param predicate - A function to test each element for a condition.
 * @param thisArg - An optional object to use as `this` when executing the `predicate`.
 *
 * @returns The last element in the iterable that satisfies the provided predicate function, or `undefined` if none are found.
 */
export function last<T>(iterable: Iterable<T>, predicate?: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): T | undefined {
    if (!predicate) {
        let lastValue = undefined;
        for (const value of iterable) {
            lastValue = value;
        }
        return lastValue;
    }

    predicate = thisArg === undefined ? predicate : predicate.bind(thisArg);
    let i = 0;
    let lastValue = undefined;
    for (const value of iterable) {
        if (predicate(value, i++, iterable)) {
            lastValue = value;
        }
    }
    return lastValue;
}

/**
 * Returns the element at the specified index in an iterable object.
 *
 * @template T - The type of elements in the iterable object.
 *
 * @param iterable - The iterable object to get the element from.
 * @param index - The zero-based index of the element to get.
 *
 * @returns The element at the specified index or `undefined` if the index is out of range or the iterable is empty.
 */
export function at<T>(iterable: Iterable<T>, index: number): T | undefined {
    if (Array.isArray(iterable)) {
        return iterable.at(index);
    }

    const isRelative = index < 0;
    if (isRelative) {
        return first(takeLast(iterable, -index));
    }

    return first(skip(iterable, index));
}

/**
 * Concatenates the elements in an iterable object using a specified separator between each element.
 *
 * @param iterable - The iterable object to concatenate.
 * @param separator - The string to use as a separator. If omitted, a comma (`,`) is used.
 *
 * @returns The concatenated string.
 */
export function join(iterable: Iterable<unknown>, separator?: string): string {
    return asArray(iterable).join(separator);
}

/**
 * Concatenates multiple iterable objects into a single iterable object.
 *
 * @template T - The type of elements in the iterable objects.
 *
 * @param iterables - The iterable objects to concatenate.
 *
 * @returns An iterable object that contains all the elements of the input iterable objects in the order they were passed in.
 */
export function* concat<T>(...iterables: Iterable<T>[]): Iterable<T> {
    for (const iterable of iterables) {
        yield* iterable;
    }
}

/**
 * Prepends the specified value to an iterable and returns a new iterable.
 *
 * @param iterable - The iterable to prepend the value to.
 * @param value - The value to prepend to the iterable.
 *
 * @returns A new iterable with the specified value prepended.
 */
export function* prepend<T>(iterable: Iterable<T>, value: T): Iterable<T> {
    yield value;
    yield* iterable;
}

/**
 * Appends the specified value to an iterable and returns a new iterable.
 *
 * @param iterable - The iterable to append the value to.
 * @param value - The value to append to the iterable.
 *
 * @returns A new iterable with the specified value appended.
 */
export function* append<T>(iterable: Iterable<T>, value: T): Iterable<T> {
    yield* iterable;
    yield value;
}

/**
 * Removes the last element from the input iterable and returns that element and a new iterable without the removed element.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable from which to remove the last element.
 *
 * @returns A tuple containing the removed element and a new iterable without the removed element.
 */
export function pop<T>(iterable: Iterable<T>): [T, Iterable<T>] {
    const buffer = [...iterable];
    const value = buffer.pop();
    return [value, buffer];
}

/**
 * Removes the first element from the input iterable and returns that element and a new iterable without the removed element.
 *
 * @template T - The type of the elements in the input iterable.
 *
 * @param iterable - The iterable from which to remove the first element.
 *
 * @returns A tuple containing the removed element and a new iterable without the removed element.
 */
export function shift<T>(iterable: Iterable<T>): [T, Iterable<T>] {
    const iterator = iterable[Symbol.iterator]();
    const firstIteration = iterator.next();
    const firstElement = firstIteration.done ? undefined : firstIteration.value;
    return [firstElement, { [Symbol.iterator]: () => iterator }];
}

/**
 * Calls a function for each element in an iterable object.
 *
 * @template T - The type of elements in the iterable object.
 *
 * @param iterable - The iterable object to iterate over.
 * @param callbackFn - A function to call for each element in the iterable object.
 * @param thisArg - An object to use as `this` when executing the `callbackFn` function.
 */
export function forEach<T>(iterable: Iterable<T>, callbackFn: (value: T, index: number, iterable: Iterable<T>) => void, thisArg?: unknown): void {
    callbackFn = thisArg === undefined ? callbackFn : callbackFn.bind(thisArg);

    let i = 0;
    for (const value of iterable) {
        callbackFn(value, i++, iterable);
    }
}

/**
 * Converts an iterable to an array.
 *
 * If the iterable is already an array, a reference to the same array will be returned.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to convert to an array.
 *
 * @returns An array containing all the elements of the iterable, or a reference to the same array if it is already an array.
 */
export function asArray<T>(iterable: Iterable<T>): T[] {
    return Array.isArray(iterable) ? iterable : [...iterable];
}

/**
 * Converts an iterable to an array or an {@link ArrayLikeIterable}.
 *
 * If the iterable is already an array, a reference to the same array will be returned.
 * If the iterable is not an array, an {@link ArrayLikeIterable} object will be returned.
 *
 * @template T - The type of the elements in the iterable.
 *
 * @param iterable - The iterable to convert to an array or an {@link ArrayLikeIterable}.
 *
 * @returns A reference to the same array if it is already an array, or an {@link ArrayLikeIterable} object if the iterable is not an array.
 */
export function asArrayLike<T>(iterable: Iterable<T>): T[] | ArrayLikeIterable<T> {
    return Array.isArray(iterable) ? iterable : $i(iterable);
}

/**
 * Wraps an iterable and adds array-like functionality to it.
 *
 * @template T - The type of elements in the iterable.
 *
 * @param iterable - The iterable to wrap.
 *
 * @returns A new instance of the {@link ArrayLikeIterable} class.
 */
export function $i<T>(iterable: Iterable<T>): ArrayLikeIterable<T> {
    return iterable instanceof ArrayLikeIterable ? iterable : ArrayLikeIterable.from(iterable);
}

/**
 * Wraps an iterable and adds array-like functionality to it.
 *
 * @template T - The type of elements in the iterable.
 */
export class ArrayLikeIterable<T> implements Iterable<T> {
    /**
     * The original iterable, wrapped by this instance.
     */
    private readonly _iterable: Iterable<T>;

    /**
     * Creates a new instance of the {@link ArrayLikeIterable} class.
     *
     * @param iterable - The iterable to wrap.
     */
    private constructor(iterable: Iterable<T>) {
        this._iterable = iterable;
    }

    /**
     * Creates a new instance of the {@link ArrayLikeIterable} class from an iterable.
     *
     * @template T - The type of elements in the iterable.
     *
     * @param iterable - The iterable to wrap.
     *
     * @returns A new instance of the {@link ArrayLikeIterable} class.
     */
    static from<T>(iterable: Iterable<T>): ArrayLikeIterable<T> {
        return new ArrayLikeIterable(iterable);
    }

    /**
     * Creates a new instance of the {@link ArrayLikeIterable} class from an iterator.
     *
     * @template T - The type of elements in the iterable.
     *
     * @param iterator - The iterator to wrap.
     *
     * @returns A new instance of the {@link ArrayLikeIterable} class.
     */
    static of<T>(iterator: Iterator<T>): ArrayLikeIterable<T> {
        return new ArrayLikeIterable({ [Symbol.iterator]: () => iterator });
    }

    /**
     * Returns the number of elements in this iterable.
     *
     * @remarks
     *
     * Accessing this property will cause the iterable to be fully evaluated,
     * which may and definitely will result in performance overhead for large iterables.
     */
    get length(): number {
        return this.count();
    }

    /**
     * Returns the elements of the iterable that meet the condition specified in a callback function.
     *
     * @template S - The type of the elements in the resulting iterable.
     *
     * @param predicate - A function to test each element of the iterable.
     * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
     *
     * @returns An iterable that contains the elements from the input iterable that satisfy the condition specified by the predicate function.
     */
    filter<S extends T>(predicate: (value: T, index: number, iterable: Iterable<T>) => value is S, thisArg?: unknown): ArrayLikeIterable<S>;

    /**
     * Returns the elements of the iterable that meet the condition specified in a callback function.
     *
     * @param predicate - A function to test each element of the iterable.
     * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
     *
     * @returns An iterable that contains the elements from the input iterable that satisfy the condition specified by the predicate function.
     */
    filter(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): ArrayLikeIterable<T>;

    /**
     * Returns the elements of the iterable that meet the condition specified in a callback function.
     *
     * @param predicate - A function to test each element of the iterable.
     * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
     *
     * @returns An iterable that contains the elements from the input iterable that satisfy the condition specified by the predicate function.
     */
    filter(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(filter(this._iterable, predicate, thisArg));
    }

    /**
     * Executes a provided function on every element of the iterable and returns the results in a new iterable.
     *
     * @template U - The type of the elements in the resulting iterable.
     *
     * @param callbackFn - The function to apply to each element in the input iterable.
     * @param thisArg - The value to use as `this` when executing the callback function.
     *
     * @returns A new iterable containing the results of applying the callback function to each element in the input iterable.
     */
    map<U>(callbackFn: (value: T, index: number, iterable: Iterable<T>) => U, thisArg?: unknown): ArrayLikeIterable<U> {
        return ArrayLikeIterable.from(map(this._iterable, callbackFn, thisArg));
    }

    /**
     * Executes a provided function on every element of the iterable and flattens the results into a new iterable.
     *
     * @template U - The type of the elements in the resulting iterable.
     *
     * @param callbackFn - The function to apply to each element in the input iterable.
     * @param thisArg - The value to use as `this` when executing the callback function.
     *
     * @returns A new iterable containing the flattened results of applying the callback function to each element in the input iterable.
     */
    flatMap<U>(callbackFn: (value: T, index: number, iterable: Iterable<T>) => Iterable<U>, thisArg?: unknown): ArrayLikeIterable<U> {
        return ArrayLikeIterable.from(flatMap(this._iterable, callbackFn, thisArg));
    }

    /**
     * Applies a provided function to each element of the iterable, ultimately reducing the iterable to a single value.
     *
     * @template U - The type of the accumulator and the resulting single value.
     *
     * @param callbackFn - The function to apply to each element in the input iterable and the accumulator.
     * @param initialValue - The initial value to use as the accumulator.
     * @param thisArg - The value to use as `this` when executing the callback function.
     *
     * @returns The accumulated single value resulting from applying the callback function to each element in the input iterable.
     */
    reduce<U>(callbackFn: (accumulator: U, value: T, index: number, iterable: Iterable<T>) => U, initialValue: NonNullable<U>, thisArg?: unknown): U;

    /**
     * Applies a provided function to each element of the iterable, ultimately reducing the iterable to a single value.
     *
     * @template U - The type of the accumulator and the resulting single value.
     *
     * @param callbackFn - The function to apply to each element in the input iterable and the accumulator.
     * @param initialValue - The initial value to use as the accumulator.
     * @param thisArg - The value to use as `this` when executing the callback function.
     *
     * @returns The accumulated single value resulting from applying the callback function to each element in the input iterable.
     */
    reduce(callbackFn: (accumulator: T, value: T, index: number, iterable: Iterable<T>) => T, initialValue?: T, thisArg?: unknown): T;

    /**
     * Applies a provided function to each element of the iterable, ultimately reducing the iterable to a single value.
     *
     * @template U - The type of the accumulator and the resulting single value.
     *
     * @param callbackFn - The function to apply to each element in the input iterable and the accumulator.
     * @param initialValue - The initial value to use as the accumulator.
     * @param thisArg - The value to use as `this` when executing the callback function.
     *
     * @returns The accumulated single value resulting from applying the callback function to each element in the input iterable.
     */
    reduce<U>(callbackFn: (accumulator: U, value: T, index: number, iterable: Iterable<T>) => U, initialValue?: U, thisArg?: unknown): U {
        return reduce(this._iterable, callbackFn, initialValue, thisArg);
    }

    /**
     * Returns an iterable that skips the first `count` elements of the input iterable.
     *
     * @param count - The number of elements to skip. Must be a non-negative integer.
     *
     * @returns An iterable that contains the remaining elements after skipping `count` elements.
     */
    skip(count: number): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(skip(this._iterable, count));
    }

    /**
     * Returns an iterable that contains the first `count` elements of the input iterable.
     *
     * @param count - The number of elements to take. Must be a non-negative integer.
     *
     * @returns An iterable that contains the first `count` elements of the input iterable.
     */
    take(count: number): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(take(this._iterable, count));
    }

    /**
     * Returns an iterable containing the last `count` elements of the input iterable.
     *
     * @param count - The number of elements to include in the output iterable.
     *
     * @returns An iterable containing the last `count` elements of the input iterable.
     */
    takeLast(count: number): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(takeLast(this._iterable, count));
    }

    /**
     * Returns an iterable that contains a subset of the elements in the input iterable.
     *
     * @param start - The starting index *(inclusive)*. If omitted, defaults to `0`.
     * @param end - The ending index *(exclusive)*. If omitted, returns all elements after the `start` index.
     *
     * @returns An iterable that contains a subset of the elements in the input iterable.
     */
    slice(start?: number, end?: number): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(slice(this._iterable, start, end));
    }

    /**
     * Returns a new iterable with the elements of the input iterable in reverse order.
     *
     * @returns A new iterable with the elements of the input iterable in reverse order.
     */
    reverse(): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(reverse(this._iterable));
    }

    /**
     * Returns a new iterable with the elements of the input iterable sorted according to the specified comparer function.
     *
     * @param comparer - An optional function that compares two elements and returns a number indicating their relative order.
     *
     * @returns A new iterable with the elements of the input iterable sorted according to the specified comparer function.
     */
    sort(comparer?: Comparer<T>): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(sort(this._iterable, comparer));
    }

    /**
     * Checks whether all elements of an iterable satisfy a specific condition.
     *
     * @template S - The type of the elements in the resulting iterable.
     *
     * @param predicate - This function will be called for each element in the iterable until it returns a value which is coercible to the `false` boolean value or until the end of the iterable.
     * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
     *
     * @returns `true` if every element of the iterable satisfies the condition; otherwise, `false`.
     */
    every<S extends T>(predicate: (value: T, index: number, iterable: Iterable<T>) => value is S, thisArg?: unknown): this is ArrayLikeIterable<S>;

    /**
     * Checks whether all elements of an iterable satisfy a specific condition.
     *
     * @param predicate - This function will be called for each element in the iterable until it returns a value which is coercible to the `false` boolean value or until the end of the iterable.
     * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
     *
     * @returns `true` if every element of the iterable satisfies the condition; otherwise, `false`.
     */
    every(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): boolean;

    /**
     * Checks whether all elements of an iterable satisfy a specific condition.
     *
     * @param predicate - This function will be called for each element in the iterable until it returns a value which is coercible to the `false` boolean value or until the end of the iterable.
     * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
     *
     * @returns `true` if every element of the iterable satisfies the condition; otherwise, `false`.
     */
    every(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): boolean {
        return every(this._iterable, predicate, thisArg);
    }

    /**
     * Checks whether any element of the iterable satisfies a specific condition.
     *
     * @param predicate - This function will be called for each element in the iterable until it returns a value which is coercible to the `true` boolean value or until the end of the iterable.
     * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
     *
     * @returns `true` if any element of the iterable satisfies the condition; otherwise, `false`.
     */
    some(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): boolean {
        return some(this._iterable, predicate, thisArg);
    }

    /**
     * Returns the minimum value in the iterable based on a specified comparison function.
     *
     * @param comparer - An optional comparison function that determines the order of the elements. If not provided, the default comparison function will be used.
     * @param thisArg - An optional object to use as `this` when executing the comparison function.
     *
     * @returns The minimum value in the iterable, or `undefined` if the iterable is empty.
     */
    min(comparer?: IterableComparer<T>, thisArg?: unknown): T | undefined {
        return min(this._iterable, comparer, thisArg);
    }

    /**
     * Returns the maximum value in the iterable based on a specified comparison function.
     *
     * @param comparer - An optional comparison function that determines the order of the elements. If not provided, the default comparison function will be used.
     * @param thisArg - An optional object to use as `this` when executing the comparison function.
     *
     * @returns The maximum value in the iterable, or `undefined` if the iterable is empty.
     */
    max(comparer?: IterableComparer<T>, thisArg?: unknown): T | undefined {
        return max(this._iterable, comparer, thisArg);
    }

    /**
     * Counts the number of elements in an iterable that satisfy a specific condition.
     *
     * @remarks
     *
     * If no predicate function is provided, this method returns the length of the iterable.
     *
     * @param predicate - The count method calls the predicate function for each element in the iterable and increments the counter if the predicate returns a value which is coercible to the `true` boolean value.
     * @param thisArg - An object to which the `this` keyword can refer in the `predicate` function.
     *
     * @returns The number of elements in the iterable that satisfy the condition.
     */
    count(predicate?: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): number {
        return count(this._iterable, predicate, thisArg);
    }

    /**
     * Returns the index of the first occurrence of a specified value in the iterable object.
     *
     * @param searchElement - The value to search for in the iterable object.
     * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal; otherwise, `false`.
     *
     * @returns The index of the first occurrence of the specified value in the iterable object, or `-1` if it is not found.
     */
    indexOf(searchElement: T, comparer?: EqualityComparer<T>): number;

    /**
     * Returns the index of the first occurrence of a specified value in the iterable object, starting the search at a specified index.
     *
     * @param searchElement - The value to search for in the iterable object.
     * @param fromIndex - The index to start the search at.
     * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal, otherwise `false`.
     *
     * @returns The index of the first occurrence of the specified value in the iterable object, or `-1` if it is not found.
     */
    indexOf(searchElement: T, fromIndex?: number, comparer?: EqualityComparer<T>): number;

    /**
     * Returns the index of the first occurrence of a specified value in the iterable object, starting the search at a specified index.
     *
     * @param searchElement - The value to search for in the iterable object.
     * @param fromIndex - The index to start the search at.
     * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal, otherwise `false`.
     *
     * @returns The index of the first occurrence of the specified value in the iterable object, or `-1` if it is not found.
     */
    indexOf(searchElement: T, fromIndex?: number | EqualityComparer<T>, comparer?: EqualityComparer<T>): number {
        return indexOf(this._iterable, searchElement, fromIndex as number, comparer);
    }

    /**
     * Returns the index of the last occurrence of a specified value in the iterable object.
     *
     * @param searchElement - The value to search for in the iterable object.
     * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal; otherwise, `false`.
     *
     * @returns The index of the last occurrence of the specified value in the iterable object, or `-1` if it is not found.
     */
    lastIndexOf(searchElement: T, comparer?: EqualityComparer<T>): number;

    /**
     * Returns the index of the last occurrence of a specified value in the iterable object, starting the search at a specified index.
     *
     * @param searchElement - The value to search for in the iterable object.
     * @param fromIndex - The index to start the search at.
     * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal, otherwise `false`.
     *
     * @returns The index of the last occurrence of the specified value in the iterable object, or `-1` if it is not found.
     */
    lastIndexOf(searchElement: T, fromIndex?: number, comparer?: EqualityComparer<T>): number;

    /**
     * Returns the index of the last occurrence of a specified value in the iterable object, starting the search at a specified index.
     *
     * @param searchElement - The value to search for in the iterable object.
     * @param fromIndex - The index to start the search at.
     * @param comparer - An optional function used to compare equality of values. Returns `true` if the values are equal, otherwise `false`.
     *
     * @returns The index of the last occurrence of the specified value in the iterable object, or `-1` if it is not found.
     */
    lastIndexOf(searchElement: T, fromIndex?: number | EqualityComparer<T>, comparer?: EqualityComparer<T>): number {
        return lastIndexOf(this._iterable, searchElement, fromIndex as number, comparer);
    }

    /**
     * Determines whether the iterable includes a certain element, returning `true` or `false` as appropriate.
     *
     * @param searchElement - The element to search for.
     * @param comparer - An optional function to use for comparing elements.
     *
     * @returns A boolean indicating whether the element was found in the iterable.
     */
    includes(searchElement: T, comparer?: EqualityComparer<T>): boolean;

    /**
     * Determines whether the iterable includes a certain element, returning `true` or `false` as appropriate.
     *
     * @param searchElement - The element to search for.
     * @param fromIndex - The position in the iterable at which to begin searching for the element.
     * @param comparer - An optional function to use for comparing elements.
     *
     * @returns A boolean indicating whether the element was found in the iterable.
     */
    includes(searchElement: T, fromIndex?: number, comparer?: EqualityComparer<T>): boolean;

    /**
     * Determines whether the iterable includes a certain element, returning `true` or `false` as appropriate.
     *
     * @param searchElement - The element to search for.
     * @param fromIndex - The position in the iterable at which to begin searching for the element.
     * @param comparer - An optional function to use for comparing elements.
     *
     * @returns A boolean indicating whether the element was found in the iterable.
     */
    includes(searchElement: T, fromIndex?: number | EqualityComparer<T>, comparer?: EqualityComparer<T>): boolean {
        return includes(this._iterable, searchElement, fromIndex as number, comparer);
    }

    /**
     * Checks if two iterables are equal, element by element, using an optional custom comparer.
     *
     * @param second - The second iterable to compare.
     * @param comparer - An optional function for comparing elements for equality.
     *
     * @returns A boolean indicating whether the iterables are equal.
     */
    sequenceEqual(second: Iterable<T>, comparer?: EqualityComparer<T>): boolean {
        return sequenceEqual(this._iterable, second, comparer);
    }

    /**
     * Checks if the iterable starts with the specified search elements, using an optional custom comparer.
     *
     * @param searchElements - The elements to search for at the start of the iterable.
     * @param comparer - An optional function for comparing elements for equality.
     *
     * @returns A boolean indicating whether the iterable starts with the search elements.
     */
    startsWith(searchElements: Iterable<T>, comparer?: EqualityComparer<T>): boolean;

    /**
     * Checks if the iterable starts with the specified search elements, using an optional custom comparer.
     *
     * @param searchElements - The elements to search for at the start of the iterable.
     * @param fromIndex - An optional index to start the search.
     * @param comparer - An optional function for comparing elements for equality.
     *
     * @returns A boolean indicating whether the iterable starts with the search elements.
     */
    startsWith(searchElements: Iterable<T>, fromIndex?: number, comparer?: EqualityComparer<T>): boolean;

    /**
     * Checks if the iterable starts with the specified search elements, using an optional custom comparer.
     *
     * @param searchElements - The elements to search for at the start of the iterable.
     * @param fromIndex - An optional index to start the search.
     * @param comparer - An optional function for comparing elements for equality.
     *
     * @returns A boolean indicating whether the iterable starts with the search elements.
     */
    startsWith(searchElements: Iterable<T>, fromIndex?: number | EqualityComparer<T>, comparer?: EqualityComparer<T>): boolean {
        return startsWith(this._iterable, searchElements, fromIndex as number, comparer);
    }

    /**
     * Checks if the iterable ends with the specified search elements, using an optional custom comparer.
     *
     * @param searchElements - The elements to search for at the end of the iterable.
     * @param comparer - An optional function for comparing elements for equality.
     *
     * @returns A boolean indicating whether the iterable ends with the search elements.
     */
    endsWith(searchElements: Iterable<T>, comparer?: EqualityComparer<T>): boolean;

    /**
     * Checks if the iterable ends with the specified search elements, using an optional custom comparer.
     *
     * @param searchElements - The elements to search for at the end of the iterable.
     * @param toIndex - An optional index to end the search.
     * @param comparer - An optional function for comparing elements for equality.
     *
     * @returns A boolean indicating whether the iterable ends with the search elements.
     */
    endsWith(searchElements: Iterable<T>, toIndex?: number, comparer?: EqualityComparer<T>): boolean;

    /**
     * Checks if the iterable ends with the specified search elements, using an optional custom comparer.
     *
     * @param searchElements - The elements to search for at the end of the iterable.
     * @param toIndex - An optional index to end the search.
     * @param comparer - An optional function for comparing elements for equality.
     *
     * @returns A boolean indicating whether the iterable ends with the search elements.
     */
    endsWith(searchElements: Iterable<T>, toIndex?: number | EqualityComparer<T>, comparer?: EqualityComparer<T>): boolean {
        return endsWith(this._iterable, searchElements, toIndex as number, comparer);
    }

    /**
     * Returns the index of the first element in the iterable that satisfies the provided predicate function.
     *
     * @param predicate - A function to test each element for a condition.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The index of the first element in the iterable that satisfies the provided predicate function, or `-1` if none are found.
     */
    findIndex(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): number {
        return findIndex(this._iterable, predicate, thisArg);
    }

    /**
     * Returns the first element in the iterable that satisfies the provided type guard predicate function.
     *
     * @remarks
     *  - If the `predicate` is passed, this function returns the first element in the iterable for which the type predicate returns `true`, or `undefined` if none are found.
     *  - If the `predicate` is not passed, this function returns the first element in the iterable, or `undefined` if the iterable is empty.
     *
     * @template S - The type of the resulting element.
     *
     * @param predicate - A type guard function to test each element for a condition.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The first element in the iterable that satisfies the provided type guard predicate function, or `undefined` if none are found.
     */
    find<S extends T>(predicate: (value: T, index: number, iterable: Iterable<T>) => value is S, thisArg?: unknown): S | undefined;

    /**
     * Returns the first element in the iterable that satisfies the provided predicate function.
     *
     * @remarks
     *  - If the `predicate` is passed, this function returns the first element in the iterable for which the predicate returns `true`, or `undefined` if none are found.
     *  - If the `predicate` is not passed, this function returns the first element in the iterable, or `undefined` if the iterable is empty.
     *
     * @param predicate - A function to test each element for a condition.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The first element in the iterable that satisfies the provided predicate function, or `undefined` if none are found.
     */
    find(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): T | undefined;

    /**
     * Returns the first element in the iterable that satisfies the provided predicate function.
     *
     * @remarks
     *  - If the `predicate` is passed, this function returns the first element in the iterable for which the predicate returns `true`, or `undefined` if none are found.
     *  - If the `predicate` is not passed, this function returns the first element in the iterable, or `undefined` if the iterable is empty.
     *
     * @param predicate - A function to test each element for a condition.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The first element in the iterable that satisfies the provided predicate function, or `undefined` if none are found.
     */
    find(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): T | undefined {
        return this.first(predicate, thisArg);
    }

    /**
     * Returns the first element in the iterable that satisfies the provided type guard predicate function.
     *
     * @remarks
     *  - If the `predicate` is passed, this function returns the first element in the iterable for which the type predicate returns `true`, or `undefined` if none are found.
     *  - If the `predicate` is not passed, this function returns the first element in the iterable, or `undefined` if the iterable is empty.
     *
     * @template S - The type of the resulting element.
     *
     * @param predicate - A type guard function to test each element for a condition.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The first element in the iterable that satisfies the provided type guard predicate function, or `undefined` if none are found.
     */
    first<S extends T>(predicate: (value: T, index: number, iterable: Iterable<T>) => value is S, thisArg?: unknown): S | undefined;

    /**
     * Returns the first element in the iterable that satisfies the provided predicate function.
     *
     * @remarks
     *  - If the `predicate` is passed, this function returns the first element in the iterable for which the predicate returns `true`, or `undefined` if none are found.
     *  - If the `predicate` is not passed, this function returns the first element in the iterable, or `undefined` if the iterable is empty.
     *
     * @param predicate - A function to test each element for a condition.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The first element in the iterable that satisfies the provided predicate function, or `undefined` if none are found.
     */
    first(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): T | undefined;

    /**
     * Returns the first element in the iterable that satisfies the provided predicate function.
     *
     * @remarks
     *  - If the `predicate` is passed, this function returns the first element in the iterable for which the predicate returns `true`, or `undefined` if none are found.
     *  - If the `predicate` is not passed, this function returns the first element in the iterable, or `undefined` if the iterable is empty.
     *
     * @param predicate - A function to test each element for a condition.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The first element in the iterable that satisfies the provided predicate function, or `undefined` if none are found.
     */
    first(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): T | undefined {
        return first(this._iterable, predicate, thisArg);
    }

    /**
     * Returns the last element in the iterable that satisfies the provided type guard predicate function.
     *
     * @remarks
     *  - If the `predicate` is passed, this function returns the last element in the iterable for which the type predicate returns `true`, or `undefined` if none are found.
     *  - If the `predicate` is not passed, this function returns the last element in the iterable, or `undefined` if the iterable is empty.
     *
     * @template S - The type of the resulting element.
     *
     * @param predicate - A type guard function to test each element for a condition.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The last element in the iterable that satisfies the provided type guard predicate function, or `undefined` if none are found.
     */
    last<S extends T>(predicate: (value: T, index: number, iterable: Iterable<T>) => value is S, thisArg?: unknown): S | undefined;

    /**
     * Returns the last element in the iterable that satisfies the provided predicate function.
     *
     * @remarks
     *  - If the `predicate` is passed, this function returns the last element in the iterable for which the predicate returns `true`, or `undefined` if none are found.
     *  - If the `predicate` is not passed, this function returns the last element in the iterable, or `undefined` if the iterable is empty.
     *
     * @param predicate - A function to test each element for a condition.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The last element in the iterable that satisfies the provided predicate function, or `undefined` if none are found.
     */
    last(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): T | undefined;

    /**
     * Returns the last element in the iterable that satisfies the provided predicate function.
     *
     * @remarks
     *  - If the `predicate` is passed, this function returns the last element in the iterable for which the predicate returns `true`, or `undefined` if none are found.
     *  - If the `predicate` is not passed, this function returns the last element in the iterable, or `undefined` if the iterable is empty.
     *
     * @param predicate - A function to test each element for a condition.
     * @param thisArg - An optional object to use as `this` when executing the `predicate`.
     *
     * @returns The last element in the iterable that satisfies the provided predicate function, or `undefined` if none are found.
     */
    last(predicate: (value: T, index: number, iterable: Iterable<T>) => unknown, thisArg?: unknown): T | undefined {
        return last(this._iterable, predicate, thisArg);
    }

    /**
     * Returns the element at the specified index in an iterable object.
     *
     * @param index - The zero-based index of the element to get.
     *
     * @returns The element at the specified index or `undefined` if the index is out of range or the iterable is empty.
     */
    at(index: number): T | undefined {
        return at(this._iterable, index);
    }

    /**
     * Concatenates the elements in an iterable object using a specified separator between each element.
     *
     * @param separator - The string to use as a separator. If omitted, a comma (`,`) is used.
     *
     * @returns The concatenated string.
     */
    join(separator?: string): string {
        return join(this._iterable, separator);
    }

    /**
     * Concatenates multiple iterable objects into a single iterable object.
     *
     * @param iterables - The iterable objects to concatenate.
     *
     * @returns An iterable object that contains all the elements of the input iterable objects in the order they were passed in.
     */
    concat(...iterables: Iterable<T>[]): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(concat(this._iterable, ...iterables));
    }

    /**
     * Prepends the specified value to this iterable and returns a new iterable.
     *
     * @param value - The value to prepend to the iterable.
     *
     * @returns A new iterable with the specified value prepended.
     */
    prepend(value: T): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(prepend(this._iterable, value));
    }

    /**
     * Appends the specified value to this iterable and returns a new iterable.
     *
     * @param value - The value to append to the iterable.
     *
     * @returns A new iterable with the specified value appended.
     */
    append(value: T): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(append(this._iterable, value));
    }

    /**
     * Removes the first element from the input iterable and returns that element and a new iterable without the removed element.
     *
     * @returns A tuple containing the removed element and a new iterable without the removed element.
     */
    shift(): [T, ArrayLikeIterable<T>] {
        const [value, iterable] = shift(this._iterable);
        return [value, ArrayLikeIterable.from(iterable)];
    }

    /**
     * Prepends the specified value to this iterable and returns a new iterable.
     *
     * @param value - The value to prepend to the iterable.
     *
     * @returns A new iterable with the specified value prepended.
     */
    unshift(value: T): ArrayLikeIterable<T> {
        return this.prepend(value);
    }

    /**
     * Appends the specified value to this iterable and returns a new iterable.
     *
     * @param value - The value to append to the iterable.
     *
     * @returns A new iterable with the specified value appended.
     */
    push(value: T): ArrayLikeIterable<T> {
        return this.append(value);
    }

    /**
     * Removes the last element from the input iterable and returns that element and a new iterable without the removed element.
     *
     * @returns A tuple containing the removed element and a new iterable without the removed element.
     */
    pop(): [T, ArrayLikeIterable<T>] {
        const [value, iterable] = pop(this._iterable);
        return [value, ArrayLikeIterable.from(iterable)];
    }

    /**
     * Returns an iterable of indices in the iterable.
     */
    keys(): Iterable<number> {
        return map(this._iterable, (_value, i) => i);
    }

    /**
     * Returns an iterable of values in the iterable.
     */
    values(): Iterable<T> {
        return this._iterable;
    }

    /**
     * Returns an iterable of index, value pairs for every entry in the iterable.
     */
    entries(): Iterable<[number, T]> {
        return map(this._iterable, (value, i) => [i, value]);
    }

    /**
     * Calls a function for each element in an iterable object.
     *
     * @param callbackFn - A function to call for each element in the iterable object.
     * @param thisArg - An object to use as `this` when executing the `callbackFn` function.
     */
    forEach(callbackFn: (value: T, index: number, iterable: Iterable<T>) => void, thisArg?: unknown): void {
        return forEach(this._iterable, callbackFn, thisArg);
    }

    /**
     * Converts the iterable to an array.
     *
     * If the iterable is already an array, a reference to the same array will be returned.
     */
    asArray(): readonly T[] {
        return asArray(this._iterable);
    }

    /**
     * Returns an array containing all elements of this iterable.
     */
    toArray(): T[] {
        return [...this._iterable];
    }

    /**
     * Converts the iterable of key-value pairs into a Map.
     *
     * @template K - The type of the keys in the key-value pairs.
     * @template V - The type of the values in the key-value pairs.
     *
     * @param comparer - Optional custom equality comparer for the keys.
     *
     * @returns A Map containing the key-value pairs from this iterable.
     */
    toMap<K, V>(this: ArrayLikeIterable<readonly [K, V]>, comparer?: EqualityComparer<K>): Map<K, V> {
        return comparer ? new ArrayMap(this._iterable, comparer) : new Map(this._iterable);
    }

    /**
     * Converts the iterable into a Set.
     *
     * @param comparer - Optional custom equality comparer for the values.
     *
     * @returns A Set containing the values from this iterable.
     */
    toSet(comparer?: EqualityComparer<T>): Set<T> {
        return comparer ? new ArraySet(this._iterable, comparer) : new Set(this._iterable);
    }

    /**
     * Converts the iterable of key-value pairs into a Record.
     *
     * @template K - The type of the keys in the key-value pairs.
     * @template V - The type of the values in the key-value pairs.
     *
     * @returns A Record containing the key-value pairs from this iterable.
     */
    toRecord<K extends PropertyKey, V>(this: ArrayLikeIterable<readonly [K, V]>): Record<K, V> {
        return reduce(this._iterable, (record, [key, value]) => {
            record[key] = value;
            return record;
        }, { } as Record<K, V>);
    }

    /**
     * Returns an iterable that contains only the distinct elements of the current iterable.
     *
     * @param comparer - An optional function to compare values for equality.
     *
     * @returns An iterable containing only the distinct elements of the current iterable.
     */
    distinct(comparer?: EqualityComparer<T>): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(distinct(this._iterable, comparer));
    }

    /**
     * Returns a new iterable that contains only the distinct elements of the current iterable, based on the selected property.
     *
     * @template U - The type of the property used for comparison.
     *
     * @param selector - A function to select the property used for comparison.
     * @param comparer - An optional function to compare values for equality.
     *
     * @returns An iterable containing the distinct elements of the current iterable based on the selected property.
     */
    distinctBy<U>(selector: (value: T) => U, comparer?: EqualityComparer<U>): ArrayLikeIterable<T> {
        return ArrayLikeIterable.from(distinctBy(this._iterable, selector, comparer));
    }

    /**
     * Returns an iterator for this iterable.
     */
    [Symbol.iterator](): Iterator<T> {
        return this._iterable[Symbol.iterator]();
    }

    /**
     * Returns a string representation of this object.
     */
    get [Symbol.toStringTag](): string {
        return "Iterable";
    }
}
