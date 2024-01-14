import mockFs from "mock-fs";
import { readFile } from "node:fs/promises";
import { ActionMetadata } from "@/utils/actions/action-metadata";
import { ActionParameterPathParser } from "@/utils/actions/action-parameter-path-parser";
import { ActionOutputControllerOptions, createActionOutputController, createActionOutputControllerUsingMetadata, getActionOutput, getActionOutputs, getAllActionOutputs, setActionOutput, setActionOutputs } from "@/utils/actions/action-output";

const ENV = Object.freeze({
    GITHUB_OUTPUT: "output.txt",
});

beforeEach(() => {
    mockFs({
        "output.txt": "",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("setActionOutput", () => {
    test("writes the value of an output to a file", async () => {
        setActionOutput("output1", "value1", ENV);

        const outputFile = await readFile(ENV.GITHUB_OUTPUT, "utf8");
        expect(outputFile).toMatch(/^output1<<(.+)\r?\nvalue1\r?\n\1$/m);
    });

    test("writes values of multiple outputs to a file", async () => {
        setActionOutput("output1", "value1", ENV);
        setActionOutput("output2", "value2", ENV);

        const outputFile = await readFile(ENV.GITHUB_OUTPUT, "utf8");
        expect(outputFile).toMatch(/^output1<<(.+)\r?\nvalue1\r?\n\1$/m);
        expect(outputFile).toMatch(/^output2<<(.+)\r?\nvalue2\r?\n\1$/m);
    });

    test("writes an empty string if the specified value is null or undefined", async () => {
        setActionOutput("output1", null, ENV);
        setActionOutput("output2", undefined, ENV);

        const outputFile = await readFile(ENV.GITHUB_OUTPUT, "utf8");
        expect(outputFile).toMatch(/^output1<<(.+)\r?\n\r?\n\1$/m);
        expect(outputFile).toMatch(/^output2<<(.+)\r?\n\r?\n\1$/m);
    });

    test("stringifies non-string values before writing them to the file", async () => {
        const value1 = { foo: "bar" };
        const value2 = { baz: 1 };

        setActionOutput("output1", value1, ENV);
        setActionOutput("output2", value2, ENV);

        const outputFile = await readFile(ENV.GITHUB_OUTPUT, "utf8");
        const outputs = [...outputFile.matchAll(/^(?<name>.+)<<(.+)\r?\n(?<value>.+)\r?\n\2$/gm)]
            .map(x => [x.groups.name, JSON.parse(x.groups.value)])
            .reduce((a, [name, value]) => (a[name] = value) && a, {});

        expect(outputs["output1"]).toEqual(value1);
        expect(outputs["output2"]).toEqual(value2);
    });

    test("throws an error if the output file does not exist", () => {
        expect(() => setActionOutput("output1", "value1", {})).toThrowError();
    });
});

describe("setActionOutputs", () => {
    test("sets multiple action outputs at once", async () => {
        const outputs = [
            ["output1", "value1"] as const,
            ["output2", "value2"] as const,
        ];

        setActionOutputs(outputs, ENV);

        const outputFile = await readFile(ENV.GITHUB_OUTPUT, "utf8");
        expect(outputFile).toMatch(/^output1<<(.+)\r?\nvalue1\r?\n\1$/m);
        expect(outputFile).toMatch(/^output2<<(.+)\r?\nvalue2\r?\n\1$/m);
    });

    test("sets multiple action outputs with non-string values", async () => {
        const value1 = { foo: "bar" };
        const value2 = { baz: 1 };
        const outputs = [
            ["output1", value1] as const,
            ["output2", value2] as const,
        ];

        setActionOutputs(outputs, ENV);

        const outputFile = await readFile(ENV.GITHUB_OUTPUT, "utf8");
        const deserializedOutputs = [...outputFile.matchAll(/^(?<name>.+)<<(.+)\r?\n(?<value>.+)\r?\n\2$/gm)]
            .map(x => [x.groups.name, JSON.parse(x.groups.value)])
            .reduce((a, [name, value]) => (a[name] = value) && a, {});

        expect(deserializedOutputs["output1"]).toEqual(value1);
        expect(deserializedOutputs["output2"]).toEqual(value2);
    });

    test("throws an error if the output file does not exist", () => {
        const outputs = [
            ["output1", "value1"] as const,
            ["output2", "value2"] as const,
        ];

        expect(() => setActionOutputs(outputs, {})).toThrowError();
    });
});

describe("getActionOutput", () => {
    test("returns the value of an output if it was set", () => {
        const env = { ...ENV };
        const name = "output1";
        const value = "value1";

        setActionOutput(name, value, env);
        const output = getActionOutput(name, env);

        expect(output).toEqual(value);
    });

    test("returns the object value of an output if it was set", () => {
        const env = { ...ENV };
        const name = "output1";
        const value = { foo: "bar" };

        setActionOutput(name, value, env);
        const output = getActionOutput(name, env);

        expect(output).toEqual(value);
    });

    test("returns undefined if the output was not set", () => {
        const output = getActionOutput("output1", { ...ENV });

        expect(output).toBeUndefined();
    });
});

describe("getActionOutputs", () => {
    test("returns the values of multiple outputs if they were set", () => {
        const env = { ...ENV };
        const names = ["output1", "output2"];
        const values = ["value1", "value2"];

        setActionOutputs(names.map((x, i) => [x, values[i]]), env);
        const outputs = getActionOutputs(names, env);

        expect(outputs).toEqual(values);
    });

    test("returns the object values of multiple outputs if they were set", () => {
        const env = { ...ENV };
        const names = ["output1", "output2"];
        const values = [{ foo: "bar" }, { baz: 1 }];

        setActionOutputs(names.map((x, i) => [x, values[i]]), env);
        const outputs = getActionOutputs(names, env);

        expect(outputs).toEqual(values);
    });

    test("returns undefined for the outputs that were not set", () => {
        const names = ["output1", "output2"];

        const outputs = getActionOutputs(names, { ...ENV });

        expect(outputs).toEqual([undefined, undefined]);
    });
});

describe("getAllActionOutputs", () => {
    test("returns a map containing all outputs set by the action", () => {
        const env = { ...ENV };
        const outputs = [
            ["output1", "value1"] as const,
            ["output2", { foo: "bar" }] as const,
        ];

        setActionOutputs(outputs, env);
        const result = getAllActionOutputs(env);

        expect(result).toEqual(new Map<string, unknown>(outputs));
    });

    test("returns an empty map if no outputs were set", () => {
        const result = getAllActionOutputs({ ...ENV });

        expect(result).toEqual(new Map());
    });
});

describe("createActionOutputController", () => {
    test("creates a new output controller based on the provided descriptors and options", async () => {
        const descriptors = [
            { name: "output1", path: ["output1"], type: undefined, description: "" },
            { name: "output2", path: ["foo", "output2"], type: undefined, description: "" },
            { name: "output3", path: ["foo", "bar", "output3"], type: undefined, description: "" },
            { name: "output4", path: ["foo", "bar", "output4"], type: undefined, description: "" },
            { name: "output5", path: ["foo", "bar", "output5"], redirect: "output4", type: undefined, description: "" },
        ];
        const options = {
            getOutput: name => getActionOutput(name, ENV),
            setOutput: (name, value) => setActionOutput(name, value, ENV),
        } as ActionOutputControllerOptions;

        const controller = createActionOutputController(descriptors, options);
        controller["output1"] = "value1";
        controller["foo"]["output2"] = true;
        controller["foo"] = {
            bar: {
                output3: { foo: "bar" },
                output5: { baz: 42 },
            },
        };

        const outputFile = await readFile(ENV.GITHUB_OUTPUT, "utf8");
        const deserializedOutputs = [...outputFile.matchAll(/^(?<name>.+)<<(.+)\r?\n(?<value>.+)\r?\n\2$/gm)]
            .map(x => [x.groups.name, x.groups.value])
            .reduce((a, [name, value]) => (a[name] = value) && a, {});

        expect(deserializedOutputs["output1"]).toEqual("value1");
        expect(deserializedOutputs["output2"]).toEqual("true");
        expect(deserializedOutputs["output3"]).toEqual(JSON.stringify({ foo: "bar" }));
        expect(deserializedOutputs["output4"]).toEqual(JSON.stringify({ baz: 42 }));
    });
});

describe("createActionOutputControllerUsingMetadata", () => {
    const METADATA = Object.freeze({
        name: "test-metadata",
        description: "Test description",
        runs: { main: "index.js", using: "node16" },

        outputs: {
            output1: {
                description: "",
            },

            output2: {
                description: "",
            },

            output3: {
                description: "",
            },

            output4: {
                description: "",
            },

            output5: {
                description: "",
                redirect: "output4",
            },
        },
    } as ActionMetadata);

    test("creates a new output controller based on the provided metadata and options", async () => {
        const pathParser: ActionParameterPathParser = name => {
            switch (name[name.length - 1]) {
                case "1":
                    return [name];

                case "2":
                    return ["foo", name];

                default:
                    return ["foo", "bar", name];
            }
        };
        const options = {
            pathParser,
            getOutput: name => getActionOutput(name, ENV),
            setOutput: (name, value) => setActionOutput(name, value, ENV),
        } as ActionOutputControllerOptions;

        const controller = createActionOutputControllerUsingMetadata(METADATA, options);
        controller["output1"] = "value1";
        controller["foo"]["output2"] = true;
        controller["foo"]["bar"] = {
            output3: { foo: "bar" },
            output5: { baz: 42 },
        };

        const outputFile = await readFile(ENV.GITHUB_OUTPUT, "utf8");
        const deserializedOutputs = [...outputFile.matchAll(/^(?<name>.+)<<(.+)\r?\n(?<value>.+)\r?\n\2$/gm)]
            .map(x => [x.groups.name, x.groups.value])
            .reduce((a, [name, value]) => (a[name] = value) && a, {});

        expect(deserializedOutputs["output1"]).toEqual("value1");
        expect(deserializedOutputs["output2"]).toEqual("true");
        expect(deserializedOutputs["output3"]).toEqual(JSON.stringify({ foo: "bar" }));
        expect(deserializedOutputs["output4"]).toEqual(JSON.stringify({ baz: 42 }));
    });
});
