import { isKeyValueIterable } from "@/utils/collections/key-value-iterable";

describe("isKeyValueIterable", () => {
    test("returns true for objects that have entries", () => {
        expect(isKeyValueIterable(new Map())).toBe(true);
        expect(isKeyValueIterable(new Set())).toBe(true);
        expect(isKeyValueIterable([])).toBe(true);
        expect(isKeyValueIterable({ entries: () => [] })).toBe(true);
    });

    test("returns false for objects that has no entries", () => {
        expect(isKeyValueIterable({})).toBe(false);
        expect(isKeyValueIterable(new Date())).toBe(false);
    });

    test("returns false for null and undefined", () => {
        expect(isKeyValueIterable(null)).toBe(false);
        expect(isKeyValueIterable(undefined)).toBe(false);
    });
});
