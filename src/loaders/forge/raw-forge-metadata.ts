import { ACTION_NAME } from "@/action";
import { ForgeDependency } from "./forge-dependency";
import { ForgeMod } from "./forge-mod";
import { ForgeMetadataCustomPayload } from "./forge-metadata-custom-payload";

// _ TODO: Remove the deprecated stuff in v4.0.

/**
 * The metadata file for a Forge mod.
 */
export interface RawForgeMetadata {
    /**
     * The language loader for the mod.
     *
     * Used to specify an alternative language for the mod, such as Kotlin, if one exists.
     * The Forge-provided Java loader is `javafml`.
     */
    modLoader: string;

    /**
     * The acceptable version range of the language loader, expressed as a Maven version spec.
     *
     * For the Forge-provided Java loader, the version is the major version of the Forge version.
     */
    loaderVersion: string;

    /**
     * The license for the mod(s) in this JAR.
     *
     * This string may be any valid string, but it is suggested to set the value to be the
     * name of your license, and/or a link to that license.
     */
    license: string;

    /**
     * Whether to display this mod's resources as a separate option in the resource pack menu.
     *
     * If disabled, the mod's resources will be rolled into the "Mod resources" pack.
     *
     * Defaults to `false`.
     */
    showAsResourcePack?: boolean;

    /**
     * A table of custom substitution properties.
     *
     * This is used by `StringSubstitutor` to replace values, using `${file.*}`.
     */
    properties?: Record<string, unknown>;

    /**
     * A URL for an issues tracker.
     *
     * This should never be a blank string, as that will cause an error.
     */
    issueTrackerURL?: string;

    /**
     * The mod properties, with a section for each mod.
     */
    mods?: ForgeMod[];

    /**
     * Dependency configurations, with a section for each mod's dependencies.
     */
    dependencies?: Record<string, ForgeDependency[]>;

    /**
     * Custom action payload.
     */
    [ACTION_NAME]?: ForgeMetadataCustomPayload;

    /**
     * Custom action payload (legacy).
     *
     * @deprecated
     *
     * Use [{@link ACTION_NAME}] instead.
     */
    projects?: ForgeMetadataCustomPayload;

    /**
     * Custom action payload (legacy).
     *
     * @deprecated
     *
     * Use [{@link ACTION_NAME}] instead.
     */
    custom?: {
        /**
         * Custom action payload.
         */
        [ACTION_NAME]?: ForgeMetadataCustomPayload;

        /**
         * Custom action payload.
         */
        projects?: ForgeMetadataCustomPayload;
    };
}

/**
 * Name of the `mods.toml` file, that contains raw Forge metadata.
 */
export const MODS_TOML = "META-INF/mods.toml";
