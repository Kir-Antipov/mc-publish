import { VersionType } from "@/utils/versioning";
import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents Minecraft version types.
 *
 * @partial
 */
enum MinecraftVersionTypeValues {
    /**
     * Represents the release version type of Minecraft.
     */
    RELEASE = "release",

    /**
     * Represents the snapshot version type of Minecraft.
     */
    SNAPSHOT = "snapshot",

    /**
     * Represents the old beta version type of Minecraft.
     */
    OLD_BETA = "old_beta",

    /**
     * Represents the old alpha version type of Minecraft.
     */
    OLD_ALPHA = "old_alpha",
}

/**
 * Options for configuring the behavior of the MinecraftVersionType enum.
 *
 * @partial
 */
const MinecraftVersionTypeOptions: EnumOptions = {
    /**
     * The case should be ignored while parsing the version type.
     */
    ignoreCase: true,

    /**
     * Non-word characters should be ignored while parsing the version type.
     */
    ignoreNonWordCharacters: true,
};

/**
 * Converts a `MinecraftVersionType` value to a corresponding `VersionType` value.
 *
 * @param type - The Minecraft version type to convert.
 * @param version - The Minecraft version string, used for additional checks when the type is `Snapshot`.
 *
 * @returns The corresponding `VersionType` value.
 */
function toVersionType(type: MinecraftVersionType, version?: string): VersionType {
    switch (type) {
        case MinecraftVersionType.SNAPSHOT:
            return version?.match(/-pre|-rc|-beta|Pre-[Rr]elease|[Rr]elease Candidate/)
                ? VersionType.BETA
                : VersionType.ALPHA;

        case MinecraftVersionType.OLD_BETA:
            return VersionType.BETA;

        case MinecraftVersionType.OLD_ALPHA:
            return VersionType.ALPHA;

        default:
            return VersionType.RELEASE;
    }
}

/**
 * A collection of methods to work with MinecraftVersionType.
 *
 * @partial
 */
const MinecraftVersionTypeMethods = {
    toVersionType,
};

/**
 * Represents Minecraft version types.
 */
export const MinecraftVersionType = Enum.create(
    MinecraftVersionTypeValues,
    MinecraftVersionTypeOptions,
    MinecraftVersionTypeMethods,
);

/**
 * Represents Minecraft version types.
 */
export type MinecraftVersionType = Enum<typeof MinecraftVersionTypeValues>;
