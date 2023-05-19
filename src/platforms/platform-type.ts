import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents different platform types for mod distribution.
 *
 * @partial
 */
enum PlatformTypeValues {
    /**
     * Represents CurseForge.
     */
    CURSEFORGE = "curseforge",

    /**
     * Represents Modrinth.
     */
    MODRINTH = "modrinth",

    /**
     * Represents GitHub.
     */
    GITHUB = "github",
}

/**
 * Options for configuring the behavior of the `PlatformType` enum.
 *
 * @partial
 */
const PlatformTypeOptions: EnumOptions = {
    /**
     * The case should be ignored while parsing the platform type.
     */
    ignoreCase: true,

    /**
     * Non-word characters should be ignored while parsing the platform type.
     */
    ignoreNonWordCharacters: true,

    /**
     * Custom friendly names for keys that don't follow the general naming convention.
     */
    names: [
        ["CURSEFORGE", "CurseForge"],
        ["GITHUB", "GitHub"],
    ],
};

/**
 * Represents different platform types for mod distribution.
 */
export const PlatformType = Enum.create(
    PlatformTypeValues,
    PlatformTypeOptions,
);

/**
 * Represents different platform types for mod distribution.
 */
export type PlatformType = Enum<typeof PlatformTypeValues>;
