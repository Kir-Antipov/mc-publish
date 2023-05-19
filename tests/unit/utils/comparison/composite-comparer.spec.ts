import { CompositeComparer } from "@/utils/comparison/composite-comparer";

describe("CompositeComparer", () => {
    describe("create", () => {
        test("creates a new instance from the given comparer", () => {
            const comparer = CompositeComparer.create((a: number, b: number) => a - b);

            expect(comparer).toBeInstanceOf(CompositeComparer);
        });
    });

    describe("compare", () => {
        test("compares two numbers using the original comparer", () => {
            const comparer = CompositeComparer.create((a: number, b: number) => a - b);

            expect(comparer.compare(5, 3)).toBeGreaterThan(0);
            expect(comparer.compare(3, 5)).toBeLessThan(0);
            expect(comparer.compare(5, 5)).toEqual(0);
        });
    });

    describe("__invoke__", () => {
        test("can be used as a function", () => {
            const comparer = CompositeComparer.create((a: number, b: number) => a - b);

            expect(comparer(5, 3)).toBeGreaterThan(0);
            expect(comparer(3, 5)).toBeLessThan(0);
            expect(comparer(5, 5)).toEqual(0);
        });
    });

    describe("thenBy", () => {
        test("chains comparers in the right order", () => {
            const firstCompare = (a: [number, string], b: [number, string]) => a[0] - b[0];
            const secondCompare = (a: [number, string], b: [number, string]) => a[1].localeCompare(b[1]);

            const comparer = CompositeComparer.create(firstCompare).thenBy(secondCompare);

            expect(comparer.compare([1, "b"], [2, "a"])).toBeLessThan(0);
            expect(comparer.compare([2, "a"], [1, "b"])).toBeGreaterThan(0);
            expect(comparer.compare([1, "a"], [1, "b"])).toBeLessThan(0);
            expect(comparer.compare([1, "b"], [1, "a"])).toBeGreaterThan(0);
            expect(comparer.compare([1, "a"], [1, "a"])).toEqual(0);
        });
    });

    describe("invert", () => {
        test("inverts comparisons", () => {
            const comparer = CompositeComparer.create((a: number, b:number) => a - b).invert();

            expect(comparer.compare(5, 3)).toBeLessThan(0);
            expect(comparer.compare(3, 5)).toBeGreaterThan(0);
            expect(comparer.compare(5, 5)).toEqual(0);
        });
    });

    describe("asEqualityComparer", () => {
        test("returns an equality comparer that returns true when the original comparer would return 0", () => {
            const comparer = CompositeComparer.create((a: number, b: number) => a - b).asEqualityComparer();

            expect(comparer(5, 5)).toEqual(true);
            expect(comparer(3, 5)).toEqual(false);
            expect(comparer(5, 3)).toEqual(false);
        });
    });
});
