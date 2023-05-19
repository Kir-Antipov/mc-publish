import { CompositeEqualityComparer } from "@/utils/comparison/composite-equality-comparer";
import {
    andEqualityComparers,
    createDefaultEqualityComparer,
    createEqualityComparer,
    negateEqualityComparer,
    orEqualityComparers,
} from "@/utils/comparison/equality-comparer";

describe("createEqualityComparer", () => {
    test("creates a new CompositeEqualityComparer instance from the given equality comparer", () => {
        const comparer = createEqualityComparer((a: number, b: number) => a === b);

        expect(comparer).toBeInstanceOf(CompositeEqualityComparer);
    });
});

describe("orEqualityComparers", () => {
    test("returns true when either comparer returns true", () => {
        const comparerA = (x: number, y: number) => x === y;
        const comparerB = (x: number, y: number) => x < y;

        const comparer = orEqualityComparers(comparerA, comparerB);

        expect(comparer(1, 2)).toBe(true);
    });

    test("returns false when both comparers return false", () => {
        const comparerA = (x: number, y: number) => x === y;
        const comparerB = (x: number, y: number) => x < y;

        const comparer = orEqualityComparers(comparerA, comparerB);

        expect(comparer(2, 1)).toBe(false);
    });
});

describe("andEqualityComparers", () => {
    test("returns true when both comparers return true", () => {
        const comparerA = (x: number, y: number) => x === y;
        const comparerB = (x: number, y: number) => x % 2 === y;

        const comparer = andEqualityComparers(comparerA, comparerB);

        expect(comparer(1, 1)).toBe(true);
    });

    test("returns false when either comparer returns false", () => {
        const comparerA = (x: number, y: number) => x === y;
        const comparerB = (x: number, y: number) => x % 2 === y;

        const comparer = andEqualityComparers(comparerA, comparerB);

        expect(comparer(2, 2)).toBe(false);
    });
});

describe("negateEqualityComparer", () => {
    test("returns true when original comparer returns false", () => {
        const comparer = negateEqualityComparer((a: number, b: number) => a === b);

        expect(comparer(1, 2)).toBe(true);
    });

    test("returns false when original comparer returns true", () => {
        const comparer = negateEqualityComparer((a: number, b: number) => a === b);

        expect(comparer(1, 1)).toBe(false);
    });
});

describe("createDefaultEqualityComparer", () => {
    test("returns true for strictly equal values", () => {
        const comparer = createDefaultEqualityComparer();

        const sameRef = {};
        expect(comparer(1, 1)).toBe(true);
        expect(comparer("test", "test")).toBe(true);
        expect(comparer(sameRef, sameRef)).toBe(true);
        expect(comparer(Symbol.toStringTag, Symbol.toStringTag)).toBe(true);
        expect(comparer(null, null)).toBe(true);
        expect(comparer(undefined, undefined)).toBe(true);
    });

    test("returns false for not strictly equal values", () => {
        const comparer = createDefaultEqualityComparer();

        expect(comparer(1, 2)).toBe(false);
        expect(comparer(1, "1")).toBe(false);
        expect(comparer("test", "tset")).toBe(false);
        expect(comparer({}, {})).toBe(false);
        expect(comparer(Symbol("Symbol"), Symbol("Symbol"))).toBe(false);
        expect(comparer(null, undefined)).toBe(false);
    });
});
