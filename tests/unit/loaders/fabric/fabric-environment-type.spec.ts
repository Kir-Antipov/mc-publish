import { FabricEnvironmentType } from "@/loaders/fabric/fabric-environment-type";

describe("FabricEnvironmentType", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of FabricEnvironmentType.values()) {
                expect(FabricEnvironmentType.parse(FabricEnvironmentType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of FabricEnvironmentType.values()) {
                expect(FabricEnvironmentType.parse(FabricEnvironmentType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of FabricEnvironmentType.values()) {
                expect(FabricEnvironmentType.parse(FabricEnvironmentType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of FabricEnvironmentType.values()) {
                expect(FabricEnvironmentType.parse(FabricEnvironmentType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
