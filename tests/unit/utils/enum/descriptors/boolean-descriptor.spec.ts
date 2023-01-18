import { BooleanDescriptor } from "@/utils/enum/descriptors/boolean-descriptor";

describe("BooleanDescriptor", () => {
    const descriptor = new BooleanDescriptor();

    describe("name", () => {
        test("returns 'boolean' as name", () => {
            expect(descriptor.name).toBe("boolean");
        });
    });

    describe("defaultValue", () => {
        test("returns false as default value", () => {
            expect(descriptor.defaultValue).toBe(false);
        });
    });

    describe("hasFlag", () => {
        test("returns true if flag is set", () => {
            expect(descriptor.hasFlag(true, true)).toBe(true);
        });

        test("returns false if flag is not set", () => {
            expect(descriptor.hasFlag(false, true)).toBe(false);
        });
    });

    describe("addFlag", () => {
        test("adds flag to value", () => {
            expect(descriptor.addFlag(false, true)).toBe(true);
        });

        test("does not add flag if it is already set", () => {
            expect(descriptor.addFlag(true, true)).toBe(true);
        });
    });

    describe("removeFlag", () => {
        test("removes flag from value", () => {
            expect(descriptor.removeFlag(true, true)).toBe(false);
        });

        test("does not remove flag if it does not exist", () => {
            expect(descriptor.removeFlag(false, true)).toBe(false);
        });
    });
});
