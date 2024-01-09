import { ModuleLoader } from "@/utils/reflection/module-loader";
import { ActionMetadata } from "@/utils/actions/action-metadata";
import { ActionParameterPathParser } from "@/utils/actions/action-parameter-path-parser";
import { parseActionParameterTypeDescriptor } from "@/utils/actions/action-parameter-type-descriptor";
import { SYNTHETIC_UNDEFINED, getActionInput, getActionInputs, getAllActionInputs, getAllActionInputsAsObject, getAllActionInputsAsObjectUsingMetadata, setActionInput, setActionInputs } from "@/utils/actions/action-input";

describe("SYNTHETIC_UNDEFINED", () => {
    test("is defined (ironic)", () => {
        expect(typeof SYNTHETIC_UNDEFINED).toBe("string");
    });
});

describe("setActionInput", () => {
    test("sets the environment variable corresponding to the input", () => {
        const env = {};

        setActionInput("name", "value", env);

        expect(env["INPUT_NAME"]).toBe("value");
    });

    test("normalizes the input name before setting the environment variable", () => {
        const env = {};

        setActionInput("input name", "value", env);

        expect(env["INPUT_INPUT_NAME"]).toBe("value");
    });

    test("stringifies non-string values before setting the environment variable", () => {
        const env = {};

        setActionInput("name", { key: "value" }, env);

        expect(env["INPUT_NAME"]).toBe(JSON.stringify({ key: "value" }));
    });

    test("does not set the environment variable if the value is SYNTHETIC_UNDEFINED", () => {
        const env = {};

        setActionInput("name", SYNTHETIC_UNDEFINED, env);

        expect(env["INPUT_NAME"]).toBeUndefined();
    });

    test("does not set the environment variable if the value is undefined", () => {
        const env = {};

        setActionInput("name", undefined, env);

        expect(env["INPUT_NAME"]).toBeUndefined();
    });

    test("unsets the environment variable if the value is SYNTHETIC_UNDEFINED", () => {
        const env = { INPUT_NAME: "foo" };

        setActionInput("name", SYNTHETIC_UNDEFINED, env);

        expect(env["INPUT_NAME"]).toBeUndefined();
    });

    test("unsets the environment variable if the value is undefined", () => {
        const env = { INPUT_NAME: "foo" };

        setActionInput("name", undefined, env);

        expect(env["INPUT_NAME"]).toBeUndefined();
    });
});

describe("setActionInputs", () => {
    test("sets the environment variables corresponding to the inputs", () => {
        const env = {};
        const inputs = [
            ["name1", "value1"] as const,
            ["name2", "value2"] as const,
        ];

        setActionInputs(inputs, env);

        expect(env["INPUT_NAME1"]).toBe("value1");
        expect(env["INPUT_NAME2"]).toBe("value2");
    });

    test("normalizes the input names before setting the environment variables", () => {
        const env = {};
        const inputs = [
            ["input name1", "value1"] as const,
            ["input name2", "value2"] as const,
        ];

        setActionInputs(inputs, env);

        expect(env["INPUT_INPUT_NAME1"]).toBe("value1");
        expect(env["INPUT_INPUT_NAME2"]).toBe("value2");
    });

    test("stringifies non-string values before setting the environment variables", () => {
        const env = {};
        const inputs = [
            ["name1", { key1: "value1" }] as const,
            ["name2", { key2: "value2" }] as const,
        ];

        setActionInputs(inputs, env);

        expect(env["INPUT_NAME1"]).toBe(JSON.stringify({ key1: "value1" }));
        expect(env["INPUT_NAME2"]).toBe(JSON.stringify({ key2: "value2" }));
    });

    test("does not set the environment variables if the values are undefined or SYNTHETIC_UNDEFINED", () => {
        const env = {};
        const inputs = [
            ["name1", undefined] as const,
            ["name2", SYNTHETIC_UNDEFINED] as const,
        ];

        setActionInputs(inputs, env);

        expect(env["INPUT_NAME1"]).toBeUndefined();
        expect(env["INPUT_NAME2"]).toBeUndefined();
    });

    test("unsets the environment variables if the values are undefined or SYNTHETIC_UNDEFINED", () => {
        const env = { INPUT_NAME1: "foo", INPUT_NAME2: "bar" };
        const inputs = [
            ["name1", undefined] as const,
            ["name2", SYNTHETIC_UNDEFINED] as const,
        ];

        setActionInputs(inputs, env);

        expect(env["INPUT_NAME1"]).toBeUndefined();
        expect(env["INPUT_NAME2"]).toBeUndefined();
    });
});

