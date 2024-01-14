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
        super(options);
        this._context = options?.githubContext;
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
        ArgumentNullError.throwIfNull(this._context?.repo, "context.repo", "The information about the repository is required to upload files to GitHub.");

        const api = new GitHubApiClient({ token: request.token.unwrap(), fetch: this._fetch, baseUrl: this._context.apiUrl });
        const repo = this._context.repo;

        const release = await this.updateOrCreateRelease(request, api);

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
     * @returns The ID of the release and a boolean indicating whether a new release was created.
     */
    private async getOrCreateReleaseId(request: GitHubUploadRequest, api: GitHubApiClient): Promise<[id: number, created: boolean]> {
        const repo = this._context.repo;
        const tag = request.tag || this._context.tag || request.version;

        let id = undefined as number;
        let created = false;

        if (request.tag) {
            id = await api.getRelease({ ...repo, tag_name: request.tag }).then(x => x?.id);
        } else if (this._context.payload.release?.id) {
            id = this._context.payload.release.id;
        } else if (tag) {
            id = await api.getRelease({ ...repo, tag_name: tag }).then(x => x?.id);
        }

        if (!id && tag) {
            id = (await api.createRelease({
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

            created = true;
        }

        if (!id) {
            throw new Error(`Cannot find or create GitHub Release${tag ? ` (${tag})` : ""}.`);
        }

        return [id, created];
    }

    /**
     * Updates or creates a GitHub release based on the provided request.
     *
     * @param request - Contains parameters that define the changes to apply to the release.
     * @param api - An instance of the GitHub API client for interacting with GitHub services.
     *
     * @returns The release data from GitHub.
     */
    private async updateOrCreateRelease(request: GitHubUploadRequest, api: GitHubApiClient): Promise<GitHubRelease> {
        const [id, created] = await this.getOrCreateReleaseId(request, api);
        const body = (!request.changelog || created) ? undefined : request.changelog;
        const assets = request.files;

        return await api.updateRelease({
            ...this._context.repo,
            id,
            body,
            assets,
        });
    }
}
