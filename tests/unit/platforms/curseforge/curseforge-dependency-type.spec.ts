import { DependencyType } from "@/dependencies/dependency-type";
import { CurseForgeDependencyType } from "@/platforms/curseforge/curseforge-dependency-type";

describe("CurseForgeDependencyType", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of CurseForgeDependencyType.values()) {
                expect(CurseForgeDependencyType.parse(CurseForgeDependencyType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of CurseForgeDependencyType.values()) {
                expect(CurseForgeDependencyType.parse(CurseForgeDependencyType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of CurseForgeDependencyType.values()) {
                expect(CurseForgeDependencyType.parse(CurseForgeDependencyType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of CurseForgeDependencyType.values()) {
                expect(CurseForgeDependencyType.parse(CurseForgeDependencyType.format(value).toUpperCase())).toBe(value);
            }
        });
    });

    describe("fromDependencyType", () => {
        test("returns `CurseForgeDependencyType.REQUIRED_DEPENDENCY` for `DependencyType.REQUIRED`", () => {
            expect(CurseForgeDependencyType.fromDependencyType(DependencyType.REQUIRED)).toBe(CurseForgeDependencyType.REQUIRED_DEPENDENCY);
        });

        test("returns `CurseForgeDependencyType.OPTIONAL_DEPENDENCY` for `DependencyType.RECOMMENDED`", () => {
            expect(CurseForgeDependencyType.fromDependencyType(DependencyType.RECOMMENDED)).toBe(CurseForgeDependencyType.OPTIONAL_DEPENDENCY);
        });

        test("returns `CurseForgeDependencyType.EMBEDDED_LIBRARY` for `DependencyType.EMBEDDED`", () => {
            expect(CurseForgeDependencyType.fromDependencyType(DependencyType.EMBEDDED)).toBe(CurseForgeDependencyType.EMBEDDED_LIBRARY);
        });

        test("returns `CurseForgeDependencyType.OPTIONAL_DEPENDENCY` for `DependencyType.OPTIONAL`", () => {
            expect(CurseForgeDependencyType.fromDependencyType(DependencyType.OPTIONAL)).toBe(CurseForgeDependencyType.OPTIONAL_DEPENDENCY);
        });

        test("returns `CurseForgeDependencyType.INCOMPATIBLE` for `DependencyType.CONFLICTING`", () => {
            expect(CurseForgeDependencyType.fromDependencyType(DependencyType.CONFLICTING)).toBe(CurseForgeDependencyType.INCOMPATIBLE);
        });

        test("returns `CurseForgeDependencyType.INCOMPATIBLE` for `DependencyType.INCOMPATIBLE`", () => {
            expect(CurseForgeDependencyType.fromDependencyType(DependencyType.INCOMPATIBLE)).toBe(CurseForgeDependencyType.INCOMPATIBLE);
        });

        test("returns undefined for invalid DependencyType values", () => {
            expect(CurseForgeDependencyType.fromDependencyType(undefined)).toBeUndefined();
            expect(CurseForgeDependencyType.fromDependencyType("invalid value" as DependencyType)).toBeUndefined();
        });
    });

    describe("toDependencyType", () => {
        test("returns `DependencyType.EMBEDDED` for `CurseForgeDependencyType.EMBEDDED_LIBRARY`", () => {
            expect(CurseForgeDependencyType.toDependencyType(CurseForgeDependencyType.EMBEDDED_LIBRARY)).toBe(DependencyType.EMBEDDED);
        });

        test("returns `DependencyType.INCOMPATIBLE` for `CurseForgeDependencyType.INCOMPATIBLE`", () => {
            expect(CurseForgeDependencyType.toDependencyType(CurseForgeDependencyType.INCOMPATIBLE)).toBe(DependencyType.INCOMPATIBLE);
        });

        test("returns `DependencyType.OPTIONAL` for `CurseForgeDependencyType.OPTIONAL_DEPENDENCY`", () => {
            expect(CurseForgeDependencyType.toDependencyType(CurseForgeDependencyType.OPTIONAL_DEPENDENCY)).toBe(DependencyType.OPTIONAL);
        });

        test("returns `DependencyType.REQUIRED` for `CurseForgeDependencyType.REQUIRED_DEPENDENCY`", () => {
            expect(CurseForgeDependencyType.toDependencyType(CurseForgeDependencyType.REQUIRED_DEPENDENCY)).toBe(DependencyType.REQUIRED);
        });

        test("returns `DependencyType.RECOMMENDED` for `CurseForgeDependencyType.TOOL`", () => {
            expect(CurseForgeDependencyType.toDependencyType(CurseForgeDependencyType.TOOL)).toBe(DependencyType.RECOMMENDED);
        });

        test("returns undefined for invalid CurseForgeDependencyType values", () => {
            expect(CurseForgeDependencyType.toDependencyType(undefined)).toBeUndefined();
            expect(CurseForgeDependencyType.toDependencyType("invalid value" as CurseForgeDependencyType)).toBeUndefined();
        });
    });
});
