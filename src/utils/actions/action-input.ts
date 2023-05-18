import { runSafely } from "@/utils/async-utils";
import { $i, asArray } from "@/utils/collections";
import { Converter, toType } from "@/utils/convert";
import { getAllEnvironmentVariables, getEnvironmentVariable, setEnvironmentVariable } from "@/utils/environment";
import { QueryString } from "@/utils/net";
import { ModuleLoader, NODE_MODULE_LOADER, defineNestedProperty, executeImportDirective } from "@/utils/reflection";
import { split, stringEquals } from "@/utils/string-utils";
import { ActionInputDescriptor, getActionInputDescriptors } from "./action-input-descriptor";
import { ActionMetadata } from "./action-metadata";
import { ActionParameter, normalizeActionParameterName } from "./action-parameter";
import { ActionParameterDescriptorExtractionOptions } from "./action-parameter-descriptor";
import { ActionParameterFactoryOptions } from "./action-parameter-factory-options";
import { ActionParameterTypeDescriptor } from "./action-parameter-type-descriptor";

/**
 * Input parameters allow you to specify data that the action expects to use during runtime.
 *
 * GitHub stores input parameters as environment variables.
 * Input ids with uppercase letters are converted to lowercase during runtime.
 */
export interface ActionInput extends ActionParameter {
    /**
     * A boolean indicating whether the input parameter is required.
     * If `true`, the action will fail if the parameter is not provided.
     */
    required?: boolean;

    /**
     * The default value to use when the input parameter is not specified in the workflow file.
     * This value is used if `required` is `false`.
     */
    default?: string | number | boolean;

    /**
     * A message to display if the input parameter is used, indicating that it is deprecated and suggesting alternatives.
     */
    deprecationMessage?: string;
}

/**
 * Configures the way input retrieving works.
 */
export interface InputOptions {
    /**
     * Indicates whether the input is required.
     * If required and not present, will throw.
     *
     * Defaults to `false`.
     */
    required?: boolean;

    /**
     * Indicates whether leading/trailing whitespace will be trimmed for the input.
     *
     * Defaults to `true`.
     */
    trimWhitespace?: boolean;
}

/**
 * Configures the way input object retrieving works.
 */
export interface InputObjectOptions extends InputOptions {
    /**
     * The module loader to use for loading modules.
     */
    moduleLoader?: ModuleLoader;

    /**
     * The converter to use for converting values.
     */
    converter?: Converter;
}

/**
 * A synthetic string used to represent an undefined input value in the context of GitHub Actions.
 *
 * This value is used because inputs with an empty string value and inputs that were not supplied
 * are indistinguishable in the context of GitHub Actions. Therefore, this synthetic value is used
 * to represent undefined input values, allowing for a clear distinction between empty and undefined
 * values.
 *
 * @remarks
 *
 * Yeah, it seems that Microsoft didn't think that 2 already existing values that
 * represent absence of any object value in slightly different ways quite cut it,
 * so for their GitHub Actions they invented a brand new one!
 * Rejoice and greet an, I'm sorry, THE empty string!
 *
 * @remarks
 *
 * Someone at Microsoft was like:
 *
 * - undefined === null == "" // true
 * - Hm, seems legit
 *
 */
// eslint-disable-next-line no-template-curly-in-string
export const SYNTHETIC_UNDEFINED = "${undefined}";

/**
 * The prefix used to identify GitHub Action inputs in the environment variables.
 */
const INPUT_PREFIX = "INPUT_";

/**
 * Sets the value of a GitHub Action input by setting an environment variable.
 *
 * @param name - The name of the input to set.
 * @param value - The value to set for the input.
 * @param env - An optional set of the environment variables to update. Defaults to `process.env`.
 */
export function setActionInput(name: string, value: unknown, env?: Record<string, string>): void {
    const normalizedName = normalizeActionParameterName(name);
    const environmentVariableName = INPUT_PREFIX + normalizedName;
    const stringifiedValue = value === undefined || value === SYNTHETIC_UNDEFINED
        ? undefined
        : typeof value === "string"
            ? value
            : JSON.stringify(value);

    setEnvironmentVariable(environmentVariableName, stringifiedValue, env);
}

/**
 * Sets the values of multiple GitHub Action inputs by setting their environment variables.
 *
 * @param inputs - An iterable object of pairs, where the first item is the input parameter name, and the second item is the input parameter value.
 * @param env - An optional set of the environment variables to update. Defaults to `process.env`.
 */
export function setActionInputs(inputs: Iterable<readonly [string, unknown]>, env?: Record<string, string>): void {
    for (const [name, value] of inputs) {
        setActionInput(name, value, env);
    }
}

