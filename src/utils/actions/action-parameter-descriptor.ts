import { ActionParameterPathParser, IDENTITY_ACTION_PARAMETER_PATH_PARSER } from "./action-parameter-path-parser";
import { ActionMetadata } from "./action-metadata";
import { ActionParameter } from "./action-parameter";
import { ActionParameterTypeDescriptor } from "./action-parameter-type-descriptor";

/**
 * Describes an input or output parameter of a GitHub Action.
 */
export interface ActionParameterDescriptor {
    /**
     * The name of the parameter.
     */
    name: string;

    /**
     * A name of the parameter this one's value should be redirected to.
     */
    redirect?: string;

    /**
     * The data type of the parameter.
     */
    type: ActionParameterTypeDescriptor;

    /**
     * An array of property names that identify the location of the parameter.
     */
    path: string[];

    /**
     * A string description of the parameter.
     */
    description: string;
}

/**
 * Options for configuring how action parameter descriptors are extracted.
 */
export interface ActionParameterDescriptorExtractionOptions {
    /**
     * The parser to use for converting action parameter names into paths.
     */
    pathParser?: ActionParameterPathParser;
}

/**
 * Retrieves an action parameter descriptor from the given action metadata by its name.
 *
 * @template T - The type of the resulting action parameter descriptor.
 * @template U - The type of the action parameter.
 *
 * @param metadata - The action metadata containing the parameter.
 * @param name - The name of the parameter to extract a descriptor for.
 * @param descriptorFactory - A factory function that creates a new parameter descriptor from the given parameter, its name, and its path.
 * @param parameters - The parameters to extract a descriptor from.
 * @param options - Options for configuring how action parameter descriptors are extracted.
 *
 * @returns An action parameter descriptor, or `undefined` if the parameter was not found.
 */
export function getActionParameterDescriptor<T extends ActionParameterDescriptor, U extends ActionParameter>(metadata: ActionMetadata, name: string, descriptorFactory: (parameter: U, name: string, path: string[]) => T, parameters?: Record<string, U>, options?: ActionParameterDescriptorExtractionOptions): T | undefined {
    // Determine which pathParser to use based on the provided options.
    const pathParser = options?.pathParser ?? IDENTITY_ACTION_PARAMETER_PATH_PARSER;

    // Convert the parameter definition into its respective descriptor and return it.
    const parameter = parameters?.[name];
    const descriptor = parameter && descriptorFactory(parameter, name, pathParser(name, parameter, metadata));
    return descriptor;
}

/**
 * Retrieves action parameter descriptors from the given action metadata.
 *
 * @template T - The type of the resulting action parameter descriptors.
 * @template U - The type of the action parameters.
 *
 * @param metadata - The action metadata containing the parameters.
 * @param descriptorFactory - A factory function that creates a new parameter descriptor from the given parameter, its name, and its path.
 * @param parameters - The parameters to extract descriptors from.
 * @param options - Options for configuring how action parameter descriptors are extracted.
 *
 * @returns An array of action parameter descriptors.
 */
export function getActionParameterDescriptors<T extends ActionParameterDescriptor, U extends ActionParameter>(metadata: ActionMetadata, descriptorFactory: (parameter: U, name: string, path: string[]) => T, parameters?: Record<string, U>, options?: ActionParameterDescriptorExtractionOptions): T[] {
    // Determine which pathParser to use based on the provided options.
    const pathParser = options?.pathParser ?? IDENTITY_ACTION_PARAMETER_PATH_PARSER;

    // Convert the parameter definitions into their respective descriptors and return them.
    const namedParameters = parameters ? Object.entries(parameters) : [];
    const descriptors = namedParameters.map(([name, parameter]) => descriptorFactory(parameter, name, pathParser(name, parameter, metadata)));
    return descriptors;
}
