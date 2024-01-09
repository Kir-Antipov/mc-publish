import { ActionMetadata } from "@/utils/actions/action-metadata";
import { parseActionParameterTypeDescriptor } from "@/utils/actions/action-parameter-type-descriptor";
import { getActionInputDescriptor, getActionInputDescriptors } from "@/utils/actions/action-input-descriptor";
import { ActionParameterPathParser } from "@/utils/actions/action-parameter-path-parser";

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
} as ActionMetadata);

describe("getActionInputDescriptor", () => {
    test("returns an input descriptor by its name", () => {
        for (const name of Object.keys(METADATA.inputs)) {
            const descriptor = getActionInputDescriptor(METADATA, name);

            expect(descriptor).toEqual({
                name,
                path: [name],
                type: parseActionParameterTypeDescriptor(METADATA.inputs[name].type),
                description: METADATA.inputs[name].description ?? "",
                redirect: METADATA.inputs[name].redirect,
                required: !!METADATA.inputs[name].required,
                default: METADATA.inputs[name].default,
                deprecationMessage: METADATA.inputs[name].deprecationMessage,
            });
        }
    });

    test("uses custom path parser", () => {
        const pathParser: ActionParameterPathParser = name => name.split("-");

        for (const name of Object.keys(METADATA.inputs)) {
            const descriptor = getActionInputDescriptor(METADATA, name, { pathParser });

            expect(descriptor).toEqual({
                name,
                path: pathParser(name),
                type: parseActionParameterTypeDescriptor(METADATA.inputs[name].type),
                description: METADATA.inputs[name].description ?? "",
                redirect: METADATA.inputs[name].redirect,
                required: !!METADATA.inputs[name].required,
                default: METADATA.inputs[name].default,
                deprecationMessage: METADATA.inputs[name].deprecationMessage,
            });
        }
    });

    test("returns undefined if an input with the specified name doesn't exist", () => {
        const descriptor = getActionInputDescriptor(METADATA, "there's no such input");

        expect(descriptor).toBeUndefined();
    });
});

describe("getActionInputDescriptors", () => {
    test("returns all input descriptors", () => {
        const names = Object.keys(METADATA.inputs);

        const descriptors = getActionInputDescriptors(METADATA);

        expect(descriptors).toHaveLength(names.length);
        for (const name of names) {
            expect(descriptors).toContainEqual({
                name,
                path: [name],
                type: parseActionParameterTypeDescriptor(METADATA.inputs[name].type),
                description: METADATA.inputs[name].description ?? "",
                redirect: METADATA.inputs[name].redirect,
                required: !!METADATA.inputs[name].required,
                default: METADATA.inputs[name].default,
                deprecationMessage: METADATA.inputs[name].deprecationMessage,
            });
        }
    });

    test("uses custom path parser", () => {
        const names = Object.keys(METADATA.inputs);
        const pathParser: ActionParameterPathParser = name => name.split("-");

        const descriptors = getActionInputDescriptors(METADATA, { pathParser });

        expect(descriptors).toHaveLength(names.length);
        for (const name of names) {
            expect(descriptors).toContainEqual({
                name,
                path: pathParser(name),
                type: parseActionParameterTypeDescriptor(METADATA.inputs[name].type),
                description: METADATA.inputs[name].description ?? "",
                redirect: METADATA.inputs[name].redirect,
                required: !!METADATA.inputs[name].required,
                default: METADATA.inputs[name].default,
                deprecationMessage: METADATA.inputs[name].deprecationMessage,
            });
        }
    });

    test("returns an empty array if the metadata doesn't specify any inputs", () => {
        const descriptors = getActionInputDescriptors({} as ActionMetadata);

        expect(descriptors).toEqual([]);
    });
});
