import { BigIntDescriptor } from "@/utils/enum/descriptors/bigint-descriptor";

describe("BigIntDescriptor", () => {
    const descriptor = new BigIntDescriptor();

    describe("name", () => {
        test("returns 'bigint' as name", () => {
            expect(descriptor.name).toBe("bigint");
        });
    });

    describe("defaultValue", () => {
        test("returns 0n as default value", () => {
            expect(descriptor.defaultValue).toBe(0n);
        });
    });

    describe("hasFlag", () => {
        test("returns true if flag is set", () => {
            expect(descriptor.hasFlag(3n, 2n)).toBe(true);
        });

        test("returns false if flag is not set", () => {
            expect(descriptor.hasFlag(3n, 4n)).toBe(false);
        });
    });

    describe("addFlag", () => {
        test("adds flag to value", () => {
            expect(descriptor.addFlag(1n, 2n)).toBe(3n);
        });

        test("does not add flag if it is already set", () => {
            expect(descriptor.addFlag(3n, 2n)).toBe(3n);
        });
    });

    describe("removeFlag", () => {
        test("removes flag from value", () => {
            expect(descriptor.removeFlag(3n, 2n)).toBe(1n);
        });

        test("does not remove flag if it does not exist", () => {
            expect(descriptor.removeFlag(1n, 2n)).toBe(1n);
        });
    });
});
