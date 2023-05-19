import { QuiltEnvironmentType } from "@/loaders/quilt/quilt-environment-type";

describe("QuiltEnvironmentType", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of QuiltEnvironmentType.values()) {
                expect(QuiltEnvironmentType.parse(QuiltEnvironmentType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of QuiltEnvironmentType.values()) {
                expect(QuiltEnvironmentType.parse(QuiltEnvironmentType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of QuiltEnvironmentType.values()) {
                expect(QuiltEnvironmentType.parse(QuiltEnvironmentType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of QuiltEnvironmentType.values()) {
                expect(QuiltEnvironmentType.parse(QuiltEnvironmentType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
