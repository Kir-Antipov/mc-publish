import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents different version types for software releases.
 *
 * @partial
 */
enum VersionTypeValues {
    /**
     * Alpha version, usually for early testing and development.
     */
    ALPHA = "alpha",

    /**
     * Beta version, typically for more advanced testing and bug fixing.
     */
    BETA = "beta",

    /**
     * Release version, the stable and final version of the software.
     */
    RELEASE = "release",
}

/**
 * Options for configuring the behavior of the VersionType enum.
 *
 * @partial
 */
const VersionTypeOptions: EnumOptions = {
    /**
     * The case should be ignored while parsing the version type.
     */
    ignoreCase: true,
};

/**
 * Parses the provided file name and returns the corresponding {@link VersionType}.
 *
 * @param fileName - The file name string to parse.
 *
 * @returns The detected {@link VersionType} based on the input file name.
 */
function parseFromFileName(fileName: string): VersionType {
    if (fileName.match(/[+-_]alpha/i)) {
        return VersionType.ALPHA;
    }

    if (fileName.match(/[+-_]beta/i)) {
        return VersionType.BETA;
    }

    return VersionType.RELEASE;
}

/**
 * A collection of methods to work with VersionType.
 *
 * @partial
 */
const VersionTypeMethods = {
    parseFromFileName,
};

/**
 * Represents different version types for software releases.
 */
export const VersionType = Enum.create(
    VersionTypeValues,
    VersionTypeOptions,
    VersionTypeMethods,
);

/**
 * Represents different version types for software releases.
 */
export type VersionType = Enum<typeof VersionTypeValues>;
