import { Version } from "@/utils/versioning";

/**
 * Represents a game version.
 */
export interface GameVersion {
    /**
     * The unique identifier of the game version.
     */
    get id(): string;

    /**
     * The version that represents this object.
     */
    get version(): Version;

    /**
     * A boolean indicating whether the game version is a snapshot or not.
     */
    get isSnapshot(): boolean;

    /**
     * A boolean indicating whether the game version is an alpha version or not.
     */
    get isAlpha(): boolean;

    /**
     * A boolean indicating whether the game version is a beta version or not.
     */
    get isBeta(): boolean;

    /**
     * A boolean indicating whether the game version is a release version or not.
     */
    get isRelease(): boolean;
}
