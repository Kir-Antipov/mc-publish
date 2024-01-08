import { DependencyType } from "@/dependencies/dependency-type";
import { ModrinthDependencyType } from "@/platforms/modrinth/modrinth-dependency-type";

describe("ModrinthDependencyType", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of ModrinthDependencyType.values()) {
                expect(ModrinthDependencyType.parse(ModrinthDependencyType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of ModrinthDependencyType.values()) {
                expect(ModrinthDependencyType.parse(ModrinthDependencyType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of ModrinthDependencyType.values()) {
                expect(ModrinthDependencyType.parse(ModrinthDependencyType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of ModrinthDependencyType.values()) {
                expect(ModrinthDependencyType.parse(ModrinthDependencyType.format(value).toUpperCase())).toBe(value);
            }
        });
    });

    describe("fromDependencyType", () => {
        test("returns `ModrinthDependencyType.REQUIRED` for `DependencyType.REQUIRED`", () => {
            expect(ModrinthDependencyType.fromDependencyType(DependencyType.REQUIRED)).toBe(ModrinthDependencyType.REQUIRED);
        });

        test("returns `ModrinthDependencyType.OPTIONAL` for `DependencyType.RECOMMENDED`", () => {
            expect(ModrinthDependencyType.fromDependencyType(DependencyType.RECOMMENDED)).toBe(ModrinthDependencyType.OPTIONAL);
        });

        test("returns `ModrinthDependencyType.EMBEDDED` for `DependencyType.EMBEDDED`", () => {
            expect(ModrinthDependencyType.fromDependencyType(DependencyType.EMBEDDED)).toBe(ModrinthDependencyType.EMBEDDED);
        });

        test("returns `ModrinthDependencyType.OPTIONAL` for `DependencyType.OPTIONAL`", () => {
            expect(ModrinthDependencyType.fromDependencyType(DependencyType.OPTIONAL)).toBe(ModrinthDependencyType.OPTIONAL);
        });

        test("returns `ModrinthDependencyType.INCOMPATIBLE` for `DependencyType.CONFLICTING`", () => {
            expect(ModrinthDependencyType.fromDependencyType(DependencyType.CONFLICTING)).toBe(ModrinthDependencyType.INCOMPATIBLE);
        });

        test("returns `ModrinthDependencyType.INCOMPATIBLE` for `DependencyType.INCOMPATIBLE`", () => {
            expect(ModrinthDependencyType.fromDependencyType(DependencyType.INCOMPATIBLE)).toBe(ModrinthDependencyType.INCOMPATIBLE);
        });

        test("returns undefined for invalid DependencyType values", () => {
            expect(ModrinthDependencyType.fromDependencyType(undefined)).toBeUndefined();
            expect(ModrinthDependencyType.fromDependencyType("invalid value" as DependencyType)).toBeUndefined();
        });
    });

    describe("toDependencyType", () => {
        test("returns `DependencyType.REQUIRED` for `ModrinthDependencyType.REQUIRED`", () => {
            expect(ModrinthDependencyType.toDependencyType(ModrinthDependencyType.REQUIRED)).toBe(DependencyType.REQUIRED);
        });

        test("returns `DependencyType.OPTIONAL` for `ModrinthDependencyType.OPTIONAL`", () => {
            expect(ModrinthDependencyType.toDependencyType(ModrinthDependencyType.OPTIONAL)).toBe(DependencyType.OPTIONAL);
        });

        test("returns `DependencyType.INCOMPATIBLE` for `ModrinthDependencyType.INCOMPATIBLE`", () => {
            expect(ModrinthDependencyType.toDependencyType(ModrinthDependencyType.INCOMPATIBLE)).toBe(DependencyType.INCOMPATIBLE);
        });

        test("returns `DependencyType.EMBEDDED` for `ModrinthDependencyType.EMBEDDED`", () => {
            expect(ModrinthDependencyType.toDependencyType(ModrinthDependencyType.EMBEDDED)).toBe(DependencyType.EMBEDDED);
        });

        test("returns undefined for invalid ModrinthDependencyType values", () => {
            expect(ModrinthDependencyType.toDependencyType(undefined)).toBeUndefined();
            expect(ModrinthDependencyType.toDependencyType("invalid value" as ModrinthDependencyType)).toBeUndefined();
        });
    });
});
