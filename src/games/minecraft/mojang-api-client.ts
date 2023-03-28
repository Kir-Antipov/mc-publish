import { Fetch, createFetch, throwOnError } from "@/utils/net";
import { VersionRange, parseVersion } from "@/utils/versioning";
import { $i } from "@/utils/collections";
import { MinecraftVersion, MinecraftVersionManifest, getMinecraftVersionManifestEntries } from "./minecraft-version";
import { getMinecraftVersionRegExp, normalizeMinecraftVersion, normalizeMinecraftVersionRange } from "./minecraft-version-lookup";

/**
 * The default base URL for the Mojang API.
 */
export const MOJANG_API_URL = "https://piston-meta.mojang.com/mc";

/**
 * Describes the configuration options for the Mojang API client.
 */
export interface MojangApiOptions {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    fetch?: Fetch;

    /**
     * The base URL for the Mojang API.
     *
     * Defaults to {@link MOJANG_API_URL}.
     */
    baseUrl?: string | URL;
}

/**
 * A client for interacting with the Mojang API.
 */
export class MojangApiClient {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    private readonly _fetch: Fetch;

    /**
     * A cached map of all available Minecraft versions.
     */
    private _versions?: ReadonlyMap<string, MinecraftVersion>;

    /**
     * A cached regular expression for matching Minecraft version strings.
     */
    private _versionRegExp?: RegExp;

    /**
     * Creates a new {@link MojangApiClient} instance.
     *
     * @param options - The configuration options for the client.
     */
    constructor(options?: MojangApiOptions) {
        this._fetch = createFetch({
            handler: options?.fetch,
            baseUrl: options?.baseUrl || options?.fetch?.["baseUrl"] || MOJANG_API_URL,
        })
        .use(throwOnError());
    }

    /**
     * Retrieves a specific Minecraft version by its ID.
     *
     * @param id - The ID of the Minecraft version to retrieve.
     *
     * @returns A promise that resolves to the Minecraft version, or `undefined` if not found.
     */
    async getMinecraftVersion(id: string): Promise<MinecraftVersion | undefined> {
        const versions = await this.getAllMinecraftVersions();
        const version = versions.get(id);
        if (version) {
            return version;
        }

        const versionRange = await this.getMinecraftVersions(id);
        return versionRange[0];
    }

    /**
     * Retrieves a list of Minecraft versions that match the specified range.
     *
     * @param range - A version range to match.
     *
     * @returns A promise that resolves to an array of matching Minecraft versions.
     */
    async getMinecraftVersions(range: string | Iterable<string> | VersionRange): Promise<MinecraftVersion[]> {
        const versions = await this.getAllMinecraftVersions();
        const regex = await this.getMinecraftVersionRegExp();
        const normalizedRange = normalizeMinecraftVersionRange(range, versions, regex);

        return $i(versions.values()).filter(x => normalizedRange.includes(x.version)).toArray();
    }

    /**
     * Retrieves all available Minecraft versions.
     *
     * @returns A promise that resolves to a map of Minecraft versions keyed by their IDs.
     */
    private async getAllMinecraftVersions(): Promise<ReadonlyMap<string, MinecraftVersion>> {
        if (this._versions) {
            return this._versions;
        }

        const response = await this._fetch("/game/version_manifest_v2.json");
        const manifest = await response.json<MinecraftVersionManifest>();
        const manifestEntries = getMinecraftVersionManifestEntries(manifest);

        const versions = manifestEntries.map((entry, i, self) => {
            const normalizedVersion = normalizeMinecraftVersion(entry.id, self, i);
            const version = parseVersion(normalizedVersion);
            return new MinecraftVersion(entry.id, version, entry.type, entry.url, entry.releaseDate);
        });

        this._versions = new Map(versions.map(x => [x.id, x]));
        return this._versions;
    }

    /**
     * Retrieves a regular expression for matching Minecraft version strings.
     *
     * @returns A promise that resolves to a `RegExp` for matching Minecraft version strings.
     */
    private async getMinecraftVersionRegExp(): Promise<RegExp> {
        if (this._versionRegExp) {
            return this._versionRegExp;
        }

        const versions = await this.getAllMinecraftVersions();
        this._versionRegExp = getMinecraftVersionRegExp(versions.keys());
        return this._versionRegExp;
    }
}