describe("getActionInput", () => {
    test("gets the value of the environment variable corresponding to the input", () => {
        const env = { INPUT_NAME: "value" };

        const input = getActionInput("name", undefined, env);

        expect(input).toBe("value");
    });

    test("normalizes the input name before getting the environment variable", () => {
        const env = { INPUT_INPUT_NAME: "value" };

        const input = getActionInput("input name", undefined, env);

        expect(input).toBe("value");
    });

    test("returns undefined if the environment variable is not set", () => {
        const env = {};

        const input = getActionInput("name", undefined, env);

        expect(input).toBeUndefined();
    });

    test("trims the value if the trimWhitespace option is true", () => {
        const env = { INPUT_NAME: " value " };

        const input = getActionInput("name", { trimWhitespace: true }, env);

        expect(input).toBe("value");
    });

    test("does not trim the value if the trimWhitespace option is false", () => {
        const env = { INPUT_NAME: " value " };

        const input = getActionInput("name", { trimWhitespace: false }, env);

        expect(input).toBe(" value ");
    });

    test("throws an error if the required option is true and the environment variable is not set", () => {
        const env = {};

        expect(() => getActionInput("name", { required: true }, env)).toThrowError();
    });
});

describe("getActionInputs", () => {
    test("gets the values of the environment variables corresponding to the inputs", () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: "value2" };
        const names = ["name1", "name2"];

        const inputs = getActionInputs(names, undefined, env);

        expect(inputs).toEqual(["value1", "value2"]);
    });

    test("normalizes the input names before getting the environment variables", () => {
        const env = { INPUT_INPUT_NAME1: "value1", INPUT_INPUT_NAME2: "value2" };
        const names = ["input name1", "input name2"];

        const inputs = getActionInputs(names, undefined, env);

        expect(inputs).toEqual(["value1", "value2"]);
    });

    test("returns undefined for the environment variables that are not set", () => {
        const env = { INPUT_NAME1: "value1" };
        const names = ["name1", "name2"];

        const inputs = getActionInputs(names, undefined, env);

        expect(inputs).toEqual(["value1", undefined]);
    });

    test("trims the values if the trimWhitespace option is true", () => {
        const env = { INPUT_NAME1: " value1 ", INPUT_NAME2: " value2 " };
        const names = ["name1", "name2"];

        const inputs = getActionInputs(names, { trimWhitespace: true }, env);

        expect(inputs).toEqual(["value1", "value2"]);
    });

    test("does not trim the values if the trimWhitespace option is false", () => {
        const env = { INPUT_NAME1: " value1 ", INPUT_NAME2: " value2 " };
        const names = ["name1", "name2"];

        const inputs = getActionInputs(names, { trimWhitespace: false }, env);

        expect(inputs).toEqual([" value1 ", " value2 "]);
    });

    test("throws an error if the required option is true and one of the environment variables is not set", () => {
        const env = { INPUT_NAME1: "value1" };
        const names = ["name1", "name2"];

        expect(() => getActionInputs(names, { required: true }, env)).toThrowError();
    });
});

describe("getAllActionInputs", () => {
    test("returns a map of all inputs provided to the action", () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: "value2" };

        const inputs = getAllActionInputs(undefined, env);

        expect(inputs).toEqual(new Map([["NAME1", "value1"], ["NAME2", "value2"]]));
    });

    test("returns an empty map if no inputs are provided", () => {
        const env = {};

        const inputs = getAllActionInputs(undefined, env);

        expect(inputs).toEqual(new Map());
    });

    test("trims the values if the trimWhitespace option is true", () => {
        const env = { INPUT_NAME1: " value1 ", INPUT_NAME2: " value2 " };

        const inputs = getAllActionInputs({ trimWhitespace: true }, env);

        expect(inputs).toEqual(new Map([["NAME1", "value1"], ["NAME2", "value2"]]));
    });

    test("does not trim the values if the trimWhitespace option is false", () => {
        const env = { INPUT_NAME1: " value1 ", INPUT_NAME2: " value2 " };

        const inputs = getAllActionInputs({ trimWhitespace: false }, env);

        expect(inputs).toEqual(new Map([["NAME1", " value1 "], ["NAME2", " value2 "]]));
    });

    test("throws an error if the required option is true and one of the inputs is SYNTHETIC_UNDEFINED", () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: SYNTHETIC_UNDEFINED };

        expect(() => getAllActionInputs({ required: true }, env)).toThrowError();
    });
});

