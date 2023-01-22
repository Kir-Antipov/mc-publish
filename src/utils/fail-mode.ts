import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents different failure modes for handling errors.
 *
 * @partial
 */
enum FailModeValues {
    /**
     * Fail mode, halts the operation on encountering an error.
     */
    FAIL,

    /**
     * Warn mode, logs a warning and continues operation on encountering an error.
     */
    WARN,

    /**
     * Skip mode, skips the current operation and continues with the next one on encountering an error.
     */
    SKIP,
}

/**
 * Options for configuring the behavior of the `FailMode` enum.
 *
 * @partial
 */
const FailModeOptions: EnumOptions = {
    /**
     * The case should be ignored while parsing the fail mode.
     */
    ignoreCase: true,
};

/**
 * Represents different failure modes for handling errors.
 */
export const FailMode = Enum.create(
    FailModeValues,
    FailModeOptions,
);

/**
 * Represents different failure modes for handling errors.
 */
export type FailMode = Enum<typeof FailModeValues>;
