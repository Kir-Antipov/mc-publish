import { FileInfo } from "@/utils/io";
import { GitHubReleaseAsset } from "./github-release-asset";
import { GitHubUser } from "./github-user";

/**
 * Represents a GitHub release.
 */
export interface GitHubRelease {
    /**
     * The ID of the release.
     */
    id: number;

    /**
     * The URL of the release in the GitHub API.
     */
    url: string;

    /**
     * The URL of the release on GitHub's website.
     */
    html_url: string;

    /**
     * The URL of the release's assets in the GitHub API.
     */
    assets_url: string;

    /**
     * The URL of the release's upload endpoint in the GitHub API.
     */
    upload_url: string;

    /**
     * The URL of the tarball of the release's source code.
     */
    tarball_url: string;

    /**
     * The URL of the zipball of the release's source code.
     */
    zipball_url: string;

    /**
     * The release's tag name.
     */
    tag_name: string;

    /**
     * The release's target commitish value.
     */
    target_commitish: string;

    /**
     * The release's name.
     */
    name: string;

    /**
     * A boolean indicating whether the release is a draft.
     */
    draft: boolean;

    /**
     * A boolean indicating whether the release is a pre-release.
     */
    prerelease: boolean;

    /**
     * The release's creation date (ISO 8601 format).
     */
    created_at: string;

    /**
     * The release's publication date (ISO 8601 format).
     */
    published_at: string;

    /**
     * The author of the release.
     */
    author: GitHubUser;

    /**
     * The node ID of the release in the GitHub API.
     */
    node_id: string;

    /**
     * An array of release assets.
     */
    assets: GitHubReleaseAsset[];

    /**
     * The release's description.
     */
    body: string;
}

/**
 * Used to identify a GitHub release.
 */
export interface GitHubReleaseIdentifier {
    /**
     * The account owner of the repository.
     *
     * The name is not case sensitive.
     */
    owner: string;

    /**
     * The name of the repository.
     *
     * The name is not case sensitive.
     */
    repo: string;

    /**
     * The unique identifier of the release.
     *
     * This property is required unless `tag_name` is specified.
     *
     * Provide either `id` or `tag_name`, but not both.
     */
    id?: number;

    /**
     * The name of the tag.
     *
     * This property is required unless `id` is specified.
     *
     * Provide either `id` or `tag_name`, but not both.
     */
    tag_name?: string;
}

/**
 * Interface for creating a GitHub release via the API.
 */
interface GitHubReleaseInitInternal {
    /**
     * The name of the tag.
     */
    tag_name: string;

    /**
     * Specifies the commitish value that determines where the Git tag is created from.
     *
     * Can be any branch or commit SHA. Unused if the Git tag already exists.
     *
     * Default: the repository's default branch (e.g., `"master"`).
     */
    target_commitish?: string;

    /**
     * The name of the release.
     */
    name?: string;

    /**
     * Text describing the contents of the tag.
     */
    body?: string;

    /**
     * `true` to create a draft (unpublished) release, `false` to create a published one.
     *
     * Default: `false`.
     */
    draft?: boolean;

    /**
     * `true` to identify the release as a prerelease, `false` to identify the release as a full release.
     *
     * Default: `false`.
     */
    prerelease?: boolean;

    /**
     * If specified, a discussion of the specified category is created and linked to the release.
     *
     * The value must be a category **that already exists** in the repository.
     */
    discussion_category_name?: string;

    /**
     * Whether to automatically generate the name and body for this release.
     *
     * - If name is specified, the specified name will be used; otherwise, a name will be automatically generated.
     * - If body is specified, the body will be pre-pended to the automatically generated notes.
     *
     * Default: `false`.
     */
    generate_release_notes?: boolean;

    /**
     * Specifies whether this release should be set as the latest release for the repository.
     *
     * Drafts and pre-releases cannot be set as latest.
     *
     * Defaults to `"true"` for newly published releases.
     *
     * "legacy" specifies that the latest release should be determined based on the release creation date
     * and higher semantic version.
     *
     * Default: `"true"`.
     */
    make_latest?: "true" | "false" | "legacy";
}

