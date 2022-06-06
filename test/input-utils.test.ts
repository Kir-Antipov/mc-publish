import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { setupInput, unsetInput } from "./utils/input-utils";
import { getInputAsObject, mapStringInput, mapObjectInput, mapNumberInput, mapBooleanInput } from "../src/utils/input-utils";

const defaultInput = {
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
};

describe("getInputAsObject", () => {
    beforeAll(() => setupInput(defaultInput));
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

describe("mapStringInput", () => {
    beforeAll(() => setupInput(defaultInput));
    afterAll(() => unsetInput());

    test("returns default value if input is not a string", () => {
        const input = getInputAsObject();

        expect(input["undefined"]).toBeUndefined();
        expect(mapStringInput(input["undefined"], "42")).toBe("42");
    });

    test("maps strings to string", () => {
        const input = getInputAsObject();
        expect(mapStringInput(input["boolean"], "")).toBe("true");
        expect(mapStringInput(input["number"], "")).toBe("1");
        expect(mapStringInput(input["object"])).toBe({}.toString());
    });
});

describe("mapObjectInput", () => {
    beforeAll(() => setupInput(defaultInput));
    afterAll(() => unsetInput());

    test("returns default value if input is not an object", () => {
        const input = getInputAsObject();

        expect(input["boolean"]).not.toBeUndefined();
        expect(mapObjectInput(input["boolean"], null)).toBeNull();

        expect(input["number"]).not.toBeUndefined();
        expect(mapObjectInput(input["number"], null)).toBeNull()

        expect(input["array"]).not.toBeUndefined();
        expect(mapObjectInput(input["array"])).toBeNull()

        expect(input["undefined"]).toBeUndefined();
        expect(mapObjectInput(input["undefined"], { answer: 42 })).toStrictEqual({ answer: 42 });
    });

    test("maps object values to object", () => {
        const input = getInputAsObject();
        expect(mapObjectInput(input["modrinth"], null)).toStrictEqual({ id: "42", token: "1234", filesPrimary: "primaryPath", filesSecondary: "secondaryPath", files: { primary: "primaryPath", secondary: "secondaryPath" } });
    });
});

describe("mapNumberInput", () => {
    beforeAll(() => setupInput({
        ...defaultInput,
        numberOne: 1,
        numberOneString: "1",
        numberOneStringWithWhitespace: "  1  ",
    }));
    afterAll(() => unsetInput());

    test("returns default value if input is not number or number-like", () => {
        const input = getInputAsObject();

        expect(input["boolean"]).not.toBeUndefined();
        expect(mapNumberInput(input["boolean"], 0)).toBe(0);

        expect(input["object"]).not.toBeUndefined();
        expect(mapNumberInput(input["object"], 0)).toBe(0);

        expect(input["array"]).not.toBeUndefined();
        expect(mapNumberInput(input["array"], 0)).toBe(0);

        expect(input["undefined"]).toBeUndefined();
        expect(mapNumberInput(input["undefined"], 1)).toBe(1);
    });

    test("maps number and number-like values to number", () => {
        const input = getInputAsObject();

        expect(mapNumberInput(input["numberone"], 0)).toBe(1);
        expect(mapNumberInput(input["numberonestring"], 0)).toBe(1);
        expect(mapNumberInput(input["numberonestringwithwhitespace"])).toBe(1);
    });
});

describe("mapBooleanInput", () => {
    beforeAll(() => setupInput({
        ...defaultInput,
        booleanTrue: true,
        booleanTrueStringLowerCase: "true",
        booleanTrueStringUpperCase: "TRUE",
        booleanTrueStringUpperCaseWithWhitespace: "  TRUE  ",
        booleanFalse: false,
        booleanFalseStringLowerCase: "false",
        booleanFalseStringUpperCase: "FALSE",
        booleanFalseStringUpperCaseWithWhitespace: "  FALSE  ",
    }));
    afterAll(() => unsetInput());

    test("returns default value if input is not boolean or boolean-like", () => {
        const input = getInputAsObject();

        expect(input["object"]).not.toBeUndefined();
        expect(mapBooleanInput(input["object"], false)).toBe(false);

        expect(input["number"]).not.toBeUndefined();
        expect(mapBooleanInput(input["number"], false)).toBe(false);

        expect(input["array"]).not.toBeUndefined();
        expect(mapBooleanInput(input["array"], false)).toBe(false);

        expect(input["undefined"]).toBeUndefined();
        expect(mapBooleanInput(input["undefined"], true)).toBe(true);
    });

    test("maps boolean and boolean-like values to boolean", () => {
        const input = getInputAsObject();
        expect(mapBooleanInput(input["booleantrue"], false)).toBe(true);
        expect(mapBooleanInput(input["booleantruestringlowercase"], false)).toBe(true);
        expect(mapBooleanInput(input["booleantruestringuppercase"], false)).toBe(true);
        expect(mapBooleanInput(input["booleantruestringuppercasewithwhitespace"])).toBe(true);
        expect(mapBooleanInput(input["booleanfalse"], true)).toBe(false);
        expect(mapBooleanInput(input["booleanfalsestringlowercase"], true)).toBe(false);
        expect(mapBooleanInput(input["booleanfalsestringuppercase"], true)).toBe(false);
        expect(mapBooleanInput(input["booleanfalsestringuppercasewithwhitespace"], true)).toBe(false);
    });
});
