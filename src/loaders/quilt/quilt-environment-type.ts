import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents the different environments that a Quilt mod can run on.
 */
enum QuiltEnvironmentTypeValues {
    /**
     * The physical client.
     */
    CLIENT = "client",

    /**
     * The dedicated server.
     */
    DEDICATED_SERVER = "dedicated_server",

    /**
     * Runs on all environments.
     */
    ALL = "*",
}

/**
 * Options for configuring the behavior of the `QuiltEnvironmentType` enum.
 */
const QuiltEnvironmentTypeOptions: EnumOptions = {
    /**
     * Ignore the case of the environment type string when parsing.
     */
    ignoreCase: true,

    /**
     * Non-word characters should be ignored while parsing the filter.
     */
    ignoreNonWordCharacters: true,
};

/**
 * Represents the different environments that a Quilt mod can run on.
 */
export const QuiltEnvironmentType = Enum.create(
    QuiltEnvironmentTypeValues,
    QuiltEnvironmentTypeOptions,
);

/**
 * Represents the different environments that a Quilt mod can run on.
 */
export type QuiltEnvironmentType = Enum<typeof QuiltEnvironmentTypeValues>;
