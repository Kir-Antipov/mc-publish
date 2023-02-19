import { ActionInput, SYNTHETIC_UNDEFINED } from "./action-input";
import { ActionMetadata } from "./action-metadata";
import { parseActionParameterTypeDescriptor } from "./action-parameter-type-descriptor";
import { ActionParameterDescriptor, ActionParameterDescriptorExtractionOptions, getActionParameterDescriptor, getActionParameterDescriptors } from "./action-parameter-descriptor";

/**
 * Describes an input parameter for a GitHub Action.
 */
export interface ActionInputDescriptor extends ActionParameterDescriptor {
    /**
     * A boolean indicating whether the input parameter is required.
     *
     * If `true`, the action will fail if the parameter is not provided.
     */
    required: boolean;

    /**
     * The default value to use when the input parameter is not specified in the workflow file.
     *
     * This value is used if `required` is `false`.
     */
    default?: string | number | boolean;

    /**
     * A message to display if the input parameter is used, indicating that it is deprecated and suggesting alternatives.
     */
    deprecationMessage?: string;
}

/**
 * Retrieves an action input descriptors from the given action metadata by its name.
 *
 * @param metadata - The action metadata containing the input definition.
 * @param name - The name of the input to extract a descriptor for.
 * @param options - Options for configuring how action input descriptor is extracted.
 *
 * @returns An action input descriptor, or `undefined` if the input was not found.
 */
export function getActionInputDescriptor(metadata: ActionMetadata, name: string, options?: ActionParameterDescriptorExtractionOptions): ActionInputDescriptor | undefined {
    return getActionParameterDescriptor(metadata, name, asActionInputDescriptor, metadata.inputs, options);
}

/**
 * Retrieves action input descriptors from the given action metadata.
 *
 * @param metadata - The action metadata containing the input definitions.
 * @param options - Options for configuring how action input descriptors are extracted.
 *
 * @returns An array of action input descriptors.
 */
export function getActionInputDescriptors(metadata: ActionMetadata, options?: ActionParameterDescriptorExtractionOptions): ActionInputDescriptor[] {
    return getActionParameterDescriptors(metadata, asActionInputDescriptor, metadata.inputs, options);
}

/**
 * Converts an action input definition to an action input descriptor.
 *
 * @param input - The input definition to convert.
 * @param name - The name of the input definition.
 * @param path - The parsed path of the input definition.
 *
 * @returns The converted action input descriptor.
 */
function asActionInputDescriptor(input: ActionInput, name: string, path: string[]): ActionInputDescriptor {
    const isDefaultUndefined = input.default === undefined || input.default === SYNTHETIC_UNDEFINED;
    const typeDescriptor = input.type || (isDefaultUndefined ? "string" : typeof input.default);

    return {
        name,
        path,
        redirect: input.redirect,
        type: parseActionParameterTypeDescriptor(typeDescriptor),
        description: input.description ?? "",
        required: input.required ?? false,
        default: isDefaultUndefined ? undefined : input.default,
        deprecationMessage: input.deprecationMessage,
    };
}
