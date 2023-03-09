import { ForgeEnvironmentType } from "@/loaders/forge/forge-environment-type";

describe("ForgeEnvironmentType", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of ForgeEnvironmentType.values()) {
                expect(ForgeEnvironmentType.parse(ForgeEnvironmentType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of ForgeEnvironmentType.values()) {
                expect(ForgeEnvironmentType.parse(ForgeEnvironmentType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of ForgeEnvironmentType.values()) {
                expect(ForgeEnvironmentType.parse(ForgeEnvironmentType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of ForgeEnvironmentType.values()) {
                expect(ForgeEnvironmentType.parse(ForgeEnvironmentType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