/**
 * Interface for creating a GitHub release via the API.
 */
export interface GitHubReleaseInit extends GitHubReleaseInitInternal {
    /**
     * The account owner of the repository.
     *
     * The name is not case sensitive.
     */
    owner: string;

    /**
     * The name of the repository.
     *
     * The name is not case sensitive.
     */
    repo: string;

    /**
     * A list of assets that should be attached to the release.
     */
    assets?: (FileInfo | string)[];
}

/**
 * Interface for updating a GitHub release via the API.
 */
interface GitHubReleasePatchInternal {
    /**
     * The name of the tag.
     */
    tag_name?: string;

    /**
     * Specifies the commitish value that determines where the Git tag is created from.
     *
     * Can be any branch or commit SHA. Unused if the Git tag already exists.
     *
     * Default: the repository's default branch (e.g., `"master"`).
     */
    target_commitish?: string;

    /**
     * The name of the release.
     */
    name?: string;

    /**
     * Text describing the contents of the tag.
     */
    body?: string;

    /**
     * `true` makes the release a draft, and `false` publishes the release.
     */
    draft?: boolean;

    /**
     * `true` to identify the release as a pre-release, `false` to identify the release as a full release.
     */
    prerelease?: boolean;

    /**
     * Specifies whether this release should be set as the latest release for the repository.
     *
     * Drafts and pre-releases cannot be set as latest.
     *
     * Defaults to `"true"` for newly published releases.
     *
     * "legacy" specifies that the latest release should be determined based on the release creation date
     * and higher semantic version.
     *
     * Default: `"true"`.
     */
    make_latest?: "true" | "false" | "legacy";

    /**
     * If specified, a discussion of the specified category is created and linked to the release.
     *
     * The value must be a category **that already exists** in the repository.
     *
     * If there is already a discussion linked to the release, this parameter is ignored.
     */
    discussion_category_name?: string;
}

/**
 * Interface for updating a GitHub release via the API.
 */
export interface GitHubReleasePatch extends GitHubReleasePatchInternal {
    /**
     * The account owner of the repository.
     *
     * The name is not case sensitive.
     */
    owner: string;

    /**
     * The name of the repository.
     *
     * The name is not case sensitive.
     */
    repo: string;

    /**
     * The unique identifier of the release.
     */
    id: number;

    /**
     * A list of assets that should be attached to the release.
     */
    assets?: (FileInfo | string)[];
}

/**
 * Interface for updating GitHub release's assets via the API.
 */
export interface GitHubReleaseAssetsPatch {
    /**
     * The account owner of the repository.
     *
     * The name is not case sensitive.
     */
    owner: string;

    /**
     * The name of the repository.
     *
     * The name is not case sensitive.
     */
    repo: string;

    /**
     * The unique identifier of the release.
     */
    id: number;

    /**
     * A list of assets that should be attached to the release.
     */
    assets: (FileInfo | string)[];
}

/**
 * Packs a {@link GitHubReleaseInit} object into a {@link GitHubReleaseInitInternal} object
 * by omitting the owner, repo, and assets properties.
 *
 * @param release - The {@link GitHubReleaseInit} object to be packed.
 *
 * @returns The packed {@link GitHubReleaseInitInternal} object.
 */
export function packGitHubReleaseInit(release: GitHubReleaseInit): GitHubReleaseInitInternal {
    return { ...{ ...release, owner: undefined, repo: undefined, assets: undefined } };
}

/**
 * Packs a {@link GitHubReleasePatch} object into a {@link GitHubReleasePatchInternal} object
 * by omitting the owner, repo, id, and assets properties.
 *
 * @param release - The {@link GitHubReleasePatch} object to be packed.
 *
 * @returns The packed {@link GitHubReleasePatchInternal} object.
 */
export function packGitHubReleasePatch(release: GitHubReleasePatch): GitHubReleasePatchInternal {
    return { ...{ ...release, owner: undefined, repo: undefined, id: undefined, assets: undefined } };
}
