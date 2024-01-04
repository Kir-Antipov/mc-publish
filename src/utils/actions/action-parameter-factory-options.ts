import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents the known options for the action parameter factory function.
 *
 * @partial
 */
enum ActionParameterFactoryOptionsValues {
    /**
     * Determines if the input string should be split into an array of strings.
     *
     * Default value is `true` if the type represents an array, and `false` otherwise.
     */
    SPLIT = "split",

    /**
     * If `split` is `true`, this is used to divide the input string into an array of strings.
     * Otherwise, it's unused.
     *
     * Default value is `/\r?\n/g`.
     */
    SEPARATOR = "separator",

    /**
     * If `split` is set to `true`, this indicates whether the factory/converter function
     * should accept the input array as a whole or process its values individually and then concatenate them into a new array.
     *
     * Default value is the same as `split`.
     */
    PROCESS_SEPARATELY = "processSeparately",

    /**
     * If `true`, trims whitespace from the beginning and end of each entry in the array.
     *
     * Default value is the same as `split`.
     */
    TRIM_ENTRIES = "trimEntries",

    /**
     * If `true`, removes empty entries from the array after processing.
     *
     * Default value is the same as `split`.
     */
    REMOVE_EMPTY_ENTRIES = "removeEmptyEntries",

    /**
     * The depth level specifying how deep a nested array structure should be flattened.
     * Passes the value to Array.prototype.flat() method.
     *
     * Default value is `1`.
     */
    FLAT_DEPTH = "flatDepth",
}

/**
 * Options for configuring the behavior of the `ActionParameterFactoryOptions` enum.
 *
 * @partial
 */
const ActionParameterFactoryOptionsOptions: EnumOptions = {
    /**
     * The case should be ignored while parsing the options.
     */
    ignoreCase: true,

    /**
     * Non-word characters should be ignored while parsing the options.
     */
    ignoreNonWordCharacters: true,
};

/**
 * Represents the known options for the action parameter factory function.
 */
export const ActionParameterFactoryOptions = Enum.create(
    ActionParameterFactoryOptionsValues,
    ActionParameterFactoryOptionsOptions,
);

/**
 * Represents the known options for the action parameter factory function.
 */
export type ActionParameterFactoryOptions = Enum<typeof ActionParameterFactoryOptionsValues>;
