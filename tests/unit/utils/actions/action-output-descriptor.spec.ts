import { ActionMetadata } from "@/utils/actions/action-metadata";
import { parseActionParameterTypeDescriptor } from "@/utils/actions/action-parameter-type-descriptor";
import { getActionOutputDescriptor, getActionOutputDescriptors } from "@/utils/actions/action-output-descriptor";
import { ActionParameterPathParser } from "@/utils/actions/action-parameter-path-parser";

const METADATA = Object.freeze({
    name: "test-metadata",
    description: "Test description",
    runs: { main: "index.js", using: "node16" },

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

describe("getActionOutputDescriptor", () => {
    test("returns an output descriptor by its name", () => {
        for (const name of Object.keys(METADATA.outputs)) {
            const descriptor = getActionOutputDescriptor(METADATA, name);

            expect(descriptor).toEqual({
                name,
                path: [name],
                type: parseActionParameterTypeDescriptor(METADATA.outputs[name].type),
                description: METADATA.outputs[name].description ?? "",
                redirect: METADATA.outputs[name].redirect,
            });
        }
    });

    test("uses custom path parser", () => {
        const pathParser: ActionParameterPathParser = name => name.split("-");

        for (const name of Object.keys(METADATA.outputs)) {
            const descriptor = getActionOutputDescriptor(METADATA, name, { pathParser });

            expect(descriptor).toEqual({
                name,
                path: pathParser(name),
                type: parseActionParameterTypeDescriptor(METADATA.outputs[name].type),
                description: METADATA.outputs[name].description ?? "",
                redirect: METADATA.outputs[name].redirect,
            });
        }
    });

    test("returns undefined if an output with the specified name doesn't exist", () => {
        const descriptor = getActionOutputDescriptor(METADATA, "there's no such output");

        expect(descriptor).toBeUndefined();
    });
});

describe("getActionOutputDescriptors", () => {
    test("returns all output descriptors", () => {
        const names = Object.keys(METADATA.outputs);

        const descriptors = getActionOutputDescriptors(METADATA);

        expect(descriptors).toHaveLength(names.length);
        for (const name of names) {
            expect(descriptors).toContainEqual({
                name,
                path: [name],
                type: parseActionParameterTypeDescriptor(METADATA.outputs[name].type),
                description: METADATA.outputs[name].description ?? "",
                redirect: METADATA.outputs[name].redirect,
            });
        }
    });

    test("uses custom path parser", () => {
        const names = Object.keys(METADATA.outputs);
        const pathParser: ActionParameterPathParser = name => name.split("-");

        const descriptors = getActionOutputDescriptors(METADATA, { pathParser });

        expect(descriptors).toHaveLength(names.length);
        for (const name of names) {
            expect(descriptors).toContainEqual({
                name,
                path: pathParser(name),
                type: parseActionParameterTypeDescriptor(METADATA.outputs[name].type),
                description: METADATA.outputs[name].description ?? "",
                redirect: METADATA.outputs[name].redirect,
            });
        }
    });

    test("returns an empty array if the metadata doesn't specify any outputs", () => {
        const descriptors = getActionOutputDescriptors({} as ActionMetadata);

        expect(descriptors).toEqual([]);
    });
});
