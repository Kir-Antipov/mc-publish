import { ActionMetadata } from "@/utils/actions/action-metadata";
import { ActionParameterPathParser } from "@/utils/actions/action-parameter-path-parser";
import { getActionParameterDescriptor, getActionParameterDescriptors } from "@/utils/actions/action-parameter-descriptor";

const METADATA = Object.freeze({
    name: "test-metadata",
    description: "Test description",
    runs: { main: "index.js", using: "node16" },

    inputs: {
        "foo": {
            description: "Foo description",
            default: 3,
            type: "number",
            deprecationMessage: "Foo is deprecated",
        },

        "bar": {
            description: "Bar description",
            default: true,
            type: "boolean",
            required: false,
            redirect: "bar-bar",
        },

        "baz-path": {
            description: "Baz description",
            type: "utils.io.FileInfo[]:{findFiles}?processSeparately=false",
            required: true,
        },
    },

    outputs: {
        "foo": {
            description: "Foo description",
            type: "number",
        },

        "bar": {
            description: "Bar description",
            type: "boolean",
            redirect: "bar-bar",
        },

        "baz-path": {
            description: "Baz description",
            type: "platforms.UploadedFile[]",
        },
    },
} as ActionMetadata);

describe("getActionParameterDescriptor", () => {
    test("returns a parameter descriptor by its name", () => {
        for (const name of Object.keys(METADATA.inputs)) {
            const descriptorInstance = {};
            const factory = jest.fn().mockReturnValueOnce(descriptorInstance);

            const descriptor = getActionParameterDescriptor(METADATA, name, factory, METADATA.inputs);

            expect(factory).toHaveBeenCalledTimes(1);
            expect(factory).toHaveBeenCalledWith(METADATA.inputs[name], name, [name]);
            expect(descriptor).toBe(descriptorInstance);
        }

        for (const name of Object.keys(METADATA.outputs)) {
            const descriptorInstance = {};
            const factory = jest.fn().mockReturnValueOnce(descriptorInstance);

            const descriptor = getActionParameterDescriptor(METADATA, name, factory, METADATA.outputs);

            expect(factory).toHaveBeenCalledTimes(1);
            expect(factory).toHaveBeenCalledWith(METADATA.outputs[name], name, [name]);
            expect(descriptor).toBe(descriptorInstance);
        }
    });

    test("uses custom path parser", () => {
        const pathParser: ActionParameterPathParser = name => name.split("-");

        for (const name of Object.keys(METADATA.inputs)) {
            const descriptorInstance = {};
            const factory = jest.fn().mockReturnValueOnce(descriptorInstance);

            const descriptor = getActionParameterDescriptor(METADATA, name, factory, METADATA.inputs, { pathParser });

            expect(factory).toHaveBeenCalledTimes(1);
            expect(factory).toHaveBeenCalledWith(METADATA.inputs[name], name, pathParser(name));
            expect(descriptor).toBe(descriptorInstance);
        }

        for (const name of Object.keys(METADATA.outputs)) {
            const descriptorInstance = {};
            const factory = jest.fn().mockReturnValueOnce(descriptorInstance);

            const descriptor = getActionParameterDescriptor(METADATA, name, factory, METADATA.outputs, { pathParser });

            expect(factory).toHaveBeenCalledTimes(1);
            expect(factory).toHaveBeenCalledWith(METADATA.outputs[name], name, pathParser(name));
            expect(descriptor).toBe(descriptorInstance);
        }
    });

    test("returns undefined if a parameter with the specified name doesn't exist", () => {
        const factory = jest.fn().mockReturnValue({});

        const inputDescriptor = getActionParameterDescriptor(METADATA, "input-that-does-not-exist", factory, METADATA.inputs);
        const outputDescriptor = getActionParameterDescriptor(METADATA, "output-that-does-not-exist", factory, METADATA.outputs);

        expect(factory).not.toHaveBeenCalled();
        expect(inputDescriptor).toBeUndefined();
        expect(outputDescriptor).toBeUndefined();
    });
});

describe("getActionParameterDescriptors", () => {
    test("returns all parameter descriptors", () => {
        const descriptorInstance = {};

        const inputFactory = jest.fn().mockReturnValue(descriptorInstance);
        const inputNames = Object.keys(METADATA.inputs);

        const outputFactory = jest.fn().mockReturnValue(descriptorInstance);
        const outputNames = Object.keys(METADATA.outputs);

        const inputDescriptors = getActionParameterDescriptors(METADATA, inputFactory, METADATA.inputs);
        const outputDescriptors = getActionParameterDescriptors(METADATA, outputFactory, METADATA.outputs);

        expect(inputFactory).toHaveBeenCalledTimes(inputNames.length);
        expect(outputFactory).toHaveBeenCalledTimes(outputNames.length);

        expect(inputDescriptors).toHaveLength(inputNames.length);
        expect(outputDescriptors).toHaveLength(outputNames.length);

        expect(inputDescriptors.every(x => x === descriptorInstance)).toBe(true);
        expect(outputDescriptors.every(x => x === descriptorInstance)).toBe(true);

        inputNames.forEach(name => expect(inputFactory).toHaveBeenCalledWith(METADATA.inputs[name], name, [name]));
        outputNames.forEach(name => expect(outputFactory).toHaveBeenCalledWith(METADATA.outputs[name], name, [name]));
    });

    test("uses custom path parser", () => {
        const descriptorInstance = {};
        const pathParser: ActionParameterPathParser = name => name.split("-");

        const inputFactory = jest.fn().mockReturnValue(descriptorInstance);
        const inputNames = Object.keys(METADATA.inputs);

        const outputFactory = jest.fn().mockReturnValue(descriptorInstance);
        const outputNames = Object.keys(METADATA.outputs);

        const inputDescriptors = getActionParameterDescriptors(METADATA, inputFactory, METADATA.inputs, { pathParser });
        const outputDescriptors = getActionParameterDescriptors(METADATA, outputFactory, METADATA.outputs, { pathParser });

        expect(inputFactory).toHaveBeenCalledTimes(inputNames.length);
        expect(outputFactory).toHaveBeenCalledTimes(outputNames.length);

        expect(inputDescriptors).toHaveLength(inputNames.length);
        expect(outputDescriptors).toHaveLength(outputNames.length);

        expect(inputDescriptors.every(x => x === descriptorInstance)).toBe(true);
        expect(outputDescriptors.every(x => x === descriptorInstance)).toBe(true);

        inputNames.forEach(name => expect(inputFactory).toHaveBeenCalledWith(METADATA.inputs[name], name, pathParser(name)));
        outputNames.forEach(name => expect(outputFactory).toHaveBeenCalledWith(METADATA.outputs[name], name, pathParser(name)));
    });

    test("returns an empty array if the metadata doesn't specify any parameters", () => {
        const factory = jest.fn().mockReturnValue({});

        const inputDescriptors = getActionParameterDescriptors({} as ActionMetadata, factory, undefined);
        const outputDescriptors = getActionParameterDescriptors({} as ActionMetadata, factory, {});

        expect(factory).not.toHaveBeenCalled();
        expect(inputDescriptors).toEqual([]);
        expect(outputDescriptors).toEqual([]);
    });
});
