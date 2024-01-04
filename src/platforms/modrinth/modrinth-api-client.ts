import { Fetch, HttpRequest, HttpResponse, createFetch, defaultResponse, simpleCache, throwOnError } from "@/utils/net";
import { asArray } from "@/utils/collections";
import { ModrinthProject, ModrinthProjectPatch } from "./modrinth-project";
import { ModrinthVersion, ModrinthVersionInit, ModrinthVersionPatch, ModrinthVersionSearchTemplate, UnfeaturableModrinthVersion, packModrinthVersionInit, packModrinthVersionSearchTemplate } from "./modrinth-version";
import { ModrinthUnfeatureMode } from "./modrinth-unfeature-mode";
import { ModrinthLoader } from "./modrinth-loader";
import { ModrinthGameVersion } from "./modrinth-game-version";

/**
 * The API version used for making requests to the Modrinth API.
 */
const MODRINTH_API_VERSION = 2;

/**
 * The base URL for the Modrinth API.
 */
export const MODRINTH_API_URL = `https://api.modrinth.com/v${MODRINTH_API_VERSION}` as const;

/**
 * The base URL for the staging Modrinth API.
 */
export const MODRINTH_STAGING_API_URL = `https://staging-api.modrinth.com/v${MODRINTH_API_VERSION}` as const;

/**
 * Describes the configuration options for the Modrinth API client.
 */
export interface ModrinthApiOptions {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    fetch?: Fetch;

    /**
     * The base URL for the Modrinth API.
     *
     * Defaults to {@link MODRINTH_API_URL}.
     */
    baseUrl?: string | URL;

    /**
     * The API token to be used for authentication with the Modrinth API.
     */
    token?: string;
}

/**
 * A client for interacting with the Modrinth API.
 */
export class ModrinthApiClient {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    private readonly _fetch: Fetch;

    /**
     * Creates a new {@link ModrinthApiClient} instance.
     *
     * @param options - The configuration options for the client.
     */
    constructor(options?: ModrinthApiOptions) {
        this._fetch = createFetch({
            handler: options?.fetch,
            baseUrl: options?.baseUrl || options?.fetch?.["baseUrl"] || MODRINTH_API_URL,
            defaultHeaders: {
                Authorization: options?.token,
            },
        })
        .use(simpleCache())
        .use(defaultResponse({ response: r => HttpResponse.json(null, r) }))
        .use(throwOnError({ filter: x => !x.ok && x.status !== 404 }));
    }

    /**
     * Gets an array of loaders supported by Modrinth.
     *
     * @returns An array of loaders supported by Modrinth.
     */
    async getLoaders(): Promise<ModrinthLoader[]> {
        const response = await this._fetch("/tag/loader?cache=true");
        return (await response.json()) ?? [];
    }

    /**
     * Gets an array of game versions supported by Modrinth.
     *
     * @returns An array of game versions supported by Modrinth.
     */
    async getGameVersions(): Promise<ModrinthGameVersion[]> {
        const response = await this._fetch("/tag/game_version?cache=true");
        return (await response.json()) ?? [];
    }

    /**
     * Fetches a project by its id or slug.
     *
     * @param idOrSlug - The project id or slug.
     *
     * @returns The project, or `undefined` if not found.
     */
    async getProject(idOrSlug: string): Promise<ModrinthProject | undefined> {
        const response = await this._fetch(`/project/${idOrSlug}`);
        return (await response.json()) ?? undefined;
    }

    /**
     * Returns the project id for the given project.
     *
     * @param idOrSlug - The project id or slug.
     *
     * @returns The project id, or `undefined` if not found.
     */
    async getProjectId(idOrSlug: string): Promise<string | undefined> {
        const response = await this._fetch(`/project/${idOrSlug}/check`);
        return (await response.json() as ModrinthProject)?.id ?? undefined;
    }

    /**
     * Fetches multiple projects by their IDs and/or slugs.
     *
     * @param idsOrSlugs - The project IDs and/or slugs.
     *
     * @returns An array of projects.
     */
    async getProjects(idsOrSlugs: Iterable<string>): Promise<ModrinthProject[]> {
        const response = await this._fetch("/projects", HttpRequest.get().with({ ids: JSON.stringify(asArray(idsOrSlugs)) }));
        return (await response.json()) ?? [];
    }

