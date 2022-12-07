import { CompositeComparer } from "@/utils/comparison/composite-comparer";
import {
    createComparer,
    combineComparers,
    invertComparer,
    convertComparerToEqualityComparer,
    createBaseComparer,
    createDefaultComparer,
} from "@/utils/comparison/comparer";

describe("createComparer", () => {
    test("creates a CompositeComparer from the given comparer", () => {
        const comparer = createComparer((a: number, b: number) => a - b);

        expect(comparer).toBeInstanceOf(CompositeComparer);
    });
});

describe("combineComparers", () => {
    test("chains comparers in the right order", () => {
        const firstCompare = (a: [number, string], b: [number, string]) => a[0] - b[0];
        const secondCompare = (a: [number, string], b: [number, string]) => a[1].localeCompare(b[1]);

        const comparer = combineComparers(firstCompare, secondCompare);

        expect(comparer([1, "b"], [2, "a"])).toBeLessThan(0);
        expect(comparer([2, "a"], [1, "b"])).toBeGreaterThan(0);
        expect(comparer([1, "a"], [1, "b"])).toBeLessThan(0);
        expect(comparer([1, "b"], [1, "a"])).toBeGreaterThan(0);
        expect(comparer([1, "a"], [1, "a"])).toEqual(0);
    });
});

describe("invertComparer", () => {
    test("inverts comparisons", () => {
        const comparer = invertComparer((a: number, b:number) => a - b);

        expect(comparer(5, 3)).toBeLessThan(0);
        expect(comparer(3, 5)).toBeGreaterThan(0);
        expect(comparer(5, 5)).toEqual(0);
    });
});

describe("convertComparerToEqualityComparer", () => {
    test("returns an equality comparer that returns true when the original comparer would return 0", () => {
        const comparer = convertComparerToEqualityComparer((a: number, b: number) => a - b);

        expect(comparer(5, 5)).toEqual(true);
        expect(comparer(3, 5)).toEqual(false);
        expect(comparer(5, 3)).toEqual(false);
    });
});

describe("createBaseComparer", () => {
    test("treats undefined as smaller than any other value", () => {
        const comparer = createBaseComparer();

        expect(comparer(undefined, null)).toBeLessThan(0);
        expect(comparer(undefined, 5)).toBeLessThan(0);
        expect(comparer(undefined, "test")).toBeLessThan(0);
        expect(comparer(undefined, undefined)).toEqual(0);
    });

    test("treats null as smaller than any other value except undefined", () => {
        const comparer = createBaseComparer();

        expect(comparer(null, undefined)).toBeGreaterThan(0);
        expect(comparer(null, null)).toEqual(0);
        expect(comparer(null, 5)).toBeLessThan(0);
        expect(comparer(null, "test")).toBeLessThan(0);
    });

    test("treats any non-null and non-undefined values as equal", () => {
        const comparer = createBaseComparer();

        expect(comparer(5, 5)).toEqual(0);
        expect(comparer("test", "test")).toEqual(0);
        expect(comparer("test", 5)).toEqual(0);
        expect(comparer({}, [])).toEqual(0);
    });
});

describe("createDefaultComparer", () => {
    test("compares two values using their natural order", () => {
        const comparer = createDefaultComparer();

        expect(comparer(5, 3)).toBeGreaterThan(0);
        expect(comparer(3, 5)).toBeLessThan(0);
        expect(comparer(5, 5)).toEqual(0);

        expect(comparer("b", "a")).toBeGreaterThan(0);
        expect(comparer("a", "b")).toBeLessThan(0);
        expect(comparer("a", "a")).toEqual(0);
    });

    test("treats undefined as smaller than any other value", () => {
        const comparer = createDefaultComparer();

        expect(comparer(undefined, null)).toBeLessThan(0);
        expect(comparer(undefined, 5)).toBeLessThan(0);
        expect(comparer(undefined, "test")).toBeLessThan(0);
        expect(comparer(undefined, undefined)).toEqual(0);
    });

    test("treats null as smaller than any other value except undefined", () => {
        const comparer = createDefaultComparer();

        expect(comparer(null, undefined)).toBeGreaterThan(0);
        expect(comparer(null, null)).toEqual(0);
        expect(comparer(null, 5)).toBeLessThan(0);
        expect(comparer(null, "test")).toBeLessThan(0);
    });
});
