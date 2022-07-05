import { describe, test, expect } from "@jest/globals";
import DependencyKind from "../../../src/metadata/dependency-kind";

describe("DependencyKind.getValues", () => {
    test("all DependencyKind values are returned", () => {
        const kinds = DependencyKind.getValues();
        expect(kinds).toHaveLength(6);
        expect(kinds).toContain(DependencyKind.Depends);
        expect(kinds).toContain(DependencyKind.Recommends);
        expect(kinds).toContain(DependencyKind.Includes);
        expect(kinds).toContain(DependencyKind.Suggests);
        expect(kinds).toContain(DependencyKind.Conflicts);
        expect(kinds).toContain(DependencyKind.Breaks);
    });
});

describe("DependencyKind.parse", () => {
    test("every DependencyKind can be parsed", () => {
        for (const kind of DependencyKind.getValues()) {
            expect(DependencyKind.parse(DependencyKind.toString(kind))).toStrictEqual(kind);
        }
    });

    test("DependencyKind's name is case-insensitive", () => {
        for (const kind of DependencyKind.getValues()) {
            expect(DependencyKind.parse(DependencyKind.toString(kind).toLowerCase())).toStrictEqual(kind);
            expect(DependencyKind.parse(DependencyKind.toString(kind).toUpperCase())).toStrictEqual(kind);
        }
    });

    test("undefined is returned when the value cannot be parsed", () => {
        expect(DependencyKind.parse("There's no such dependency kind")).toBeUndefined();
    });
});