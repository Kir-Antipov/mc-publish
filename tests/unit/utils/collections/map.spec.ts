import { IGNORE_CASE_EQUALITY_COMPARER } from "@/utils/comparison/string-equality-comparer";
import { isMap, isReadOnlyMap, isMultiMap, ArrayMap, MultiMap } from "@/utils/collections/map";

const readOnlyMapLike = {
    keys: () => {},
    values: () => {},
    entries: () => {},
    get: () => {},
    has: () => {},
    [Symbol.iterator]: () => {},
};

const mapLike = {
    ...readOnlyMapLike,
    set: () => {},
    delete: () => {},
};

const multiMapLike = {
    ...mapLike,
    append: () => {},
};

describe("isMap", () => {
    test("returns true for Map instances", () => {
        expect(isMap(new Map())).toBe(true);
    });

    test("returns true for Map-like objects", () => {
        expect(isMap(mapLike)).toBe(true);
    });

    test("returns false for non-Map-like objects", () => {
        expect(isMap({})).toBe(false);
    });

    test("returns false for null and undefined", () => {
        expect(isMap(null)).toBe(false);
        expect(isMap(undefined)).toBe(false);
    });
});

describe("isReadOnlyMap", () => {
    test("returns true for Map instances", () => {
        expect(isReadOnlyMap(new Map())).toBe(true);
    });

    test("returns true for ReadOnlyMap-like objects", () => {
        expect(isReadOnlyMap(readOnlyMapLike)).toBe(true);
    });

    test("returns false for non-ReadOnlyMap-like objects", () => {
        expect(isReadOnlyMap({})).toBe(false);
    });

    test("returns false for null and undefined", () => {
        expect(isReadOnlyMap(null)).toBe(false);
        expect(isReadOnlyMap(undefined)).toBe(false);
    });
});

describe("isMultiMap", () => {
    test("returns true for MultiMap instances", () => {
        expect(isMultiMap(new MultiMap())).toBe(true);
    });

    test("returns true for MultiMap-like objects", () => {
        expect(isMultiMap(multiMapLike)).toBe(true);
    });

    test("returns false for non-MultiMap-like objects", () => {
        expect(isMultiMap({})).toBe(false);
    });

    test("returns false for null and undefined", () => {
        expect(isMultiMap(null)).toBe(false);
        expect(isMultiMap(undefined)).toBe(false);
    });
});