describe("getAllActionInputsAsObject", () => {
    test("returns an object of all inputs provided to the action", async () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: "2", INPUT_NAME3: "world" };
        const descriptors = [
            { name: "name1", path: ["name1"], type: parseActionParameterTypeDescriptor("string"), required: false, description: "" },
            { name: "name2", path: ["foo", "name2"], type: parseActionParameterTypeDescriptor("number"), required: false, description: "" },
            { name: "name3", path: ["foo", "name3"], type: parseActionParameterTypeDescriptor("hello.World"), required: false, description: "" },
        ];
        const moduleLoader: ModuleLoader = name => {
            expect(name).toBe("hello/world");

            return Promise.resolve({ World: { parse: (x: string) => `Hello, ${x}` } });
        };

        const inputs = await getAllActionInputsAsObject(descriptors, { moduleLoader }, env);

        expect(inputs).toEqual({
            name1: "value1",
            foo: {
                name2: 2,
                name3: "Hello, world",
            },
        });
    });

    test("redirects the input to another descriptor if the redirect option is set", async () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: "2" };
        const descriptors = [
            { name: "name1", path: ["name1"], type: parseActionParameterTypeDescriptor("string"), redirect: "name3", required: false, description: "" },
            { name: "name2", path: ["foo", "name2"], type: parseActionParameterTypeDescriptor("number"), required: false, description: "" },
            { name: "name3", path: ["foo", "name3"], type: parseActionParameterTypeDescriptor("hello.World"), required: false, description: "" },
        ];

        const inputs = await getAllActionInputsAsObject(descriptors, undefined, env);

        expect(inputs).toEqual({
            foo: {
                name2: 2,
                name3: "value1",
            },
        });
    });

    test("uses custom converter", async () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: "2" };
        const descriptors = [
            { name: "name1", path: ["name1"], type: parseActionParameterTypeDescriptor("string"), required: false, description: "" },
            { name: "name2", path: ["foo", "name2"], type: parseActionParameterTypeDescriptor("number"), required: false, description: "" },
        ];
        const converter = jest.fn(x => String(x));

        const inputs = await getAllActionInputsAsObject(descriptors, { converter }, env);

        expect(inputs).toEqual({
            name1: "value1",
            foo: {
                name2: "2",
            },
        });
        expect(converter).toHaveBeenCalledTimes(2);
        expect(converter).toHaveBeenNthCalledWith(1, "value1", "string");
        expect(converter).toHaveBeenNthCalledWith(2, "2", "number");
    });

    test("returns an empty object if no inputs are provided", async () => {
        const env = {};
        const descriptors = [];

        const inputs = await getAllActionInputsAsObject(descriptors, undefined, env);

        expect(inputs).toEqual({});
    });

    test("trims the values if the trimWhitespace option is true", async () => {
        const env = { INPUT_NAME1: " value1 ", INPUT_NAME2: " 2 ", INPUT_NAME3: "\tworld\t" };
        const descriptors = [
            { name: "name1", path: ["name1"], type: parseActionParameterTypeDescriptor("string"), required: false, description: "" },
            { name: "name2", path: ["foo", "name2"], type: parseActionParameterTypeDescriptor("number"), required: false, description: "" },
            { name: "name3", path: ["foo", "name3"], type: parseActionParameterTypeDescriptor("hello.World"), required: false, description: "" },
        ];
        const moduleLoader: ModuleLoader = name => {
            expect(name).toBe("hello/world");
            return Promise.resolve({ World: { parse: (x: string) => `Hello, ${x}` } });
        };

        const inputs = await getAllActionInputsAsObject(descriptors, { moduleLoader, trimWhitespace: true }, env);

        expect(inputs).toEqual({
            name1: "value1",
            foo: {
                name2: 2,
                name3: "Hello, world",
            },
        });
    });

    test("does not trim the values if the trimWhitespace option is false", async () => {
        const env = { INPUT_NAME1: " value1 ", INPUT_NAME2: " 2 ", INPUT_NAME3: "\tworld\t" };
        const descriptors = [
            { name: "name1", path: ["name1"], type: parseActionParameterTypeDescriptor("string"), required: false, description: "" },
            { name: "name2", path: ["foo", "name2"], type: parseActionParameterTypeDescriptor("number"), required: false, description: "" },
            { name: "name3", path: ["foo", "name3"], type: parseActionParameterTypeDescriptor("hello.World"), required: false, description: "" },
        ];
        const moduleLoader: ModuleLoader = name => {
            expect(name).toBe("hello/world");
            return Promise.resolve({ World: { parse: (x: string) => `Hello, ${x}` } });
        };

        const inputs = await getAllActionInputsAsObject(descriptors, { moduleLoader, trimWhitespace: false }, env);

        expect(inputs).toEqual({
            name1: " value1 ",
            foo: {
                name2: 2,
                name3: "Hello, \tworld\t",
            },
        });
    });

    test("throws an error if the required option is true and one of the inputs is SYNTHETIC_UNDEFINED", async () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: SYNTHETIC_UNDEFINED };
        const descriptors = [
            { name: "name1", path: ["name1"], type: parseActionParameterTypeDescriptor("string"), required: false, description: "" },
            { name: "name2", path: ["foo", "name2"], type: parseActionParameterTypeDescriptor("number"), required: false, description: "" },
        ];

        await expect(getAllActionInputsAsObject(descriptors, { required: true }, env)).rejects.toThrowError();
    });
});

