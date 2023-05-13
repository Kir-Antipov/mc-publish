import { GitHubUploadReport as UploadReport, GitHubUploadRequest as UploadRequest } from "@/action";
import { GenericPlatformUploader, GenericPlatformUploaderOptions } from "@/platforms/generic-platform-uploader";
import { PlatformType } from "@/platforms/platform-type";
import { ArgumentNullError } from "@/utils/errors";
import { VersionType } from "@/utils/versioning";
import { GitHubApiClient } from "./github-api-client";
import { GitHubContext } from "./github-context";
import { GitHubRelease } from "./github-release";

/**
 * Configuration options for the uploader, tailored for use with GitHub.
 */
export interface GitHubUploaderOptions extends GenericPlatformUploaderOptions {
    /**
     * Provides the context of the current GitHub Actions workflow run.
     */
    githubContext: GitHubContext;
}

/**
 * Defines the structure for an upload request, adapted for use with GitHub.
 */
export type GitHubUploadRequest = UploadRequest;

/**
 * Specifies the structure of the report generated after a successful upload to GitHub.
 */
export type GitHubUploadReport = UploadReport;

/**
 * Implements the uploader for GitHub.
 */
export class GitHubUploader extends GenericPlatformUploader<GitHubUploaderOptions, GitHubUploadRequest, GitHubUploadReport> {
    /**
     * Provides the context of the current GitHub Actions workflow run.
     */
    private readonly _context: GitHubContext;

    /**
     * Constructs a new {@link GitHubUploader} instance.
     *
     * @param options - The options to use for the uploader.
     */
    constructor(options: GitHubUploaderOptions) {
        ArgumentNullError.throwIfNull(options, "options");
        ArgumentNullError.throwIfNull(options.githubContext, "options.githubContext");
        ArgumentNullError.throwIfNull(options.githubContext.repo, "options.githubContext.repo");

        super(options);
        this._context = options.githubContext;
    }

    /**
     * @inheritdoc
     */
    get platform(): PlatformType {
        return PlatformType.GITHUB;
    }

    /**
     * @inheritdoc
     */
    protected async uploadCore(request: GitHubUploadRequest): Promise<GitHubUploadReport> {
        const api = new GitHubApiClient({ token: request.token.unwrap(), baseUrl: this._context.apiUrl });
        const repo = this._context.repo;

        const releaseId = await this.getOrCreateReleaseId(request, api);
        const release = await this.updateRelease(request, releaseId, api);

        return {
            repo: `${repo.owner}/${repo.repo}`,
            tag: release.tag_name,
            url: release.html_url,
            files: release.assets.map(x => ({ id: x.id, name: x.name, url: x.browser_download_url })),
        };
    }

    /**
     * Retrieves the ID of an existing release that matches the request parameters.
     * If no such release exists, it creates a new release and returns its ID.
     *
     * @param request - Contains parameters that define the desired release.
     * @param api - An instance of the GitHub API client for interacting with GitHub services.
     *
     * @returns The ID of the release corresponding to the request parameters.
     */
    private async getOrCreateReleaseId(request: GitHubUploadRequest, api: GitHubApiClient): Promise<number> {
        const repo = this._context.repo;
        const tag = request.tag || this._context.tag || request.version;

        let releaseId = undefined as number;
        if (request.tag) {
            releaseId = await api.getRelease({ ...repo, tag_name: request.tag }).then(x => x?.id);
        } else if (this._context.payload.release?.id) {
            releaseId = this._context.payload.release.id;
        } else if (tag) {
            releaseId = await api.getRelease({ ...repo, tag_name: tag }).then(x => x?.id);
        }

        if (!releaseId && tag) {
            releaseId = (await api.createRelease({
                ...repo,
                tag_name: tag,
                target_commitish: request.commitish,
                name: request.name,
                body: request.changelog,
                draft: request.draft,
                prerelease: request.prerelease ?? request.versionType !== VersionType.RELEASE,
                discussion_category_name: request.discussion,
                generate_release_notes: request.generateChangelog ?? !request.changelog,
            }))?.id;
        }

        if (!releaseId) {
            throw new Error(`Cannot find or create GitHub Release${tag ? ` (${tag})` : ""}.`);
        }
        return releaseId;
    }

    /**
     * Updates the content of an existing GitHub release based on the provided request.
     *
     * @param request - Contains parameters that define the changes to apply to the release.
     * @param releaseId - The ID of the release to be updated.
     * @param api - An instance of the GitHub API client for interacting with GitHub services.
     *
     * @returns The updated release data from GitHub.
     */
    private async updateRelease(request: GitHubUploadRequest, releaseId: number, api: GitHubApiClient): Promise<GitHubRelease> {
        return await api.updateRelease({
            ...this._context.repo,
            id: releaseId,
            body: request.changelog,
            assets: request.files,
        });
    }
}