/**
 * Gets the value of an input.
 *
 * @param name - Name of the input to get.
 * @param options - Options to configure the way input retrieving works.
 * @param env - An optional set of the environment variables to search within. Defaults to `process.env`.
 *
 * @returns The value of the input, or `undefined` if it was not provided.
 *
 * @throws An error if the `options.required` flag is set to `true` and the input is not defined.
 */
export function getActionInput(name: string, options?: InputOptions, env?: Record<string, string>): string | undefined {
    const normalizedName = normalizeActionParameterName(name);
    const environmentVariableName = INPUT_PREFIX + normalizedName;
    const brokenValue = getEnvironmentVariable(environmentVariableName, env);
    const value = isActionInputDefined(brokenValue) ? brokenValue : undefined;
    const trimmedValue = (options?.trimWhitespace ?? true) ? value?.trim() : value;

    if (options?.required && value === undefined) {
        throw new Error(`Input required and not supplied: ${name}.`);
    }

    return trimmedValue;
}

/**
 * Gets the values of multiple inputs.
 *
 * @param names - Names of the inputs to get.
 * @param options - Options to configure the way input retrieving works.
 * @param env - An optional set of the environment variables to search within. Defaults to `process.env`.
 *
 * @returns An array of the values of the inputs. The order of the values matches the order of the input names in the `names` parameter.
 * @throws An error if the `options.required` flag is set to `true` and one of the inputs is not defined.
 */
export function getActionInputs(names: Iterable<string>, options?: InputOptions, env?: Record<string, string>): string[] {
    return $i(names).map(name => getActionInput(name, options, env)).toArray();
}

/**
 * Returns a map containing all inputs provided to the action.
 *
 * @param options - Options to configure the way input retrieving works.
 * @param env - An optional set of the environment variables to search within. Defaults to `process.env`.
 *
 * @returns A map of input names and their corresponding values.
 * @throws An error if the `options.required` flag is set to `true` and one of the inputs is not defined.
 */
export function getAllActionInputs(options?: InputOptions, env?: Record<string, string>): Map<string, string> {
    const inputs = new Map<string, string>();
    const required = options?.required;
    const trimWhitespace = options?.trimWhitespace ?? true;

    for (const [name, value] of getAllEnvironmentVariables(env)) {
        if (!name.startsWith(INPUT_PREFIX)) {
            continue;
        }

        const inputName = name.substring(INPUT_PREFIX.length);
        const isValueDefined = isActionInputDefined(value);

        if (required && !isValueDefined) {
            throw new Error(`Input required and not supplied: ${inputName}.`);
        }

        if (!isValueDefined) {
            continue;
        }

        const inputValue = trimWhitespace ? value.trim() : value;
        inputs.set(inputName, inputValue);
    }
    return inputs;
}

/**
 * Checks whether the provided value is a defined input value.
 *
 * @param value - The value to check.
 *
 * @returns `true` if the value is a defined input value; otherwise, `false`.
 */
function isActionInputDefined(value: unknown): value is string {
    return typeof value === "string" && value !== SYNTHETIC_UNDEFINED;
}

/**
 * Retrieves all action inputs, converts them to the specified types, and returns them as an object.
 *
 * @template T - The expected type of the resulting object.
 *
 * @param descriptors - An iterable of action input descriptors.
 * @param options - Options for customizing the input object creation.
 * @param env - An optional set of the environment variables to search within. Defaults to `process.env`.
 *
 * @returns A promise that resolves to an object containing the processed inputs.
 */
export async function getAllActionInputsAsObject<T = unknown>(descriptors: Iterable<ActionInputDescriptor>, options?: InputObjectOptions, env?: Record<string, string>): Promise<T> {
    const moduleLoader = options?.moduleLoader || NODE_MODULE_LOADER;
    const converter = options?.converter || toType;

    const descriptorArray = asArray(descriptors);
    const inputs = getAllActionInputs(options, env);
    const inputObject = { } as T;

    for (const [name, value] of inputs) {
        const descriptor = descriptorArray.find(d => stringEquals(d.name, name, { ignoreCase: true }));
        const targetDescriptor = descriptor?.redirect ? descriptorArray.find(d => d.name === descriptor.redirect) : descriptor;
        if (!targetDescriptor) {
            continue;
        }

        const parsedValue = await parseInput(value, descriptor.type, moduleLoader, converter);
        if (parsedValue === undefined) {
            throw new Error(`Cannot convert "${descriptor.name}" to "${descriptor.type.name}".`);
        }

        defineNestedProperty(inputObject, targetDescriptor.path, { value: parsedValue, writable: true, configurable: true, enumerable: true });
    }

    return inputObject;
}