describe("getAllActionInputsAsObjectUsingMetadata", () => {
    const METADATA = Object.freeze({
        name: "test-metadata",
        description: "Test description",
        runs: { main: "index.js", using: "node16" },

        inputs: {
            name1: {
                description: "Description 1",
                type: "string",
            },

            name2: {
                description: "Description 2",
                type: "number",
            },

            name3: {
                description: "Description 3",
                type: "hello.World",
            },

            name4: {
                description: "Description 4",
                type: "hello.World",
                redirect: "name3",
            },
        },
    } as ActionMetadata);

    test("returns an object of all inputs provided to the action", async () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: "2", INPUT_NAME3: "world" };
        const pathParser: ActionParameterPathParser = name => name[name.length - 1] === "1" ? [name] : ["foo", name];
        const moduleLoader: ModuleLoader = name => {
            expect(name).toBe("hello/world");
            return Promise.resolve({ World: { parse: (x: string) => `Hello, ${x}` } });
        };

        const inputs = await getAllActionInputsAsObjectUsingMetadata(METADATA, { pathParser, moduleLoader }, env);

        expect(inputs).toEqual({
            name1: "value1",
            foo: {
                name2: 2,
                name3: "Hello, world",
            },
        });
    });

    test("redirects the input to another descriptor if the redirect option is set", async () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: "2", INPUT_NAME4: "moon" };
        const pathParser: ActionParameterPathParser = name => name[name.length - 1] === "1" ? [name] : ["foo", name];
        const moduleLoader: ModuleLoader = name => {
            expect(name).toBe("hello/world");
            return Promise.resolve({ World: { parse: (x: string) => `Hello, ${x}` } });
        };

        const inputs = await getAllActionInputsAsObjectUsingMetadata(METADATA, { pathParser, moduleLoader }, env);

        expect(inputs).toEqual({
            name1: "value1",
            foo: {
                name2: 2,
                name3: "Hello, moon",
            },
        });
    });

    test("uses custom converter", async () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: "2" };
        const converter = jest.fn(x => String(x));

        const inputs = await getAllActionInputsAsObjectUsingMetadata(METADATA, { converter }, env);

        expect(inputs).toEqual({
            name1: "value1",
            name2: "2",
        });
        expect(converter).toHaveBeenCalledTimes(2);
        expect(converter).toHaveBeenNthCalledWith(1, "value1", "string");
        expect(converter).toHaveBeenNthCalledWith(2, "2", "number");
    });

    test("returns an empty object if no inputs are provided", async () => {
        const env = {};

        const inputs = await getAllActionInputsAsObjectUsingMetadata(METADATA, undefined, env);

        expect(inputs).toEqual({});
    });

    test("trims the values if the trimWhitespace option is true", async () => {
        const env = { INPUT_NAME1: " value1 ", INPUT_NAME2: " 2 ", INPUT_NAME4: "\tmoon\t" };
        const pathParser: ActionParameterPathParser = name => name[name.length - 1] === "1" ? [name] : ["foo", name];
        const moduleLoader: ModuleLoader = name => {
            expect(name).toBe("hello/world");
            return Promise.resolve({ World: { parse: (x: string) => `Hello, ${x}` } });
        };

        const inputs = await getAllActionInputsAsObjectUsingMetadata(METADATA, { pathParser, moduleLoader, trimWhitespace: true }, env);

        expect(inputs).toEqual({
            name1: "value1",
            foo: {
                name2: 2,
                name3: "Hello, moon",
            },
        });
    });

    test("does not trim the values if the trimWhitespace option is false", async () => {
        const env = { INPUT_NAME1: " value1 ", INPUT_NAME2: " 2 ", INPUT_NAME4: "\tmoon\t" };
        const pathParser: ActionParameterPathParser = name => name[name.length - 1] === "1" ? [name] : ["foo", name];
        const moduleLoader: ModuleLoader = name => {
            expect(name).toBe("hello/world");
            return Promise.resolve({ World: { parse: (x: string) => `Hello, ${x}` } });
        };

        const inputs = await getAllActionInputsAsObjectUsingMetadata(METADATA, { pathParser, moduleLoader, trimWhitespace: false }, env);

        expect(inputs).toEqual({
            name1: " value1 ",
            foo: {
                name2: 2,
                name3: "Hello, \tmoon\t",
            },
        });
    });

    test("throws an error if the required option is true and one of the inputs is SYNTHETIC_UNDEFINED", async () => {
        const env = { INPUT_NAME1: "value1", INPUT_NAME2: "2", INPUT_NAME4: SYNTHETIC_UNDEFINED };

        await expect(getAllActionInputsAsObjectUsingMetadata(METADATA, { required: true }, env)).rejects.toThrowError();
    });
});
