import { $i } from "@/utils/collections";
import { DEFAULT_NEWLINE, ENVIRONMENT, getEnvironmentVariable } from "@/utils/environment";
import { FileNotFoundError } from "@/utils/errors";
import { generateSecureRandomString } from "@/utils/string-utils";
import { appendFileSync } from "node:fs";
import { ActionMetadata } from "./action-metadata";
import { ActionOutputDescriptor, getActionOutputDescriptors } from "./action-output-descriptor";
import { ActionParameter } from "./action-parameter";
import { ActionParameterDescriptorExtractionOptions } from "./action-parameter-descriptor";

/**
 * Output parameters allow you to declare data that an action sets.
 * Actions that run later in a workflow can use the output data set in previously run actions.
 * For example, if you had an action that performed the addition of two inputs (x + y = z), the action could output the sum (z) for other actions to use as an input.
 *
 * Outputs are Unicode strings, and can be a maximum of 1 MB. The total of all outputs in a workflow run can be a maximum of 50 MB.
 */
export interface ActionOutput extends ActionParameter {
    /**
     * The value that the output parameter will be mapped to.
     */
    value?: string | number | boolean;
}

/**
 * Options to configure the output controller.
 */
export interface ActionOutputControllerOptions {
    /**
     * Custom getter function for an output.
     */
    getOutput?: (name: string) => unknown;

    /**
     * Custom setter function for an output.
     */
    setOutput?: (name: string, value: unknown) => void;
}

/**
 * The name of the environment variable that points to the output file in the GitHub Actions environment.
 *
 * @remarks
 *
 * https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter
 */
const OUTPUT_FILE_NAME = "GITHUB_OUTPUT";

/**
 * A weak map to cache the set of output names and values for each environment.
 */
const OUTPUT_CACHE = new WeakMap<Record<string, string>, Map<string, unknown>>();

/**
 * Sets the value of an output.
 *
 * @param name - Name of the output to set.
 * @param value - Value to set the output to.
 * @param env - An optional set of the environment variables to update.
 */
export function setActionOutput(name: string, value: unknown, env?: Record<string, string>): void {
    env ||= ENVIRONMENT;

    const fileName = getEnvironmentVariable(OUTPUT_FILE_NAME, env);
    FileNotFoundError.throwIfNotFound(fileName);

    const nameAndValue = formatNameAndValue(name, value);
    appendFileSync(fileName, `${nameAndValue}${DEFAULT_NEWLINE}`, "utf8");

    if (!OUTPUT_CACHE.has(env)) {
        OUTPUT_CACHE.set(env, new Map());
    }
    OUTPUT_CACHE.get(env).set(name, value);
}

/**
 * Formats the name and value of the output as a string.
 *
 * @param name - The name of the output.
 * @param value - The value of the output.
 *
 * @returns The formatted name and value string.
 *
 * @remarks
 *
 * https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#multiline-strings
 */
function formatNameAndValue(name: string, value: unknown): string {
    const formattedValue = formatValue(value);
    const delimiter = generateDelimiter();

    return `${name}<<${delimiter}${DEFAULT_NEWLINE}${formattedValue}${DEFAULT_NEWLINE}${delimiter}`;
}

/**
 * Converts the output value to a string representation.
 *
 * @param value - The output value.
 *
 * @returns The string representation of the value.
 */
function formatValue(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }

    if (value === null || value === undefined) {
        return "";
    }

    return JSON.stringify(value);
}

/**
 * Generates a unique delimiter string.
 *
 * @returns The generated delimiter string.
 */
function generateDelimiter(): string {
    const DELIMITER_SIZE = 32;

    return `mcp${DELIMITER_SIZE}_${generateSecureRandomString(DELIMITER_SIZE)}`;
}

/**
 * Sets multiple action outputs at once using an iterable of [name, value] pairs.
 *
 * @param outputs - An iterable of [name, value] pairs representing the outputs to be set.
 * @param env - An optional set of the environment variables to update.
 */
export function setActionOutputs(outputs: Iterable<readonly [string, unknown]>, env?: Record<string, string>): void {
    for (const [name, value] of outputs) {
        setActionOutput(name, value, env);
    }
}

/**
 * Gets the value of an output.
 *
 * @template T - Type of the output.
 *
 * @param name - Name of the output to get.
 * @param env - An optional set of the environment variables to search within.
 *
 * @returns The value of the output, or `undefined` if it was not set.
 */
export function getActionOutput<T = unknown>(name: string, env?: Record<string, string>): T | undefined {
    env ||= ENVIRONMENT;

    const outputs = OUTPUT_CACHE.get(env);
    return outputs?.get(name) as T;
}

/**
 * Gets the values of multiple outputs.
 *
 * @template T - Type of the outputs.
 *
 * @param names - Names of the outputs to get.
 * @param env - An optional set of the environment variables to search within.
 *
 * @returns An array of the values of the outputs. The order of the values matches the order of the output names in the `names` parameter.
 */
export function getActionOutputs<T extends unknown[]>(names: Iterable<string>, env?: Record<string, string>): T {
    return $i(names).map(name => getActionOutput(name, env)).toArray() as T;
}

/**
 * Returns a map containing all outputs set by the action.
 *
 * @param env - An optional set of the environment variables to search within.
 *
 * @returns A map of output names and their corresponding values.
 */
export function getAllActionOutputs(env?: Record<string, string>): Map<string, unknown> {
    env ||= ENVIRONMENT;

    return new Map<string, unknown>(OUTPUT_CACHE.get(env) || []);
}

