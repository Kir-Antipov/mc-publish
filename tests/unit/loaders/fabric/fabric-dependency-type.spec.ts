import { DependencyType } from "@/dependencies";
import { FabricDependencyType } from "@/loaders/fabric/fabric-dependency-type";

describe("FabricDependencyType", () => {
    describe("toDependencyType", () => {
        test("returns corresponding DependencyType", () => {
            expect(FabricDependencyType.toDependencyType(FabricDependencyType.BREAKS)).toBe(DependencyType.INCOMPATIBLE);
            expect(FabricDependencyType.toDependencyType(FabricDependencyType.CONFLICTS)).toBe(DependencyType.CONFLICTING);
            expect(FabricDependencyType.toDependencyType(FabricDependencyType.DEPENDS)).toBe(DependencyType.REQUIRED);
            expect(FabricDependencyType.toDependencyType(FabricDependencyType.INCLUDES)).toBe(DependencyType.EMBEDDED);
            expect(FabricDependencyType.toDependencyType(FabricDependencyType.RECOMMENDS)).toBe(DependencyType.RECOMMENDED);
            expect(FabricDependencyType.toDependencyType(FabricDependencyType.SUGGESTS)).toBe(DependencyType.OPTIONAL);
        });

        test("returns undefined for unknown values", () => {
            expect(FabricDependencyType.toDependencyType("" as FabricDependencyType)).toBeUndefined();
        });
    });

    describe("fromDependencyType", () => {
        test("converts DependencyType to FabricDependencyType", () => {
            expect(FabricDependencyType.fromDependencyType(DependencyType.CONFLICTING)).toBe(FabricDependencyType.CONFLICTS);
            expect(FabricDependencyType.fromDependencyType(DependencyType.EMBEDDED)).toBe(FabricDependencyType.INCLUDES);
            expect(FabricDependencyType.fromDependencyType(DependencyType.INCOMPATIBLE)).toBe(FabricDependencyType.BREAKS);
            expect(FabricDependencyType.fromDependencyType(DependencyType.OPTIONAL)).toBe(FabricDependencyType.SUGGESTS);
            expect(FabricDependencyType.fromDependencyType(DependencyType.RECOMMENDED)).toBe(FabricDependencyType.RECOMMENDS);
            expect(FabricDependencyType.fromDependencyType(DependencyType.REQUIRED)).toBe(FabricDependencyType.DEPENDS);
        });

        test("returns undefined for unknown values", () => {
            expect(FabricDependencyType.fromDependencyType("" as DependencyType)).toBeUndefined();
        });
    });

    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of FabricDependencyType.values()) {
                expect(FabricDependencyType.parse(FabricDependencyType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of FabricDependencyType.values()) {
                expect(FabricDependencyType.parse(FabricDependencyType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of FabricDependencyType.values()) {
                expect(FabricDependencyType.parse(FabricDependencyType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of FabricDependencyType.values()) {
                expect(FabricDependencyType.parse(FabricDependencyType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
