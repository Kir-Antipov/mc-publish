import { GameVersionProvider } from "@/games";
import { MINECRAFT_VERSION_PROVIDER } from "@/games/minecraft";
import { retry } from "@/utils/async-utils";
import { isHttpError } from "@/utils/errors";
import { JavaVersion } from "@/utils/java";
import { Fetch, HttpRequest, createFetch, simpleCache, throwOnError } from "@/utils/net";
import { CurseForgeError, getInvalidProjectSlug, isCurseForgeError, isInvalidGameVersionIdCurseForgeError, isInvalidProjectSlugCurseForgeError } from "./curseforge-error";
import { CurseForgeFile, CurseForgeFileInit } from "./curseforge-file";
import { CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER, CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER, CurseForgeGameVersion, findCurseForgeGameVersionIdsByNames, formatCurseForgeGameVersion, formatCurseForgeGameVersionSnapshot } from "./curseforge-game-version";
import { CurseForgeGameVersionMap, createCurseForgeGameVersionMap } from "./curseforge-game-version-map";
import { BUKKIT_GAME_VERSION_TYPE, CurseForgeGameVersionType } from "./curseforge-game-version-type";
import { CurseForgeGameVersionUnion } from "./curseforge-game-version-union";
import { CurseForgeVersion, CurseForgeVersionInit, packCurseForgeVersionInit } from "./curseforge-version";

/**
 * The base URL for the CurseForge Upload API.
 */
export const CURSEFORGE_UPLOAD_API_URL = "https://minecraft.curseforge.com/api";

/**
 * Describes the configuration options for the CurseForge Upload API client.
 */
export interface CurseForgeUploadApiOptions {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    fetch?: Fetch;

    /**
     * The base URL for the CurseForge Upload API.
     *
     * Defaults to {@link CURSEFORGE_UPLOAD_API_URL}.
     */
    baseUrl?: string | URL;

    /**
     * The API token to be used for authentication with the CurseForge Upload API.
     */
    token?: string;

    /**
     * The game version provider.
     */
    gameVersionProvider?: GameVersionProvider;
}

/**
 * A client for interacting with the CurseForge Upload API.
 */
export class CurseForgeUploadApiClient {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    private readonly _fetch: Fetch;

    /**
     * The game version provider.
     */
    private readonly _gameVersionProvider: GameVersionProvider;

    /**
     * Creates a new {@link CurseForgeUploadApiClient} instance.
     *
     * @param options - The configuration options for the client.
     */
    constructor(options?: CurseForgeUploadApiOptions) {
        this._fetch = createFetch({
            handler: options?.fetch,
            baseUrl: options?.baseUrl || options?.fetch?.["baseUrl"] || CURSEFORGE_UPLOAD_API_URL,
            defaultHeaders: {
                "X-Api-Token": options?.token,
            },
        })
        .use(simpleCache())
        .use(throwOnError());

        this._gameVersionProvider = options?.gameVersionProvider || MINECRAFT_VERSION_PROVIDER;
    }

    /**
     * Fetches a list of game version types.
     *
     * @returns An array of game version types.
     */
    async getGameVersionTypes(): Promise<CurseForgeGameVersionType[]> {
        const response = await this._fetch("/game/version-types?cache=true");
        const gameVersionTypes = await response.json() as CurseForgeGameVersionType[];

        // Thank you CurseForge for not including Bukkit version type
        // in your API responses and then throwing errors when I don't use it myself!
        if (!gameVersionTypes.some(x => x.id === BUKKIT_GAME_VERSION_TYPE.id)) {
            gameVersionTypes.unshift(BUKKIT_GAME_VERSION_TYPE);
        }

        return gameVersionTypes;
    }

    /**
     * Fetches a list of game versions.
     *
     * @returns An array of game versions.
     */
    async getGameVersions(): Promise<CurseForgeGameVersion[]> {
        const response = await this._fetch("/game/versions?cache=true");
        return await response.json();
    }


    /**
     * Retrieves a map of game version categories.
     *
     * @returns A map of game version categories.
     */
    async getGameVersionMap(): Promise<CurseForgeGameVersionMap> {
        const versions = await this.getGameVersions();
        const types = await this.getGameVersionTypes();
        return createCurseForgeGameVersionMap(versions, types);
    }

    /**
     * Creates a new version.
     *
     * @param version - The version data.
     *
     * @returns The created version.
     */
    async createVersion(version: CurseForgeVersionInit): Promise<CurseForgeVersion> {
        const gameVersionIdVariants = await this.getGameVersionIdVariants(version);
        let createdVersion = undefined as CurseForgeVersion;

        for (const file of version.files || []) {
            const fileData: CurseForgeFileInit = {
                version,
                file,
                game_versions: gameVersionIdVariants,
                version_id: createdVersion?.id,
            };

            const uploadedFile = await retry(
                () => this.uploadFile(fileData),
                { onError: error => tryHandleUploadError(error, fileData) }
            );

            if (!createdVersion) {
                createdVersion = {
                    id: uploadedFile.id,
                    project_id: uploadedFile.project_id,
                    name: uploadedFile.name,
                    files: [],
                };
            }
            createdVersion.files.push(uploadedFile);
        }

        return createdVersion;
    }

