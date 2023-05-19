import { ORDINAL_COMPARER, IGNORE_CASE_COMPARER } from "@/utils/comparison/string-comparer";

describe("ORDINAL_COMPARER", () => {
    test("compares two strings using case-sensitive ordinal comparison", () => {
        expect(ORDINAL_COMPARER("test", "test")).toBe(0);
        expect(ORDINAL_COMPARER("Test", "test")).toBeLessThan(0);
        expect(ORDINAL_COMPARER("test", "Test")).toBeGreaterThan(0);
        expect(ORDINAL_COMPARER("test", "testing")).toBeLessThan(0);
        expect(ORDINAL_COMPARER("testing", "test")).toBeGreaterThan(0);
    });

    test("treats undefined as smaller than any other value", () => {
        expect(ORDINAL_COMPARER(undefined, "test")).toBeLessThan(0);
        expect(ORDINAL_COMPARER(undefined, null)).toBeLessThan(0);
        expect(ORDINAL_COMPARER(undefined, undefined)).toBe(0);
    });

    test("treats null as smaller than any other value except undefined", () => {
        expect(ORDINAL_COMPARER(null, "test")).toBeLessThan(0);
        expect(ORDINAL_COMPARER(null, undefined)).toBeGreaterThan(0);
        expect(ORDINAL_COMPARER(null, null)).toBe(0);
    });
});

describe("IGNORE_CASE_COMPARER", () => {
    test("compares two strings using case-insensitive ordinal comparison", () => {
        expect(IGNORE_CASE_COMPARER("A", "a")).toBe(0);
        expect(IGNORE_CASE_COMPARER("a", "B")).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER("A", "b")).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER("A", "B")).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER("B", "a")).toBeGreaterThan(0);
        expect(IGNORE_CASE_COMPARER("b", "A")).toBeGreaterThan(0);
        expect(IGNORE_CASE_COMPARER("B", "A")).toBeGreaterThan(0);
    });

    test("ignores case differences when comparing strings", () => {
        expect(IGNORE_CASE_COMPARER("test", "test")).toBe(0);
        expect(IGNORE_CASE_COMPARER("Test", "test")).toBe(0);
        expect(IGNORE_CASE_COMPARER("TEST", "test")).toBe(0);
        expect(IGNORE_CASE_COMPARER("test", "TEST")).toBe(0);
        expect(IGNORE_CASE_COMPARER("Test", "TEST")).toBe(0);
    });

    test("treats undefined as smaller than any other value", () => {
        expect(IGNORE_CASE_COMPARER(undefined, "test")).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER(undefined, null)).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER(undefined, undefined)).toBe(0);
    });

    test("treats null as smaller than any other value except undefined", () => {
        expect(IGNORE_CASE_COMPARER(null, "test")).toBeLessThan(0);
        expect(IGNORE_CASE_COMPARER(null, undefined)).toBeGreaterThan(0);
        expect(IGNORE_CASE_COMPARER(null, null)).toBe(0);
    });
});
