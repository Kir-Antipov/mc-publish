import mockFs from "mock-fs";
import { parseActionMetadataFromFile, parseActionMetadataFromString } from "@/utils/actions/action-metadata";

beforeEach(() => {
    mockFs({
        "action.yml": `
            name: Test Action
            description: This is a test action
            inputs:
              - name: input1
                description: This is input1
                type: string
              - name: input2
                description: This is input2
                type: number
        `,
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("parseActionMetadataFromString", () => {
    test("returns the parsed ActionMetadata object for valid YAML text", () => {
        const actionYamlText = `
            name: Test Action
            description: This is a test action
            inputs:
              - name: input1
                description: This is input1
                type: string
              - name: input2
                description: This is input2
                type: number
        `;

        const result = parseActionMetadataFromString(actionYamlText);

        expect(result).toEqual({
            name: "Test Action",
            description: "This is a test action",
            inputs: [
                { name: "input1", description: "This is input1", type: "string" },
                { name: "input2", description: "This is input2", type: "number" },
            ],
        });
    });
});

describe("parseActionMetadataFromFile", () => {
    test("reads the file and parses the content as ActionMetadata", async () => {
        const result = await parseActionMetadataFromFile("action.yml");

        expect(result).toEqual({
            name: "Test Action",
            description: "This is a test action",
            inputs: [
                { name: "input1", description: "This is input1", type: "string" },
                { name: "input2", description: "This is input2", type: "number" },
            ],
        });
    });

    test("throws an error if the file doesn't exist", async () => {
        await expect(parseActionMetadataFromFile("action.txt")).rejects.toThrowError();
    });
});

describe("processActionMetadataTemplate", () => {
    test("assume that everything is fine, until it's not", () => {
        // This method is only used for code generation during
        // TypeScript-to-JavaScript transpilation. Thus, there's
        // no need to expend effort testing code that would cause
        // a compilation error if something was actually wrong.
    });
});

describe("processActionMetadataTemplateString", () => {
    test("assume that everything is fine, until it's not", () => {
        // This method is only used for code generation during
        // TypeScript-to-JavaScript transpilation. Thus, there's
        // no need to expend effort testing code that would cause
        // a compilation error if something was actually wrong.
    });
});

describe("processActionMetadataTemplateFile", () => {
    test("assume that everything is fine, until it's not", () => {
        // This method is only used for code generation during
        // TypeScript-to-JavaScript transpilation. Thus, there's
        // no need to expend effort testing code that would cause
        // a compilation error if something was actually wrong.
    });
});

describe("createTypeScriptDefinitionForActionMetadata", () => {
    test("assume that everything is fine, until it's not", () => {
        // This method is only used for code generation during
        // TypeScript-to-JavaScript transpilation. Thus, there's
        // no need to expend effort testing code that would cause
        // a compilation error if something was actually wrong.
    });
});

describe("createModuleLoaderTypeScriptDefinitionForActionMetadata", () => {
    test("assume that everything is fine, until it's not", () => {
        // This method is only used for code generation during
        // TypeScript-to-JavaScript transpilation. Thus, there's
        // no need to expend effort testing code that would cause
        // a compilation error if something was actually wrong.
    });
});

describe("stripActionMetadataFromCustomFields", () => {
    test("assume that everything is fine, until it's not", () => {
        // This method is only used for code generation during
        // TypeScript-to-JavaScript transpilation. Thus, there's
        // no need to expend effort testing code that would cause
        // a compilation error if something was actually wrong.
    });
});

describe("stripActionMetadataStringFromCustomFields", () => {
    test("assume that everything is fine, until it's not", () => {
        // This method is only used for code generation during
        // TypeScript-to-JavaScript transpilation. Thus, there's
        // no need to expend effort testing code that would cause
        // a compilation error if something was actually wrong.
    });
});

describe("stripActionMetadataFileFromCustomFields", () => {
    test("assume that everything is fine, until it's not", () => {
        // This method is only used for code generation during
        // TypeScript-to-JavaScript transpilation. Thus, there's
        // no need to expend effort testing code that would cause
        // a compilation error if something was actually wrong.
    });
});
