import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { setupInput, unsetInput } from "./utils/input-utils";
import { getInputAsObject } from "../src/utils/input-utils";

describe("getInputAsObject", () => {
    beforeAll(() => setupInput({
        "boolean": true,
        "object": { foo: "bar" },
        "number": 1,
        "array": ["foo", "bar"],
        "undefined": "${undefined}",

        "files-primary": "primaryPath",
        "files-secondary": "secondaryPath",
        "files-secondary-inner": "innerSecondaryPath",
        "files": "path",

        "modrinth-id": 42,
        "modrinth-token": "1234",
        "modrinth-files-primary": "primaryPath",
        "modrinth-files-secondary": "secondaryPath",

        "This is a Very--Long_Name!": "foo"
    }));
    afterAll(() => unsetInput());

    test("input object contains only strings", () => {
        const input = getInputAsObject();
        expect(input).toHaveProperty("boolean", "true");
        expect(input).toHaveProperty("object", {}.toString());
        expect(input).not.toHaveProperty("object.foo");
        expect(input).toHaveProperty("number", "1");
        expect(input).toHaveProperty("array", ["foo", "bar"].toString());
    });

    test("property names are converted to paths inside of the input object (a-b -> a.b and aB)", () => {
        const input = getInputAsObject();
        expect(input).toHaveProperty("modrinth.id", "42");
        expect(input).toHaveProperty("modrinthId", "42");

        expect(input).toHaveProperty("modrinth.token", "1234");
        expect(input).toHaveProperty("modrinthToken", "1234");

        expect(input).toHaveProperty("modrinth.files.primary", "primaryPath");
        expect(input).toHaveProperty("modrinth.filesPrimary", "primaryPath");
        expect(input).toHaveProperty("modrinthFilesPrimary", "primaryPath");

        expect(input).toHaveProperty("modrinth.files.secondary", "secondaryPath");
        expect(input).toHaveProperty("modrinth.filesSecondary", "secondaryPath");
        expect(input).toHaveProperty("modrinthFilesSecondary", "secondaryPath");
    });

    test("string values do not have additional properties", () => {
        const input = getInputAsObject();
        expect(input).toHaveProperty("files", "path");
        expect(input).toHaveProperty("filesPrimary", "primaryPath");
        expect(input).toHaveProperty("filesSecondary", "secondaryPath");
        expect(input).toHaveProperty("filesSecondaryInner", "innerSecondaryPath");
        expect(input).not.toHaveProperty("files.primary");
        expect(input).not.toHaveProperty("files.secondary");
    });

    test("input object does not have empty property names", () => {
        const input = getInputAsObject();
        expect(input).toHaveProperty("this.is.a.very.long.name", "foo");
        expect(input).toHaveProperty("thisIsAVeryLongName", "foo");
    });

    test("special case for GitHub Actions: ${undefined} transforms into undefined", () => {
        const input = getInputAsObject();
        expect(input.undefined).toBeUndefined();
    });
});
