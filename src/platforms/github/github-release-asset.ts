import { FileInfo } from "@/utils/io";
import { GitHubUser } from "./github-user";

/**
 * GitHub asset definition.
 */
export interface GitHubReleaseAsset {
    /**
     * The URL of the asset in the GitHub API.
     */
    url: string;

    /**
     * The ID of the asset.
     */
    id: number;

    /**
     * The node ID of the asset in the GitHub API.
     */
    node_id: string;

    /**
     * The name of the asset.
     */
    name: string;

    /**
     * The label of the asset.
     */
    label: string;

    /**
     * The uploader of the asset.
     */
    uploader: GitHubUser;

    /**
     * The content type of the asset.
     */
    content_type: string;

    /**
     * The state of the asset (e.g., 'uploaded').
     */
    state: string;

    /**
     * The size of the asset in bytes.
     */
    size: number;

    /**
     * The number of times the asset has been downloaded.
     */
    download_count: number;

    /**
     * The date the asset was created (ISO 8601 format).
     */
    created_at: string;

    /**
     * The date the asset was last updated (ISO 8601 format).
     */
    updated_at: string;

    /**
     * The URL of the asset for downloading through a web browser.
     */
    browser_download_url: string;
}

/**
 * Used to identify a GitHub asset.
 */
export interface GitHubReleaseAssetIdentifier {
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
     * The unique identifier of the asset.
     */
    id: number;
}

/**
 * Represents the initialization properties for a GitHub release asset.
 */
export interface GitHubReleaseAssetInit {
    /**
     * The URL of the release's upload endpoint in the GitHub API.
     */
    upload_url: string;

    /**
     * The file information for the asset to be added to the release.
     */
    asset: string | FileInfo;
}