/**
 * Retrieves all action inputs using metadata, converts them to the specified types, and returns them as an object.
 *
 * @template T - The expected type of the resulting object.
 *
 * @param metadata - The metadata of the action.
 * @param options - Options for customizing the input object creation and descriptor extraction.
 * @param env - An optional set of the environment variables to search within. Defaults to `process.env`.
 *
 * @returns A promise that resolves to an object containing the processed inputs.
 */
export async function getAllActionInputsAsObjectUsingMetadata<T = unknown>(metadata: ActionMetadata, options?: InputObjectOptions & ActionParameterDescriptorExtractionOptions, env?: Record<string, string>): Promise<T> {
    const descriptors = getActionInputDescriptors(metadata, options);
    return await getAllActionInputsAsObject(descriptors, options, env);
}

/**
 * Parses an input value using the specified type descriptor, module loader, and converter function.
 *
 * @param value - The input value to parse.
 * @param type - The type descriptor for the input.
 * @param moduleLoader - The module loader to use when loading modules.
 * @param converter - The converter function to use when converting the input value.
 *
 * @returns A promise that resolves to the parsed input value.
 */
async function parseInput(value: string, type: ActionParameterTypeDescriptor, moduleLoader: ModuleLoader, converter: Converter): Promise<unknown> {
    const shouldSplit = type.options?.getBoolean(ActionParameterFactoryOptions.SPLIT) ?? type.isArray;
    const parse = shouldSplit ? parseMultipleInputs : parseSingleInput;

    return await parse(value, type, moduleLoader, converter);
}

/**
 * Parses multiple input values using the specified type descriptor, module loader, and converter function.
 *
 * @param value - The input value to parse.
 * @param type - The type descriptor for the input.
 * @param moduleLoader - The module loader to use when loading modules.
 * @param converter - The converter function to use when converting the input value.
 *
 * @returns A promise that resolves to the parsed input values.
 */
async function parseMultipleInputs(value: string, type: ActionParameterTypeDescriptor, moduleLoader: ModuleLoader, converter: Converter): Promise<unknown> {
    const separator = type.options?.getRegExp(ActionParameterFactoryOptions.SEPARATOR) ?? /\r?\n/g;
    const processSeparately = type.options?.getBoolean(ActionParameterFactoryOptions.PROCESS_SEPARATELY) ?? true;
    const trimEntries = type.options?.getBoolean(ActionParameterFactoryOptions.TRIM_ENTRIES) ?? true;
    const removeEmptyEntries = type.options?.getBoolean(ActionParameterFactoryOptions.REMOVE_EMPTY_ENTRIES) ?? true;
    const flatDepth = type.options?.getNumber(ActionParameterFactoryOptions.FLAT_DEPTH) ?? 1;

    const values = split(value, separator, { trimEntries, removeEmptyEntries });

    if (!processSeparately) {
        return await parseSingleInput(values, type, moduleLoader, converter);
    }

    const processedValues = await Promise.all(values.map(v => parseSingleInput(v, type, moduleLoader, converter)));
    const flattenedValues = processedValues.flat(flatDepth);
    return flattenedValues;
}

/**
 * Parses a single input value using the specified type descriptor, module loader, and converter function.
 *
 * @param value - The input value to parse.
 * @param type - The type descriptor for the input.
 * @param moduleLoader - The module loader to use when loading modules.
 * @param converter - The converter function to use when converting the input value.
 *
 * @returns A promise that resolves to the parsed input value.
 */
async function parseSingleInput(value: string | string[], type: ActionParameterTypeDescriptor, moduleLoader: ModuleLoader, converter: Converter): Promise<unknown> {
    // Simple cases like "string", "number", "Date".
    // Should be handled by the `converter` function.
    if (!type.factory && !type.module) {
        return await converter(value, type.name);
    }

    const typeImport = await executeImportDirective(type, { moduleLoader, required: false });

    // The `factory` function was specified.
    // Therefore, it should be used to process the input.
    if (type.factory) {
        const factoryImport = await executeImportDirective<(v: string | string[], o?: QueryString) => unknown>(type.factory, {
            moduleLoader,
            defaultModuleProvider: d => Promise.resolve(d.isDefault ? (typeImport?.value ?? globalThis) : globalThis),
            required: true,
        });

        return await factoryImport.value(value, type.options);
    }

    // The only hope we have is that `converter` function will be able to process the input
    // using the target type or its module themselves.
    //
    // This is usually the case when a type has a dedicated `parse`- or `convert`-like module,
    // or one those is specified on the module itself.
    const conversionMethodContainers = [typeImport?.value, typeImport?.module].filter(x => x);
    for (const target of conversionMethodContainers) {
        const [convertedValue] = await runSafely(() => converter(value, target));
        if (convertedValue !== undefined) {
            return convertedValue;
        }
    }

    // None of the above strategies worked.
    // Let the caller deal with it.
    return undefined;
}
