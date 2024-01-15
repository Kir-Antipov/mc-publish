import { NeoForgeEnvironmentType } from "@/loaders/neoforge/neoforge-environment-type";

describe("NeoForgeEnvironmentType", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of NeoForgeEnvironmentType.values()) {
                expect(NeoForgeEnvironmentType.parse(NeoForgeEnvironmentType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of NeoForgeEnvironmentType.values()) {
                expect(NeoForgeEnvironmentType.parse(NeoForgeEnvironmentType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of NeoForgeEnvironmentType.values()) {
                expect(NeoForgeEnvironmentType.parse(NeoForgeEnvironmentType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of NeoForgeEnvironmentType.values()) {
                expect(NeoForgeEnvironmentType.parse(NeoForgeEnvironmentType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
