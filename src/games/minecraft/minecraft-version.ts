import { GameVersion } from "@/games/game-version";
import { Version, VersionType } from "@/utils/versioning";
import { MinecraftVersionType } from "./minecraft-version-type";

/**
 * Represents a Minecraft version.
 */
export class MinecraftVersion implements GameVersion {
    /**
     * The version identifier.
     */
    private readonly _id: string;

    /**
     * The parsed version information.
     */
    private readonly _version: Version;

    /**
     * The original Minecraft version type.
     */
    private readonly _mcType: MinecraftVersionType;

    /**
     * The normalized version type.
     */
    private readonly _type: VersionType;

    /**
     * The URL for the version's metadata.
     */
    private readonly _url: string;

    /**
     * The release date of the version.
     */
    private readonly _releaseDate: Date;

    /**
     * Constructs a new {@link MinecraftVersion} instance.
     *
     * @param id - The version identifier.
     * @param version - The parsed version information.
     * @param type - The Minecraft version type.
     * @param url - The URL for the version's metadata.
     * @param releaseDate - The release date of the version.
     */
    constructor(id: string, version: Version, type: MinecraftVersionType, url: string, releaseDate: Date) {
        this._id = id;
        this._version = version;
        this._mcType = type;
        this._type = MinecraftVersionType.toVersionType(type, String(version));
        this._url = url;
        this._releaseDate = releaseDate;
    }

    /**
     * Returns the version identifier.
     */
    get id(): string {
        return this._id;
    }

    /**
     * Returns the parsed version information.
     */
    get version(): Version {
        return this._version;
    }

    /**
     * Returns the version type.
     */
    get type(): VersionType {
        return this._type;
    }

    /**
     * Returns the URL for the version's metadata.
     */
    get url(): string {
        return this._url;
    }

    /**
     * Returns the release date of the version.
     */
    get releaseDate(): Date {
        return this._releaseDate;
    }

    /**
     * Returns `true` if the version is an alpha version.
     */
    get isAlpha(): boolean {
        return this._type === VersionType.ALPHA;
    }

    /**
     * Returns `true` if the version is a beta version.
     */
    get isBeta(): boolean {
        return this._type === VersionType.BETA;
    }

    /**
     * Returns `true` if the version is a snapshot version.
     */
    get isSnapshot(): boolean {
        return !this.isRelease;
    }

    /**
     * Returns `true` if the version is a release version.
     */
    get isRelease(): boolean {
        return this._type === VersionType.RELEASE;
    }

    /**
     * Returns `true` if the version is an old alpha version.
     */
    get isOldAlpha(): boolean {
        return this._mcType === MinecraftVersionType.OLD_ALPHA;
    }

    /**
     * Returns `true` if the version is an old beta version.
     */
    get isOldBeta(): boolean {
        return this._mcType === MinecraftVersionType.OLD_BETA;
    }

    /**
     * Returns the version identifier as a string.
     */
    toString(): string {
        return this._id;
    }
}

/**
 * Represents the structure of the Minecraft version manifest.
 */
export interface MinecraftVersionManifest {
    /**
     * Contains information about the latest release and snapshot versions.
     */
    latest: {
        /**
         * The latest release version identifier.
         */
        release: string;

        /**
         * The latest snapshot version identifier.
         */
        snapshot: string;
    };

    /**
     * An array of raw Minecraft version manifest entries.
     */
    versions: RawMinecraftVersionManifestEntry[];
}

/**
 * Represents the raw Minecraft version manifest entry.
 */
interface RawMinecraftVersionManifestEntry {
    /**
     * The version identifier.
     */
    id: string;

    /**
     * The version type.
     */
    type: MinecraftVersionType;

    /**
     * The URL for the version's metadata.
     */
    url: string;

    /**
     * The time the version was added to the manifest.
     */
    time: string;

    /**
     * The release time of the version.
     */
    releaseTime: string;

    /**
     * The SHA1 hash of the version and therefore the JSON file ID.
     */
    sha1: string;

    /**
     * If `0`, the launcher warns the user about this version not being recent enough to support the latest player safety features.
     *
     * Its value is `1` otherwise.
     */
    complianceLevel: number;
}

/**
 * Represents the processed Minecraft version manifest entry.
 */
export interface MinecraftVersionManifestEntry extends RawMinecraftVersionManifestEntry {
    /**
     * The release date of the version.
     */
    releaseDate: Date;
}

/**
 * Returns an array of Minecraft version manifest entries.
 *
 * @param manifest - The Minecraft version manifest.
 *
 * @returns An array of Minecraft version manifest entries.
 */
export function getMinecraftVersionManifestEntries(manifest: MinecraftVersionManifest): MinecraftVersionManifestEntry[] {
    return manifest.versions
        .map(x => ({ ...x, releaseDate: new Date(x.releaseTime) }))
        .sort((a, b) => b.releaseDate.valueOf() - a.releaseDate.valueOf());
}
