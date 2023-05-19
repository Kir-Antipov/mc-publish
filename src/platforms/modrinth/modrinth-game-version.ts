/**
 * Represents a Modrinth game version.
 */
export interface ModrinthGameVersion {
    /**
     * The name/number of the game version.
     */
    version: string;

    /**
     * The type of the game version.
     */
    version_type: "release" | "snapshot" | "alpha" | "beta";

    /**
     * The date of the game version release.
     *
     * @remarks The date should be in the ISO-8601 format.
     */
    date: string;

    /**
     * Whether or not this is a major version, used for Featured Versions.
     */
    major: boolean;
}
