import { DependencyType } from "@/dependencies/dependency-type";
import { NeoForgeDependencyType } from "@/loaders/neoforge/neoforge-dependency-type";

describe("NeoForgeDependencyType", () => {
    describe("toDependencyType", () => {
        test("returns corresponding DependencyType", () => {
            expect(NeoForgeDependencyType.toDependencyType(NeoForgeDependencyType.INCOMPATIBLE)).toBe(DependencyType.INCOMPATIBLE);
            expect(NeoForgeDependencyType.toDependencyType(NeoForgeDependencyType.DISCOURAGED)).toBe(DependencyType.CONFLICTING);
            expect(NeoForgeDependencyType.toDependencyType(NeoForgeDependencyType.REQUIRED)).toBe(DependencyType.REQUIRED);
            expect(NeoForgeDependencyType.toDependencyType(NeoForgeDependencyType.EMBEDDED)).toBe(DependencyType.EMBEDDED);
            expect(NeoForgeDependencyType.toDependencyType(NeoForgeDependencyType.OPTIONAL)).toBe(DependencyType.OPTIONAL);
        });

        test("returns undefined for unknown values", () => {
            expect(NeoForgeDependencyType.toDependencyType("" as NeoForgeDependencyType)).toBeUndefined();
        });
    });

    describe("fromDependencyType", () => {
        test("converts DependencyType to NeoForgeDependencyType", () => {
            expect(NeoForgeDependencyType.fromDependencyType(DependencyType.CONFLICTING)).toBe(NeoForgeDependencyType.DISCOURAGED);
            expect(NeoForgeDependencyType.fromDependencyType(DependencyType.EMBEDDED)).toBe(NeoForgeDependencyType.EMBEDDED);
            expect(NeoForgeDependencyType.fromDependencyType(DependencyType.INCOMPATIBLE)).toBe(NeoForgeDependencyType.INCOMPATIBLE);
            expect(NeoForgeDependencyType.fromDependencyType(DependencyType.OPTIONAL)).toBe(NeoForgeDependencyType.OPTIONAL);
            expect(NeoForgeDependencyType.fromDependencyType(DependencyType.RECOMMENDED)).toBe(NeoForgeDependencyType.OPTIONAL);
            expect(NeoForgeDependencyType.fromDependencyType(DependencyType.REQUIRED)).toBe(NeoForgeDependencyType.REQUIRED);
        });

        test("returns undefined for unknown values", () => {
            expect(NeoForgeDependencyType.fromDependencyType("" as DependencyType)).toBeUndefined();
        });
    });

    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of NeoForgeDependencyType.values()) {
                expect(NeoForgeDependencyType.parse(NeoForgeDependencyType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of NeoForgeDependencyType.values()) {
                expect(NeoForgeDependencyType.parse(NeoForgeDependencyType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of NeoForgeDependencyType.values()) {
                expect(NeoForgeDependencyType.parse(NeoForgeDependencyType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of NeoForgeDependencyType.values()) {
                expect(NeoForgeDependencyType.parse(NeoForgeDependencyType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