/**
 * Creates a controller for managing GitHub Action outputs in a hierarchical structure.
 *
 * @template T - Controller type.
 *
 * @param descriptors - An iterable collection of action output descriptors.
 * @param options - Optional configuration for the controller.
 *
 * @returns A controller with the specified type for convenient access to action outputs.
 */
export function createActionOutputController<T = unknown>(descriptors: Iterable<ActionOutputDescriptor>, options?: ActionOutputControllerOptions): T {
    return new ActionOutputController(descriptors, options).navigate([]) as T;
}

/**
 * Creates a controller for managing GitHub Action outputs using the provided action metadata.
 *
 * @template T - Controller type.
 *
 * @param metadata - The metadata describing the action.
 * @param options - Optional configuration for the controller and descriptor extraction.
 *
 * @returns A controller with the specified type for convenient access to action outputs.
 */
export function createActionOutputControllerUsingMetadata<T = unknown>(metadata: ActionMetadata, options?: ActionParameterDescriptorExtractionOptions & ActionOutputControllerOptions): T {
    const descriptors = getActionOutputDescriptors(metadata, options);
    return createActionOutputController(descriptors, options);
}

/**
 * Represents a container for the path of the output.
 */
interface PathContainer {
    /**
     * The path of the output.
     */
    path: string[];
}

/**
 * Represents a controller which manages GitHub Action outputs in a hierarchical structure.
 *
 * Provides a convenient way to set and get outputs using nested properties.
 */
class ActionOutputController implements ProxyHandler<PathContainer> {
    /**
     * Descriptors of outputs which should be handled by this controller.
     */
    private readonly _descriptors: ActionOutputDescriptor[];

    /**
     * Custom getter function for an output.
     */
    private readonly _getOutput: (name: string) => unknown;

    /**
     * Custom setter function for an output.
     */
    private readonly _setOutput: (name: string, value: unknown) => void;

    /**
     * Constructs a new {@link ActionOutputController} instance.
     *
     * @param descriptors - An iterable collection of action output descriptors.
     * @param options - Optional configuration for the controller.
     */
    constructor(descriptors: Iterable<ActionOutputDescriptor>, options?: ActionOutputControllerOptions) {
        this._descriptors = [...descriptors];
        this._getOutput = options?.getOutput || getActionOutput;
        this._setOutput = options?.setOutput || setActionOutput;
    }

    /**
     * Navigates to a specified path within the hierarchical structure of action outputs.
     *
     * @param path - An array of strings representing the path to navigate to.
     *
     * @returns A proxy object for the specified path, allowing access to nested action outputs.
     */
    navigate(path: readonly string[]): Record<string | symbol, unknown> {
        return new Proxy({ path }, this);
    }

    /**
     * @inheritdoc
     */
    get(target: PathContainer, property: string | symbol): unknown {
        const path = [...target.path, String(property)];
        const descriptor = this.findNearestDescriptor(path);

        if (!descriptor) {
            return undefined;
        }

        if (descriptor.path.length === path.length) {
            return this._getOutput(descriptor.name);
        }

        return this.navigate(path);
    }

    /**
     * @inheritdoc
     */
    set(target: PathContainer, property: string | symbol, newValue: unknown): boolean {
        const path = [...target.path, String(property)];
        const descriptor = this.findNearestDescriptor(path);

        if (!descriptor) {
            return false;
        }

        if (descriptor.path.length === path.length) {
            this._setOutput(descriptor.name, newValue);
            return true;
        }

        if (!newValue || typeof newValue !== "object") {
            return false;
        }

        const proxy = this.navigate(path);
        for (const [key, value] of Object.entries(newValue)) {
            proxy[key] = value;
        }
        return true;
    }

    /**
     * @inheritdoc
     */
    has(target: PathContainer, property: string | symbol): boolean {
        const path = [...target.path, String(property)];
        const descriptor = this.findNearestDescriptor(path);
        return !!descriptor;
    }

    /**
     * @inheritdoc
     */
    ownKeys(target: PathContainer): string[] {
        const path = target.path;
        const descriptors = $i(this._descriptors).filter(d => d.path.length > path.length && $i(d.path).startsWith(path));
        const keys = descriptors.map(d => d.path[path.length]).distinct().toArray();
        return keys;
    }

    /**
     * @inheritdoc
     */
    getOwnPropertyDescriptor(target: PathContainer, property: string | symbol): PropertyDescriptor | undefined {
        if (!this.has(target, property)) {
            return undefined;
        }

        const value = this.get(target, property);
        return {
            value,
            configurable: true,
            enumerable: true,
            writable: true,
        };
    }

    /**
     * @inheritdoc
     */
    defineProperty(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    deleteProperty(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    getPrototypeOf(): typeof Object.prototype {
        return Object.prototype;
    }

    /**
     * @inheritdoc
     */
    setPrototypeOf(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    isExtensible(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    preventExtensions(): boolean {
        return true;
    }

    /**
     * Finds the nearest descriptor for the provided path.
     *
     * @param path - The path to search for the nearest descriptor.
     *
     * @returns The nearest descriptor if found, or `undefined` otherwise.
     */
    private findNearestDescriptor(path: readonly string[]): ActionOutputDescriptor | undefined {
        const descriptor = (
            this._descriptors.find(d => d.path.length === path.length && $i(d.path).startsWith(path)) ||
            this._descriptors.find(d => d.path.length > path.length && $i(d.path).startsWith(path))
        );

        const targetDescriptor = descriptor?.redirect ? this._descriptors.find(d => d.name === descriptor.redirect) : descriptor;
        return targetDescriptor;
    }
}
