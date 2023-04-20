import { FileInfo } from "@/utils/io";
import { Fetch, HttpRequest, HttpResponse, createFetch, defaultResponse, throwOnError } from "@/utils/net";
import { GitHubRelease, GitHubReleaseAssetsPatch, GitHubReleaseIdentifier, GitHubReleaseInit, GitHubReleasePatch, packGitHubReleaseInit, packGitHubReleasePatch } from "./github-release";
import { GitHubReleaseAsset, GitHubReleaseAssetIdentifier, GitHubReleaseAssetInit } from "./github-release-asset";

/**
 * The base URL for the GitHub API.
 */
export const GITHUB_API_URL = "https://api.github.com";

/**
 * The API version being used by the API client.
 */
export const GITHUB_API_VERSION = "2022-11-28";

/**
 * Describes the configuration options for the GitHub API client.
 */
export interface GitHubApiOptions {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    fetch?: Fetch;

    /**
     * The base URL for the GitHub API.
     *
     * Defaults to {@link GITHUB_API_URL}.
     */
    baseUrl?: string | URL;

    /**
     * The API token to be used for authentication with the GitHub API.
     */
    token?: string;
}

/**
 * A client for interacting with the GitHub API.
 */
export class GitHubApiClient {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    private readonly _fetch: Fetch;

    /**
     * Creates a new {@link GitHubApiClient} instance.
     *
     * @param options - The configuration options for the client.
     */
    constructor(options?: GitHubApiOptions) {
        this._fetch = createFetch({
            handler: options?.fetch,
            baseUrl: options?.baseUrl || options?.fetch?.["baseUrl"] || GITHUB_API_URL,
            defaultHeaders: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": GITHUB_API_VERSION,
                "Authorization": options?.token && `Bearer ${options.token}`,
            },
        })
        .use(defaultResponse({ response: r => HttpResponse.json(null, r) }))
        .use(throwOnError({ filter: x => !x.ok && x.status !== 404 }));
    }

    /**
     * Fetches a GitHub release based on the provided identifier.
     *
     * @param release - The identifier for the release to fetch.
     *
     * @returns The fetched release, or `undefined` if not found.
     */
    async getRelease(release: GitHubReleaseIdentifier): Promise<GitHubRelease | undefined> {
        const { owner, repo, id, tag_name } = release;

        const url = typeof id === "number" ? `/repos/${owner}/${repo}/releases/${id}` : `/repos/${owner}/${repo}/releases/tags/${tag_name}`;
        const response = await this._fetch(url);
        return (await response.json()) ?? undefined;
    }

    /**
     * Creates a new GitHub release with the provided information.
     *
     * @param release - The information for the release to create.
     *
     * @returns The created release.
     */
    async createRelease(release: GitHubReleaseInit): Promise<GitHubRelease> {
        const { owner, repo, assets } = release;

        const data = packGitHubReleaseInit(release);
        const response = await this._fetch(`/repos/${owner}/${repo}/releases`, HttpRequest.post().json(data));
        const createdRelease = await response.json() as GitHubRelease;

        if (assets?.length) {
            return await this.updateRelease({ owner, repo, id: createdRelease.id, assets });
        }
        return createdRelease;
    }

    /**
     * Updates an existing GitHub release with the provided information.
     *
     * @param release - The information for the release to update.
     *
     * @returns The updated release.
     */
    async updateRelease(release: GitHubReleasePatch): Promise<GitHubRelease> {
        const { owner, repo, id, assets } = release;

        if (assets?.length) {
            await this.updateReleaseAssets({ owner, repo, id, assets });
        }

        const data = packGitHubReleasePatch(release);
        const shouldUpdate = Object.values(data).filter(x => x !== undefined).length !== 0;
        if (!shouldUpdate) {
            return await this.getRelease(release);
        }

        const response = await this._fetch(`/repos/${owner}/${repo}/releases/${id}`, HttpRequest.patch().json(data));
        return await response.json();
    }

    /**
     * Updates the assets of an existing GitHub release.
     *
     * @param releaseAssets - The information for the release assets to update.
     *
     * @returns An array of updated release assets.
     */
    async updateReleaseAssets(releaseAssets: GitHubReleaseAssetsPatch): Promise<GitHubReleaseAsset[]> {
        const assets = [] as GitHubReleaseAsset[];
        const release = await this.getRelease(releaseAssets);

        for (const asset of releaseAssets.assets) {
            const file = FileInfo.of(asset);
            const existingAsset = release.assets.find(x => x.name === file.name || x.name === file.path);
            if (existingAsset) {
                await this.deleteReleaseAsset({ owner: releaseAssets.owner, repo: releaseAssets.repo, id: existingAsset.id });
            }

            const uploadedAsset = await this.uploadReleaseAsset({ upload_url: release.upload_url, asset: file });
            assets.push(uploadedAsset);
        }

        return assets;
    }

    /**
     * Uploads a release asset to a GitHub release.
     *
     * @param asset - The information for the release asset to upload.
     *
     * @returns The uploaded release asset.
     */
    private async uploadReleaseAsset(asset: GitHubReleaseAssetInit): Promise<GitHubReleaseAsset> {
        const { upload_url, asset: file } = asset;

        const url = upload_url.includes("{") ? upload_url.substring(0, upload_url.indexOf("{")) : upload_url;
        const fileInfo = FileInfo.of(file);
        const fileName = encodeURIComponent(fileInfo.name);
        const fileContent = fileInfo.stream();

        const response = await this._fetch(`${url}?name=${fileName}`, HttpRequest.post().with(fileContent));
        return await response.json();
    }

    /**
     * Deletes a GitHub release asset.
     *
     * @param asset - The identifier for the release asset to delete.
     *
     * @returns `true` if the asset was deleted successfully, `false` otherwise.
     */
    async deleteReleaseAsset(asset: GitHubReleaseAssetIdentifier): Promise<boolean> {
        const { owner, repo, id } = asset;

        const response = await this._fetch(`/repos/${owner}/${repo}/releases/assets/${id}`, HttpRequest.delete());
        return response.ok;
    }
}
