import { IGNORE_CASE_EQUALITY_COMPARER } from "@/utils/comparison/string-equality-comparer";
import { isSet, isReadOnlySet, ArraySet } from "@/utils/collections/set";

const readOnlySetLike = {
    keys: () => {},
    values: () => {},
    entries: () => {},
    has: () => {},
    [Symbol.iterator]: () => {},
};

const setLike = {
    ...readOnlySetLike,
    add: () => {},
    delete: () => {},
};

describe("isSet", () => {
    test("returns true for Set instances", () => {
        expect(isSet(new Set())).toBe(true);
    });

    test("returns true for Set-like objects", () => {
        expect(isSet(setLike)).toBe(true);
    });

    test("returns false for non-Set-like objects", () => {
        expect(isSet({})).toBe(false);
    });

    test("returns false for null and undefined", () => {
        expect(isSet(null)).toBe(false);
        expect(isSet(undefined)).toBe(false);
    });
});

describe("isReadOnlySet", () => {
    test("returns true for Set instances", () => {
        expect(isReadOnlySet(new Set())).toBe(true);
    });

    test("returns true for ReadOnlySet-like objects", () => {
        expect(isReadOnlySet(readOnlySetLike)).toBe(true);
    });

    test("returns false for non-ReadOnlySet-like objects", () => {
        expect(isReadOnlySet({})).toBe(false);
    });

    test("returns false for null and undefined", () => {
        expect(isReadOnlySet(null)).toBe(false);
        expect(isReadOnlySet(undefined)).toBe(false);
    });
});

describe("ArraySet", () => {
    describe("constructor", () => {
        test("creates an empty set when no parameters are provided", () => {
            const set = new ArraySet();

            expect(set.size).toBe(0);
        });

        test("creates a set from an iterable of values", () => {
            const set = new ArraySet(["one", "two"]);

            expect(set.size).toBe(2);
            expect(Array.from(set)).toEqual(["one", "two"]);
        });

        test("creates a set from an iterable of entries and a custom comparer", () => {
            const set = new ArraySet(["one", "two"], IGNORE_CASE_EQUALITY_COMPARER);

            expect(set.size).toBe(2);
            expect(set.has("ONE")).toBe(true);
            expect(set.has("TWO")).toBe(true);
        });

        test("creates a set from an iterable of entries, and eliminates duplicates", () => {
            const set = new ArraySet([1, 2, 1]);

            expect(set.size).toBe(2);
            expect(set.has(1)).toBe(true);
            expect(set.has(2)).toBe(true);
        });

        test("creates a set from an iterable of entries and a custom comparer, and eliminates duplicates", () => {
            const set = new ArraySet(["one", "two", "ONE"], IGNORE_CASE_EQUALITY_COMPARER);

            expect(set.size).toBe(2);
            expect(set.has("ONE")).toBe(true);
            expect(set.has("TWO")).toBe(true);
            expect(Array.from(set)).toEqual(["ONE", "two"]);
        });
    });

    describe("add", () => {
        test("adds a new key-value pair if the key is not present", () => {
            const set = new ArraySet();

            set.add(1);
            expect(set.has(1)).toBe(true);
            expect(set.size).toBe(1);
        });

        test("respects custom comparer when setting value by key", () => {
            const set = new ArraySet(["one"], IGNORE_CASE_EQUALITY_COMPARER);

            set.add("Two");
            expect(set.has("two")).toBe(true);

            set.add("TWO");
            expect(set.has("two")).toBe(true);

            expect(set.size).toBe(2);
            expect(Array.from(set)).toEqual(["one", "TWO"]);
        });

        test("updates the value if the key is already present", () => {
            const set = new ArraySet(["one"]);

            set.add("one");
            expect(set.has("one")).toBe(true);
            expect(set.size).toBe(1);
            expect(Array.from(set)).toEqual(["one"]);
        });
    });

    describe("has", () => {
        test("returns true if the key is present", () => {
            const set = new ArraySet([1]);

            expect(set.has(1)).toBe(true);
        });

        test("respects custom comparer when checking for key presence", () => {
            const set = new ArraySet(["one"], IGNORE_CASE_EQUALITY_COMPARER);

            expect(set.has("one")).toBe(true);
            expect(set.has("One")).toBe(true);
            expect(set.has("ONE")).toBe(true);
        });

        test("returns false if the key is not present", () => {
            const set = new ArraySet();

            expect(set.has(1)).toBe(false);
        });
    });

    describe("delete", () => {
        test("removes the entry with the specified key", () => {
            const set = new ArraySet([1, 2]);

            expect(set.delete(1)).toBe(true);
            expect(set.has(1)).toBe(false);
            expect(set.size).toBe(1);
        });

        test("respects custom comparer when deleting by key", () => {
            const set = new ArraySet(["one"], IGNORE_CASE_EQUALITY_COMPARER);

            expect(set.delete("One")).toBe(true);
            expect(set.has("one")).toBe(false);
            expect(set.delete("ONE")).toBe(false);
        });

        test("returns false if the key is not present", () => {
            const set = new ArraySet();

            expect(set.delete(1)).toBe(false);
        });
    });

    describe("clear", () => {
        test("removes all entries", () => {
            const set = new ArraySet([1, 2]);
            set.clear();

            expect(set.size).toBe(0);
            expect(set.has(1)).toBe(false);
        });
    });

    describe("keys", () => {
        test("returns an iterator over the values (ironically)", () => {
            const set = new ArraySet([1, 2]);
            const keys = Array.from(set.keys());

            expect(keys).toEqual([1, 2]);
        });
    });

    describe("values", () => {
        test("returns an iterator over the values", () => {
            const set = new ArraySet([1, 2]);

            const values = Array.from(set.values());

            expect(values).toEqual([1, 2]);
        });
    });

    describe("entries", () => {
        test("returns an iterator over the value-value pairs", () => {
            const set = new ArraySet([1, 2]);
            const entries = Array.from(set.entries());

            expect(entries).toEqual([[1, 1], [2, 2]]);
        });
    });

    describe("forEach", () => {
        test("calls the specified callback function for each value", () => {
            const set = new ArraySet(["one", "two"]);
            const callback = jest.fn();

            set.forEach(callback);

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenNthCalledWith(1, "one", "one", set);
            expect(callback).toHaveBeenNthCalledWith(2, "two", "two", set);
        });

        test("binds the callback function to the provided thisArg", () => {
            const set = new ArraySet([1, 2]);
            const thisArg = {};

            set.forEach(function(this: typeof thisArg) {
                expect(this).toBe(thisArg);
            }, thisArg);
        });
    });

    describe("[Symbol.iterator]", () => {
        test("returns an iterator over the values", () => {
            const set = new ArraySet(["one", "two"]);

            const values = Array.from(set[Symbol.iterator]());

            expect(values).toEqual(["one", "two"]);
        });
    });

    describe("[Symbol.toStringTag]", () => {
        test("returns 'Set'", () => {
            const set = new ArraySet();

            expect(set[Symbol.toStringTag]).toBe("Set");
        });
    });
});
