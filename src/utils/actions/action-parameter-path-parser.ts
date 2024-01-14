import { $i } from "@/utils/collections";
import { capitalize } from "@/utils/string-utils";
import { ActionMetadata } from "./action-metadata";
import { ActionParameter } from "./action-parameter";

/**
 * Converts a parameter name to an array of property names that identify its location.
 */
export interface ActionParameterPathParser {
    /**
     * Converts a parameter name to an array of property names that identify its location.
     *
     * @param name - The name of the parameter.
     * @param parameter - The input or output parameter for which to generate the path, if any.
     * @param metadata - The action metadata object containing the parameter, if any.
     *
     * @returns An array of property names that identify the location of the parameter.
     */
    (name: string, parameter?: ActionParameter, metadata?: ActionMetadata): string[];
}

/**
 * Returns the parameter name as a single-element array, representing the identity path of the parameter.
 *
 * @param name - The name of the parameter.
 *
 * @returns An array containing a single element, which is the name of the parameter.
 */
export const IDENTITY_ACTION_PARAMETER_PATH_PARSER: ActionParameterPathParser = name => [name || ""];

/**
 * Splits the parameter name by non-letter and non-number characters, converts each word to lowercase,
 * and returns an array of property names that identify the location of the parameter.
 *
 * @param name - The name of the parameter.
 *
 * @returns An array of property names that identify the location of the parameter.
 */
export const SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER: ActionParameterPathParser = name =>
    (name || "").split(/[^\p{L}\p{N}]/u).map(x => x.toLowerCase());

/**
 * Splits the parameter name by non-letter and non-number characters, converts each word to lowercase,
 * groups the parameter based on the input/output group specified in the metadata object, and
 * returns an array of property names that identify the location of the parameter.
 *
 * @param name - The name of the parameter.
 * @param parameter - The input or output parameter for which to generate the path, if any.
 * @param metadata - The action metadata object containing the parameter, if any.
 *
 * @returns An array of property names that identify the location of the parameter.
 *
 * @remarks
 *
 * For example, given the following set of parameter names:
 * ```
 * [
 *   "bar-baz",
 *   "foo-qux",
 *   "foo-qux-waldo",
 * ]
 * ```
 * And groups:
 * ```
 * [
 *   "foo",
 * ]
 * ```
 *
 * The output would be:
 * ```
 * [
 *   ["barBaz"],
 *   ["foo", "qux"],
 *   ["foo", "quxWaldo"],
 * ]
 * ```
 */
export const SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER: ActionParameterPathParser = (name, parameter, metadata) => {
    const path = SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER(name, parameter, metadata);
    if (!parameter || !metadata) {
        return path;
    }

    const groups = metadata.inputs?.[name] === parameter ? metadata.groups?.input : metadata.outputs?.[name] === parameter ? metadata.groups?.output : undefined;
    const groupNames = groups ? Object.keys(groups) : [];
    const parameterGroup = $i(groupNames)
        .map(x => SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER(x, parameter, metadata))
        .filter(x => $i(path).startsWith(x))
        .max((a, b) => a.length - b.length);

    const maxPathLength = (parameterGroup?.length || 0) + 1;
    const flattenedPath = flattenPath(path, maxPathLength);
    return flattenedPath;
};

/**
 * Flattens the path array by merging consecutive elements that represent a single property name.
 *
 * @param path - An array of property names to be flattened.
 * @param maxPathLength - The maximum length of the flattened path.
 *
 * @returns The flattened path array.
 *
 * @remarks
 *
 * This method changes the array in place.
 */
function flattenPath(path: string[], maxPathLength?: number): string[] {
    // `maxPathLength` cannot be less then `1`, because we cannot fold a path any further than that.
    // Also, we can handle `NaN`, `undefined`, and `null` this way.
    if (!(maxPathLength >= 1)) {
        maxPathLength = 1;
    }

    while (path.length > maxPathLength) {
        path[path.length - 2] += capitalize(path[path.length - 1]);
        path.splice(path.length - 1);
    }
    return path;
}
