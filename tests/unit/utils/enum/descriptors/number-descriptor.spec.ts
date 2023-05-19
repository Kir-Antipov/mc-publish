import { NumberDescriptor } from "@/utils/enum/descriptors/number-descriptor";

describe("NumberDescriptor", () => {
    const descriptor = new NumberDescriptor();

    describe("name", () => {
        test("returns 'number' as name", () => {
            expect(descriptor.name).toBe("number");
        });
    });

    describe("defaultValue", () => {
        test("returns 0 as default value", () => {
            expect(descriptor.defaultValue).toBe(0);
        });
    });

    describe("hasFlag", () => {
        test("returns true if flag is set", () => {
            expect(descriptor.hasFlag(3, 2)).toBe(true);
        });

        test("returns false if flag is not set", () => {
            expect(descriptor.hasFlag(3, 4)).toBe(false);
        });
    });

    describe("addFlag", () => {
        test("adds flag to value", () => {
            expect(descriptor.addFlag(1, 2)).toBe(3);
        });

        test("does not add flag if it is already set", () => {
            expect(descriptor.addFlag(3, 2)).toBe(3);
        });
    });

    describe("removeFlag", () => {
        test("removes flag from value", () => {
            expect(descriptor.removeFlag(3, 2)).toBe(1);
        });

        test("does not remove flag if it does not exist", () => {
            expect(descriptor.removeFlag(1, 2)).toBe(1);
        });
    });
});
