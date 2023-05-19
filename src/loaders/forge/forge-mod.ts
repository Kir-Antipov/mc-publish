/**
 * Represents a mod entry in a Forge metadata file.
 */
export interface ForgeMod {
    /**
     * The mod's identifier.
     *
     * This must match the following regex: `^[a-z][a-z0-9_-]{1,63}$`.
     */
    modId: string;

    /**
     * An override namespace.
     *
     * Currently, there is no use for this property.
     *
     * Defaults to the same value as `modId`.
     */
    namespace?: string;

    /**
     * The mod's version, ideally conforming to semantic versioning.
     *
     * The default value in the MDK for this is `${file.jarVersion}`,
     * which is replaced at runtime with the `Implementation-Version` found in the jar's manifest file.
     */
    version?: string;

    /**
     * The display name of the mod, for use in the Mods listing screen.
     *
     * Defaults to the same value as `modId`.
     */
    displayName?: string;

    /**
     * The description of the mod, for use in the Mods listing screen.
     *
     * Defaults to `MISSING DESCRIPTION`.
     */
    description?: string;

    /**
     * The path of the logo file image, for use in the Mods listing screen.
     *
     * The image must be in the root of the jar file, not in
     * any subfolder thereof (e.g. the file is directly in src/main/resources).
     */
    logoFile?: string;

    /**
     * Whether to do some blurring on the mod's logo in the Mods listing screen.
     *
     * Has no effect if `logoFile` is not set.
     *
     * Defaults to `true`.
     */
    logoBlur?: boolean;

    /**
     * The update JSON URL, used by the update checker.
     *
     * This should never be a blank string, as that will cause an error.
     */
    updateJSONURL?: string;

    /**
     * A table of custom mod properties; this is not used for Forge, but is mainly for use by mods.
     */
    modproperties?: Record<string, unknown>;

    /**
     * Credits and acknowledgements for the mod, for use in the Mods listing screen. Can be any string.
     */
    credits?: string;

    /**
     * A string indicating who created the mod.
     */
    authors?: string;

    /**
     * A URL, displayed on the Mods listing screen. Can be any string.
     */
    displayURL?: string;

    /**
     * Controls the display of the mod in the server connection screen.
     *
     * Defaults to `MATCH_VERSION`.
     */
    displayTest?: "MATCH_VERSION" | "IGNORE_SERVER_VERSION" | "IGNORE_ALL_VERSION" | "NONE";
}
