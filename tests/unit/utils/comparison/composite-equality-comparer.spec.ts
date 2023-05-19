import { CompositeEqualityComparer } from "@/utils/comparison/composite-equality-comparer";

describe("CompositeEqualityComparer", () => {
    describe("create", () => {
        test("creates a new instance from the given equality comparer", () => {
            const comparer = CompositeEqualityComparer.create((a: number, b: number) => a === b);

            expect(comparer).toBeInstanceOf(CompositeEqualityComparer);
        });
    });

    describe("equals", () => {
        test("returns true when values are equal", () => {
            const comparer = CompositeEqualityComparer.create((a: number, b: number) => a === b);

            expect(comparer.equals(0, 0)).toBe(true);
            expect(comparer.equals(1, 1)).toBe(true);
            expect(comparer.equals(2, 2)).toBe(true);
        });

        test("returns false when values are not equal", () => {
            const comparer = CompositeEqualityComparer.create((a: number, b: number) => a === b);

            expect(comparer.equals(2, 0)).toBe(false);
            expect(comparer.equals(0, 1)).toBe(false);
            expect(comparer.equals(1, 2)).toBe(false);
        });
    });

    describe("__invoke__", () => {
        test("can be used as a function", () => {
            const comparer = CompositeEqualityComparer.create((a: number, b: number) => a === b);

            expect(comparer(0, 0)).toBe(true);
            expect(comparer(1, 1)).toBe(true);
            expect(comparer(2, 2)).toBe(true);
            expect(comparer(2, 0)).toBe(false);
            expect(comparer(0, 1)).toBe(false);
            expect(comparer(1, 2)).toBe(false);
        });
    });

    describe("or", () => {
        test("returns true when either comparer returns true", () => {
            const comparerA = (x: number, y: number) => x === y;
            const comparerB = (x: number, y: number) => x < y;

            const comparer = CompositeEqualityComparer.create(comparerA).or(comparerB);

            expect(comparer.equals(1, 2)).toBe(true);
        });

        test("returns false when both comparers return false", () => {
            const comparerA = (x: number, y: number) => x === y;
            const comparerB = (x: number, y: number) => x < y;

            const comparer = CompositeEqualityComparer.create(comparerA).or(comparerB);

            expect(comparer.equals(2, 1)).toBe(false);
        });
    });

    describe("and", () => {
        test("returns true when both comparers return true", () => {
            const comparerA = (x: number, y: number) => x === y;
            const comparerB = (x: number, y: number) => x % 2 === y;

            const comparer = CompositeEqualityComparer.create(comparerA).and(comparerB);

            expect(comparer.equals(1, 1)).toBe(true);
        });

        test("returns false when either comparer returns false", () => {
            const comparerA = (x: number, y: number) => x === y;
            const comparerB = (x: number, y: number) => x % 2 === y;

            const comparer = CompositeEqualityComparer.create(comparerA).and(comparerB);

            expect(comparer.equals(2, 2)).toBe(false);
        });
    });

    describe("negate", () => {
        test("returns true when original comparer returns false", () => {
            const comparer = CompositeEqualityComparer.create((a: number, b: number) => a === b).negate();

            expect(comparer.equals(1, 2)).toBe(true);
        });

        test("returns false when original comparer returns true", () => {
            const comparer = CompositeEqualityComparer.create((a: number, b: number) => a === b).negate();

            expect(comparer.equals(1, 1)).toBe(false);
        });
    });
});