describe("ArrayMap", () => {
    describe("constructor", () => {
        test("creates an empty map when no parameters are provided", () => {
            const map = new ArrayMap();

            expect(map.size).toBe(0);
        });

        test("creates a map from an iterable of entries", () => {
            const map = new ArrayMap([[1, "one"], [2, "two"]]);

            expect(map.size).toBe(2);
            expect(map.get(1)).toBe("one");
            expect(map.get(2)).toBe("two");
        });

        test("creates a map from an iterable of entries and a custom comparer", () => {
            const map = new ArrayMap([["one", 1], ["two", 2]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.size).toBe(2);
            expect(map.get("ONE")).toBe(1);
            expect(map.get("TWO")).toBe(2);
        });

        test("creates a map from an iterable of entries, and eliminates duplicates", () => {
            const map = new ArrayMap([[1, "zero"], [2, "two"], [1, "one"]]);

            expect(map.size).toBe(2);
            expect(map.get(1)).toBe("one");
            expect(map.get(2)).toBe("two");
        });

        test("creates a map from an iterable of entries and a custom comparer, and eliminates duplicates", () => {
            const map = new ArrayMap([["ONE", -1], ["two", 2], ["one", 1]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.size).toBe(2);
            expect(map.get("ONE")).toBe(1);
            expect(map.get("TWO")).toBe(2);
        });
    });

    describe("get", () => {
        test("returns value associated with the specified key", () => {
            const map = new ArrayMap([[1, "one"], [2, "two"]]);

            expect(map.get(1)).toBe("one");
        });

        test("respects custom comparer when retrieving value by key", () => {
            const map = new ArrayMap([["one", 1]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.get("one")).toBe(1);
            expect(map.get("One")).toBe(1);
            expect(map.get("ONE")).toBe(1);
        });

        test("returns undefined if the key is not found", () => {
            const map = new ArrayMap();

            expect(map.get(1)).toBeUndefined();
        });
    });

    describe("set", () => {
        test("adds a new key-value pair if the key is not present", () => {
            const map = new ArrayMap();

            map.set(1, "one");
            expect(map.get(1)).toBe("one");
            expect(map.size).toBe(1);
        });

        test("respects custom comparer when setting value by key", () => {
            const map = new ArrayMap([["one", 1]], IGNORE_CASE_EQUALITY_COMPARER);

            map.set("Two", 2);
            expect(map.get("two")).toBe(2);

            map.set("TWO", 3);
            expect(map.get("two")).toBe(3);
        });

        test("updates the value if the key is already present", () => {
            const map = new ArrayMap([[1, "one"]]);

            map.set(1, "updated");
            expect(map.get(1)).toBe("updated");
            expect(map.size).toBe(1);
        });
    });

    describe("has", () => {
        test("returns true if the key is present", () => {
            const map = new ArrayMap([[1, "one"]]);

            expect(map.has(1)).toBe(true);
        });

        test("respects custom comparer when checking for key presence", () => {
            const map = new ArrayMap([["one", 1]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.has("one")).toBe(true);
            expect(map.has("One")).toBe(true);
            expect(map.has("ONE")).toBe(true);
        });

        test("returns false if the key is not present", () => {
            const map = new ArrayMap();

            expect(map.has(1)).toBe(false);
        });
    });

    describe("delete", () => {
        test("removes the entry with the specified key", () => {
            const map = new ArrayMap([[1, "one"], [2, "two"]]);

            expect(map.delete(1)).toBe(true);
            expect(map.has(1)).toBe(false);
            expect(map.size).toBe(1);
        });

        test("respects custom comparer when deleting by key", () => {
            const map = new ArrayMap([["one", 1]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.delete("One")).toBe(true);
            expect(map.has("one")).toBe(false);
            expect(map.delete("ONE")).toBe(false);
        });

        test("returns false if the key is not present", () => {
            const map = new ArrayMap();

            expect(map.delete(1)).toBe(false);
        });
    });

    describe("clear", () => {
        test("removes all entries", () => {
            const map = new ArrayMap([[1, "one"], [2, "two"]]);
            map.clear();

            expect(map.size).toBe(0);
            expect(map.get(1)).toBeUndefined();
            expect(map.has(1)).toBe(false);
        });
    });

    describe("keys", () => {
        test("returns an iterator over the keys", () => {
            const map = new ArrayMap([[1, "one"], [2, "two"]]);
            const keys = Array.from(map.keys());

            expect(keys).toEqual([1, 2]);
        });
    });

    describe("values", () => {
        test("returns an iterator over the values", () => {
            const map = new ArrayMap([[1, "one"], [2, "two"]]);
            const values = Array.from(map.values());

            expect(values).toEqual(["one", "two"]);
        });
    });

    describe("entries", () => {
        test("returns an iterator over the entries", () => {
            const map = new ArrayMap([[1, "one"], [2, "two"]]);
            const entries = Array.from(map.entries());

            expect(entries).toEqual([[1, "one"], [2, "two"]]);
        });
    });

    describe("forEach", () => {
        test("calls the specified callback function for each entry", () => {
            const map = new ArrayMap([[1, "one"], [2, "two"]]);
            const callback = jest.fn();

            map.forEach(callback);

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith("one", 1, map);
            expect(callback).toHaveBeenCalledWith("two", 2, map);
        });

        test("binds the callback function to the provided thisArg", () => {
            const map = new ArrayMap([[1, "one"]]);
            const thisArg = {};

            map.forEach(function(this: typeof thisArg) {
                expect(this).toBe(thisArg);
            }, thisArg);
        });
    });

    describe("[Symbol.iterator]", () => {
        test("returns an iterator over the entries", () => {
            const map = new ArrayMap([[1, "one"], [2, "two"]]);
            const entries = Array.from(map[Symbol.iterator]());

            expect(entries).toEqual([[1, "one"], [2, "two"]]);
        });
    });

    describe("[Symbol.toStringTag]", () => {
        test("returns 'Map'", () => {
            const map = new ArrayMap();

            expect(map[Symbol.toStringTag]).toBe("Map");
        });
    });
});

describe("MultiMap", () => {
    describe("constructor", () => {
        test("creates an empty map when no parameters are provided", () => {
            const map = new MultiMap();

            expect(map.size).toBe(0);
        });

        test("creates a map from an iterable of entries", () => {
            const map = new MultiMap([[1, ["one"]], [2, ["two"]]]);

            expect(map.size).toBe(2);
            expect(map.getFirst(1)).toBe("one");
            expect(map.getFirst(2)).toBe("two");
        });

        test("creates a map from an iterable of entries and a custom comparer", () => {
            const map = new MultiMap([["one", [1]], ["two", [2]]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.size).toBe(2);
            expect(map.getFirst("ONE")).toBe(1);
            expect(map.getFirst("TWO")).toBe(2);
        });

        test("creates a map from an iterable of entries, and eliminates duplicates", () => {
            const map = new MultiMap([[1, ["zero"]], [2, ["two"]], [1, ["one"]]]);

            expect(map.size).toBe(2);
            expect(map.getFirst(1)).toBe("one");
            expect(map.getFirst(2)).toBe("two");
        });

        test("creates a map from an iterable of entries and a custom comparer, and eliminates duplicates", () => {
            const map = new MultiMap([["ONE", [-1]], ["two", [2]], ["one", [1]]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.size).toBe(2);
            expect(map.getFirst("ONE")).toBe(1);
            expect(map.getFirst("TWO")).toBe(2);
        });
    });

    describe("get", () => {
        test("returns value associated with the specified key", () => {
            const map = new MultiMap([[1, ["one"]], [2, ["two"]]]);

            expect(map.get(1)).toEqual(["one"]);
        });

        test("respects custom comparer when retrieving value by key", () => {
            const map = new MultiMap([["one", [1]]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.get("one")).toEqual([1]);
            expect(map.get("One")).toEqual([1]);
            expect(map.get("ONE")).toEqual([1]);
        });

        test("returns undefined if the key is not found", () => {
            const map = new MultiMap();

            expect(map.get(1)).toBeUndefined();
        });
    });

    describe("getFirst", () => {
        test("returns the first value for a given key", () => {
            const map = new MultiMap([[1, ["one", "One", "ONE"]]]);

            expect(map.getFirst(1)).toBe("one");
        });

        test("respects custom comparer when retrieving the first value by key", () => {
            const map = new MultiMap([["one", [1, -1]]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.getFirst("one")).toEqual(1);
            expect(map.getFirst("One")).toEqual(1);
            expect(map.getFirst("ONE")).toEqual(1);
        });

        test("returns undefined if the key is not found", () => {
            const map = new MultiMap();

            expect(map.getFirst(1)).toBeUndefined();
        });
    });

    describe("set", () => {
        test("adds a new key-value pair if the key is not present", () => {
            const map = new MultiMap();

            map.set(1, ["one"]);
            expect(map.getFirst(1)).toBe("one");
            expect(map.size).toBe(1);
        });

        test("updates the value if the key is already present", () => {
            const map = new MultiMap([[1, ["one"]]]);

            map.set(1, ["updated"]);
            expect(map.getFirst(1)).toBe("updated");
            expect(map.size).toBe(1);
        });

        test("sets a single value for a given key", () => {
            const map = new MultiMap();
            map.set("one", 1);

            expect(map.get("one")).toEqual([1]);
        });

        test("respects custom comparer when setting value by key", () => {
            const map = new MultiMap([["one", [1]]], IGNORE_CASE_EQUALITY_COMPARER);

            map.set("Two", [2]);
            expect(map.getFirst("two")).toBe(2);

            map.set("TWO", 3);
            expect(map.getFirst("two")).toBe(3);
        });
    });

    describe("append", () => {
        test("appends a single value to existing values for a given key", () => {
            const map = new MultiMap([["one", [1]]]);
            map.append("one", -1);

            expect(map.get("one")).toEqual([1, -1]);
        });

        test("appends multiple values to existing values for a given key", () => {
            const map = new MultiMap([[1, ["one"]]]);
            map.append(1, ["One", "ONE"]);

            expect(map.get(1)).toEqual(["one", "One", "ONE"]);
        });

        test("respects custom comparer when appending values by key", () => {
            const map = new MultiMap([["one", [1]]], IGNORE_CASE_EQUALITY_COMPARER);

            map.append("One", -1);
            map.append("ONE", [1, -1]);

            expect(map.get("one")).toEqual([1, -1, 1, -1]);
        });
    });

    describe("has", () => {
        test("returns true if the key is present", () => {
            const map = new MultiMap([[1, ["one"]]]);

            expect(map.has(1)).toBe(true);
        });

        test("respects custom comparer when checking for key presence", () => {
            const map = new MultiMap([["one", [1]]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.has("one")).toBe(true);
            expect(map.has("One")).toBe(true);
            expect(map.has("ONE")).toBe(true);
        });

        test("returns false if the key is not present", () => {
            const map = new MultiMap();

            expect(map.has(1)).toBe(false);
        });
    });

    describe("delete", () => {
        test("removes the entry with the specified key", () => {
            const map = new MultiMap([[1, ["one"]], [2, ["two"]]]);

            expect(map.delete(1)).toBe(true);
            expect(map.has(1)).toBe(false);
            expect(map.size).toBe(1);
        });

        test("deletes a specific value for a given key", () => {
            const map = new MultiMap([[1, ["one", "One", "ONE"]]]);

            expect(map.delete(1, "One")).toBe(true);
            expect(map.get(1)).toEqual(["one", "ONE"]);
        });

        test("deletes a specific value for a given key using a custom comparer", () => {
            const map = new MultiMap([[1, ["one", "not one"]]]);

            expect(map.delete(1, "ONE", IGNORE_CASE_EQUALITY_COMPARER)).toBe(true);
            expect(map.get(1)).toEqual(["not one"]);
        });

        test("respects custom comparer when deleting by key", () => {
            const map = new MultiMap([["one", [1]], ["two", [2, -2]]], IGNORE_CASE_EQUALITY_COMPARER);

            expect(map.delete("One")).toBe(true);
            expect(map.has("one")).toBe(false);
            expect(map.delete("ONE")).toBe(false);

            expect(map.delete("TWO", -2)).toBe(true);
            expect(map.has("Two")).toBe(true);
            expect(map.get("two")).toEqual([2]);
        });

        test("returns false if the key is not present", () => {
            const map = new MultiMap();

            expect(map.delete(1)).toBe(false);
        });
    });

    describe("clear", () => {
        test("removes all entries", () => {
            const map = new MultiMap([[1, ["one"]], [2, ["two"]]]);
            map.clear();

            expect(map.size).toBe(0);
            expect(map.get(1)).toBeUndefined();
            expect(map.has(1)).toBe(false);
        });
    });

    describe("keys", () => {
        test("returns an iterator over the keys", () => {
            const map = new MultiMap([[1, ["one"]], [2, ["two"]]]);
            const keys = Array.from(map.keys());

            expect(keys).toEqual([1, 2]);
        });
    });

    describe("values", () => {
        test("returns an iterator over the values", () => {
            const map = new MultiMap([[1, ["one"]], [2, ["two"]]]);
            const values = Array.from(map.values());

            expect(values).toEqual([["one"], ["two"]]);
        });
    });

    describe("flatValues", () => {
        test("returns an iterator over all values", () => {
            const map = new MultiMap([[1, ["one", "One"]], [2, ["two", "Two"]]]);
            const values = Array.from(map.flatValues());

            expect(values).toEqual(["one", "One", "two", "Two"]);
        });
    });

    describe("entries", () => {
        test("returns an iterator over the entries", () => {
            const map = new MultiMap([[1, ["one"]], [2, ["two"]]]);
            const entries = Array.from(map.entries());

            expect(entries).toEqual([[1, ["one"]], [2, ["two"]]]);
        });
    });

    describe("flatEntries", () => {
        test("returns an iterable of key-value pairs, with each key associated with a single value", () => {
            const map = new MultiMap([[1, ["one", "One"]], [2, ["two", "Two"]]]);
            const entries = Array.from(map.flatEntries());

            expect(entries).toEqual([[1, "one"], [1, "One"], [2, "two"], [2, "Two"]]);
        });
    });

    describe("forEach", () => {
        test("calls the specified callback function for each entry", () => {
            const map = new MultiMap([[1, ["one"]], [2, ["two"]]]);
            const callback = jest.fn();

            map.forEach(callback);

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith(["one"], 1, map);
            expect(callback).toHaveBeenCalledWith(["two"], 2, map);
        });

        test("binds the callback function to the provided thisArg", () => {
            const map = new MultiMap([[1, ["one"]]]);
            const thisArg = {};

            map.forEach(function(this: typeof thisArg) {
                expect(this).toBe(thisArg);
            }, thisArg);
        });
    });

    describe("forEachFlat", () => {
        test("calls the callback function for each standalone value coupled with its key", () => {
            const map = new MultiMap([[1, ["one", "One"]], [2, ["two", "Two"]]]);
            const callbackFn = jest.fn();

            map.forEachFlat(callbackFn);

            expect(callbackFn).toHaveBeenCalledTimes(4);
            expect(callbackFn).toHaveBeenNthCalledWith(1, "one", 1, map);
            expect(callbackFn).toHaveBeenNthCalledWith(2, "One", 1, map);
            expect(callbackFn).toHaveBeenNthCalledWith(3, "two", 2, map);
            expect(callbackFn).toHaveBeenNthCalledWith(4, "Two", 2, map);
        });

        test("binds the callback function to the provided thisArg", () => {
            const map = new MultiMap([[1, ["one"]]]);
            const thisArg = {};

            map.forEachFlat(function(this: typeof thisArg) {
                expect(this).toBe(thisArg);
            }, thisArg);
        });
    });

    describe("[Symbol.iterator]", () => {
        test("returns an iterator over the entries", () => {
            const map = new MultiMap([[1, ["one"]], [2, ["two"]]]);
            const entries = Array.from(map[Symbol.iterator]());

            expect(entries).toEqual([[1, ["one"]], [2, ["two"]]]);
        });
    });

    describe("[Symbol.toStringTag]", () => {
        test("returns 'Map'", () => {
            const map = new MultiMap();

            expect(map[Symbol.toStringTag]).toBe("Map");
        });
    });
});
