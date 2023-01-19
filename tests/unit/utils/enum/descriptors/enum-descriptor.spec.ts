import { getEnumDescriptorByUnderlyingType, inferEnumDescriptorOrThrow } from "@/utils/enum/descriptors/enum-descriptor";

describe("getEnumDescriptorByUnderlyingType", () => {
    test("returns the correct descriptor for a known type", () => {
        const knownTypes = ["number", "bigint", "boolean", "string"] as const;
        for (const knowType of knownTypes) {
            expect(getEnumDescriptorByUnderlyingType(knowType)?.name).toBe(knowType);
        }
    });

    test("returns undefined for an unknown type", () => {
        expect(getEnumDescriptorByUnderlyingType("unknownType" as "string")).toBeUndefined();
    });
});

describe("inferEnumDescriptorOrThrow", () => {
    test("infers correct descriptor based on enum values", () => {
        expect(inferEnumDescriptorOrThrow([1, 2, 3]).name).toBe("number");
        expect(inferEnumDescriptorOrThrow(["a", "b", "c"]).name).toBe("string");
    });

    test("throws error if enum contains objects of different types", () => {
        expect(() => inferEnumDescriptorOrThrow([1, "b", 3])).toThrow("The enum must contain objects of the same type.");
    });

    test("throws error if enum has an invalid underlying type", () => {
        expect(() => inferEnumDescriptorOrThrow([{}])).toThrow("'object' is not an acceptable enum type.");
    });

    test("returns a number descriptor for an empty array", () => {
        expect(inferEnumDescriptorOrThrow([]).name).toBe("number");
    });
});
