import { ACTION_NAME } from "@/action";
import { NeoForgeDependency } from "./neoforge-dependency";
import { NeoForgeMod } from "./neoforge-mod";
import { NeoForgeMetadataCustomPayload } from "./neoforge-metadata-custom-payload";

/**
 * The metadata file for a NeoForge mod.
 */
export interface RawNeoForgeMetadata {
    /**
     * The language loader for the mod.
     *
     * Used to specify an alternative language for the mod, such as Kotlin, if one exists.
     * The NeoForge-provided Java loader is `javafml`.
     */
    modLoader: string;

    /**
     * The acceptable version range of the language loader, expressed as a Maven version spec.
     *
     * For the NeoForge-provided Java loader, the version is the major version of the NeoForge version.
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
    mods?: NeoForgeMod[];

    /**
     * Dependency configurations, with a section for each mod's dependencies.
     */
    dependencies?: Record<string, NeoForgeDependency[]>;

    /**
     * Custom action payload.
     */
    [ACTION_NAME]?: NeoForgeMetadataCustomPayload;
}

/**
 * Name of the `mods.toml` file, that contains raw NeoForge metadata.
 */
export const MODS_TOML = "META-INF/mods.toml";
