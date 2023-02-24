import { DependencyType } from "@/dependencies/dependency-type";

describe("DependencyType", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of DependencyType.values()) {
                expect(DependencyType.parse(DependencyType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of DependencyType.values()) {
                expect(DependencyType.parse(DependencyType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of DependencyType.values()) {
                expect(DependencyType.parse(DependencyType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of DependencyType.values()) {
                expect(DependencyType.parse(DependencyType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