    /**
     * Updates an existing project.
     *
     * @param project - The project data to update.
     *
     * @returns `true` if the update was successful; otherwise, `false`.
     */
    async updateProject(project: ModrinthProjectPatch): Promise<boolean> {
        const response = await this._fetch(`/project/${project.id}`, HttpRequest.patch().json(project));
        return response.ok;
    }

    /**
     * Deletes an existing project.
     *
     * @param version - The id or slug of the project to delete.
     *
     * @returns `true` if the project was successfully deleted; otherwise, `false`.
     */
    async deleteProject(idOrSlug: string): Promise<boolean> {
        const response = await this._fetch(`/project/${idOrSlug}`, HttpRequest.delete());
        return response.ok;
    }

    /**
     * Fetches a version by its id.
     *
     * @param id - The version id.
     *
     * @returns The version, or `undefined` if not found.
     */
    async getVersion(id: string): Promise<ModrinthVersion | undefined> {
        const response = await this._fetch(`/version/${id}`);
        return (await response.json()) ?? undefined;
    }

    /**
     * Fetches multiple versions by their IDs.
     *
     * @param ids - The version IDs.
     *
     * @returns An array of versions.
     */
    async getVersions(ids: Iterable<string>): Promise<ModrinthVersion[]> {
        const response = await this._fetch("/versions", HttpRequest.get().with({ ids: JSON.stringify(asArray(ids)) }));
        return (await response.json()) ?? [];
    }

    /**
     * Creates a new version.
     *
     * @param version - The version data.
     *
     * @returns The created version.
     */
    async createVersion(version: ModrinthVersionInit): Promise<ModrinthVersion> {
        const form = packModrinthVersionInit(version);
        const response = await this._fetch("/version", HttpRequest.post().with(form));
        return await response.json() ?? undefined;
    }

    /**
     * Updates an existing version.
     *
     * @param version - The version data to update.
     *
     * @returns `true` if the update was successful; otherwise, `false`.
     */
    async updateVersion(version: ModrinthVersionPatch): Promise<boolean> {
        const response = await this._fetch(`/version/${version.id}`, HttpRequest.patch().json(version));
        return response.ok;
    }

    /**
     * Deletes an existing version.
     *
     * @param version - The id of the version to delete.
     *
     * @returns `true` if the version was successfully deleted; otherwise, `false`.
     */
    async deleteVersion(id: string): Promise<boolean> {
        const response = await this._fetch(`/version/${id}`, HttpRequest.delete());
        return response.ok;
    }

    /**
     * Fetches the versions of a project based on the provided search template.
     *
     * @param idOrSlug - The project id or slug.
     * @param template - The search template to filter versions.
     *
     * @returns An array of versions matching the search criteria.
     */
    async getProjectVersions(idOrSlug: string, template?: ModrinthVersionSearchTemplate): Promise<ModrinthVersion[]> {
        const params = packModrinthVersionSearchTemplate(template);
        const response = await this._fetch(`/project/${idOrSlug}/version`, HttpRequest.get().with(params));
        return (await response.json()) ?? [];
    }

    /**
     * Unfeatures previous project versions based on the provided mode.
     *
     * @param currentVersion - The current version to use as an anchor point.
     * @param mode - The unfeaturing mode (default: `ModrinthUnfeatureMode.SUBSET`).
     *
     * @returns A record containing version IDs as keys and a boolean indicating whether the unfeaturing operation was successful for each version.
     */
    async unfeaturePreviousProjectVersions(currentVersion: UnfeaturableModrinthVersion, mode?: ModrinthUnfeatureMode): Promise<Record<string, boolean>> {
        mode ??= ModrinthUnfeatureMode.SUBSET;

        const previousVersions = await this.getProjectVersions(currentVersion.project_id, { featured: true });
        const unfeaturedVersions = { } as Record<string, boolean>;

        for (const previousVersion of previousVersions) {
            if (!ModrinthUnfeatureMode.shouldUnfeature(previousVersion, currentVersion, mode)) {
                continue;
            }

            unfeaturedVersions[previousVersion.id] = await this.updateVersion({ id: previousVersion.id, featured: false });
        }

        return unfeaturedVersions;
    }
}
