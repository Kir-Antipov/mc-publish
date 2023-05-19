import { ActionMetadata } from "./action-metadata";
import { ActionOutput } from "./action-output";
import { ActionParameterDescriptor, ActionParameterDescriptorExtractionOptions, getActionParameterDescriptor, getActionParameterDescriptors } from "./action-parameter-descriptor";
import { parseActionParameterTypeDescriptor } from "./action-parameter-type-descriptor";

/**
 * Describes an output parameter of a GitHub Action.
 */
export interface ActionOutputDescriptor extends ActionParameterDescriptor {
    /**
     * The value that the output parameter will be mapped to.
     */
    value?: string | number | boolean;
}

/**
 * Retrieves an action output descriptors from the given action metadata by its name.
 *
 * @param metadata - The action metadata containing the output definition.
 * @param name - The name of the output to extract a descriptor for.
 * @param options - Options for configuring how action output descriptor is extracted.
 *
 * @returns An action output descriptor, or `undefined` if the output was not found.
 */
export function getActionOutputDescriptor(metadata: ActionMetadata, name: string, options?: ActionParameterDescriptorExtractionOptions): ActionOutputDescriptor | undefined {
    return getActionParameterDescriptor(metadata, name, asActionOutputDescriptor, metadata.outputs, options);
}

/**
 * Retrieves action output descriptors from the given action metadata.
 *
 * @param metadata - The action metadata containing the output definitions.
 * @param options - Options for configuring how action output descriptors are extracted.
 *
 * @returns An array of action output descriptors.
 */
export function getActionOutputDescriptors(metadata: ActionMetadata, options?: ActionParameterDescriptorExtractionOptions): ActionOutputDescriptor[] {
    return getActionParameterDescriptors(metadata, asActionOutputDescriptor, metadata.outputs, options);
}

/**
 * Converts an action output definition to an action output descriptor.
 *
 * @param output - The output definition to convert.
 * @param name - The name of the output definition.
 * @param path - The parsed path of the output definition.
 *
 * @returns The converted action output descriptor.
 */
function asActionOutputDescriptor(output: ActionOutput, name: string, path: string[]): ActionOutputDescriptor {
    const isValueUndefined = output.value === undefined;
    const typeDescriptor = output.type || (isValueUndefined ? "string" : typeof output.value);

    return {
        name,
        path,
        redirect: output.redirect,
        type: parseActionParameterTypeDescriptor(typeDescriptor),
        description: output.description ?? "",
        value: output.value,
    };
}