    /**
     * Uploads a new file to CurseForge.
     *
     * @param file - The file data to upload.
     *
     * @returns The uploaded file data.
     */
    private async uploadFile(file: CurseForgeFileInit): Promise<CurseForgeFile> {
        const projectId = file.version.project_id;
        const form = packCurseForgeVersionInit(file.version, file.game_versions[0], file.file, file.version_id);

        const response = await this._fetch(`/projects/${projectId}/upload-file`, HttpRequest.post().with(form));
        const id = (await response.json() as CurseForgeFile).id;
        return {
            id,
            name: form.metadata.displayName || form.file.name,
            url: `https://www.curseforge.com/api/v1/mods/${projectId}/files/${id}/download`,
            project_id: projectId,
            version_id: file.version_id || id,
        };
    }

    /**
     * Retrieves an array of game version ID variants, based on the provided game version union.
     *
     * @param gameVersionUnion - The game version union to use for finding ID variants.
     *
     * @returns An array of suitable game version IDs.
     */
    private async getGameVersionIdVariants(gameVersionUnion: CurseForgeGameVersionUnion): Promise<number[][]> {
        const loaders = gameVersionUnion.loaders || [];
        const javaVersions = gameVersionUnion.java_versions || [];
        const gameVersions = gameVersionUnion.game_versions?.length ? await this._gameVersionProvider(gameVersionUnion.game_versions) : [];

        const map = await this.getGameVersionMap();

        const javaVersionNames = javaVersions.map(x => JavaVersion.of(x).name);
        const gameVersionNames = gameVersions.map(x => formatCurseForgeGameVersionSnapshot(x));
        const pluginGameVersionNames = gameVersions.map(x => formatCurseForgeGameVersion(x));

        // gameVersions for mods
        const gameVersionIds = findCurseForgeGameVersionIdsByNames(map.game_versions, gameVersionNames, undefined, CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER);
        const loaderIds = findCurseForgeGameVersionIdsByNames(map.loaders, loaders);
        const javaIds = findCurseForgeGameVersionIdsByNames(map.java_versions, javaVersionNames);

        // gameVersions for plugins
        const pluginGameVersionIds = findCurseForgeGameVersionIdsByNames(map.game_versions_for_plugins, pluginGameVersionNames, undefined, CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER);

        // gameVersions for addons
        const addonGameVersionIds = findCurseForgeGameVersionIdsByNames(map.game_versions_for_addons, pluginGameVersionNames, undefined, CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER);

        const idVariants = [
            // These ids are used by: `Mods`.
            //
            // This is the most common project type out there, so we try these ids first.
            loaderIds.length ? gameVersionIds.concat(loaderIds, javaIds) : gameVersionIds,

            // These ids are used by: `Bukkit Plugins`.
            //
            // While there's only one category that uses this type of ids,
            // it's safe to say that users of `mc-publish` are most likely
            // to publish plugins with it, rather than addons.
            pluginGameVersionIds,

            // These ids are used by: `Modpacks`, `Customization`,
            // `Resource Packs`, and `Worlds`.
            //
            // The same ids as for `Mods`, but without loaders, because
            // those are not supported for any other project type.
            loaderIds.length ? gameVersionIds : [],

            // These ids are used by: `Addons`.
            addonGameVersionIds,
        ];

        // If mod loaders were found, we most likely deal with a mod, leave everything as is.
        // Otherwise, we most likely deal with a plugin, so it's a good idea to swap these variants.
        if (!loaderIds.length) {
            [idVariants[0], idVariants[1]] = [idVariants[1], idVariants[0]];
        }

        // There's no need in empty variants, unless there are no other options.
        const nonEmptyIdVariants = idVariants.filter(x => x.length);
        return nonEmptyIdVariants.length ? nonEmptyIdVariants : [[]];
    }
}

/**
 * Attempts to handle upload errors that may occur when creating a version file.
 *
 * @param error - The error to handle.
 * @param file - The file data associated with the error.
 *
 * @returns A boolean indicating if the error was handled.
 */
async function tryHandleUploadError(error: Error, file: CurseForgeFileInit): Promise<boolean> {
    if (!isHttpError(error)) {
        return false;
    }

    const errorObject = await error.response.json().catch(() => undefined);
    if (!isCurseForgeError(errorObject)) {
        return false;
    }

    if (isInvalidProjectSlugCurseForgeError(errorObject)) {
        return handleInvalidProjectSlugCurseForgeError(file, errorObject);
    }

    if (isInvalidGameVersionIdCurseForgeError(errorObject)) {
        return handleInvalidGameVersionIdCurseForgeError(file);
    }

    return false;
}

/**
 * Handles errors related to an invalid project slug in the CurseForge version file.
 *
 * @param file - The file data associated with the error.
 * @param error - The `CurseForgeError` containing the invalid project slug error.
 *
 * @returns A boolean indicating if the error was handled.
 */
function handleInvalidProjectSlugCurseForgeError(file: CurseForgeFileInit, error: CurseForgeError): boolean {
    const invalidSlug = getInvalidProjectSlug(error) || "";
    const oldDependencies = file.version.dependencies;

    file.version = { ...file.version };
    file.version.dependencies = file.version.dependencies?.filter(x => x.slug !== invalidSlug);

    return oldDependencies?.length !== file.version.dependencies?.length;
}

/**
 * Handles errors related to an invalid game version ID in the CurseForge version file.
 *
 * @param file - The file data associated with the error.
 *
 * @returns A boolean indicating if the error was handled.
 */
function handleInvalidGameVersionIdCurseForgeError(file: CurseForgeFileInit): boolean {
    file.version = { ...file.version };
    file.game_versions = [...(file.game_versions || [])];
    file.game_versions.shift();
    return true;
}
