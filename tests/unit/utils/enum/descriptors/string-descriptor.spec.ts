import { StringDescriptor } from "@/utils/enum/descriptors/string-descriptor";

describe("StringDescriptor", () => {
    const descriptor = new StringDescriptor();

    describe("name", () => {
        test("returns 'string' as name", () => {
            expect(descriptor.name).toBe("string");
        });
    });

    describe("defaultValue", () => {
        test("returns '' as default value", () => {
            expect(descriptor.defaultValue).toBe("");
        });
    });

    describe("hasFlag", () => {
        test("returns true if flag is set", () => {
            expect(descriptor.hasFlag("value1, value2, value3", "value2")).toBe(true);
        });

        test("returns false if flag is not set", () => {
            expect(descriptor.hasFlag("value1, value2, value3", "value4")).toBe(false);
        });
    });

    describe("addFlag", () => {
        test("adds flag to value", () => {
            expect(descriptor.addFlag("value1, value2", "value3")).toBe("value1, value2, value3");
        });

        test("does not add flag if it is already set", () => {
            expect(descriptor.addFlag("value1, value2, value3", "value3")).toBe("value1, value2, value3");
        });
    });

    describe("removeFlag", () => {
        test("removes flag from value", () => {
            expect(descriptor.removeFlag("value1, value2, value3", "value2")).toBe("value1, value3");
        });

        test("does not remove flag if it does not exist", () => {
            expect(descriptor.removeFlag("value1, value2", "value3")).toBe("value1, value2");
        });
    });
});
