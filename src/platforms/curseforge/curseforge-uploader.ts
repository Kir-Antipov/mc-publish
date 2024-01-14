import { CurseForgeUploadRequest as UploadRequest, CurseForgeUploadReport as UploadReport } from "@/action";
import { Dependency } from "@/dependencies";
import { PlatformType } from "@/platforms/platform-type";
import { GenericPlatformUploader, GenericPlatformUploaderOptions } from "@/platforms/generic-platform-uploader";
import { ArgumentError } from "@/utils/errors";
import { stringEquals } from "@/utils/string-utils";
import { CurseForgeDependency } from "./curseforge-dependency";
import { CurseForgeDependencyType } from "./curseforge-dependency-type";
import { CurseForgeEternalApiClient } from "./curseforge-eternal-api-client";
import { CurseForgeProject, isCurseForgeProjectId } from "./curseforge-project";
import { CurseForgeUploadApiClient } from "./curseforge-upload-api-client";
import { CurseForgeVersion } from "./curseforge-version";

/**
 * Configuration options for the uploader, tailored for use with CurseForge.
 */
export type CurseForgeUploaderOptions = GenericPlatformUploaderOptions;

/**
 * Defines the structure for an upload request, adapted for use with CurseForge.
 */
export type CurseForgeUploadRequest = UploadRequest;

/**
 * Specifies the structure of the report generated after a successful upload to CurseForge.
 */
export type CurseForgeUploadReport = UploadReport;

/**
 * Implements the uploader for CurseForge.
 */
export class CurseForgeUploader extends GenericPlatformUploader<CurseForgeUploaderOptions, CurseForgeUploadRequest, CurseForgeUploadReport> {
    /**
     * Constructs a new {@link CurseForgeUploader} instance.
     *
     * @param options - The options to use for the uploader.
     */
    constructor(options?: CurseForgeUploaderOptions) {
        super(options);
    }

    /**
     * @inheritdoc
     */
    get platform(): PlatformType {
        return PlatformType.CURSEFORGE;
    }

    /**
     * @inheritdoc
     */
    protected async uploadCore(request: CurseForgeUploadRequest): Promise<CurseForgeUploadReport> {
        ArgumentError.throwIfNullOrEmpty(request.id, "request.id", "A project ID is required to upload files to CurseForge.");
        ArgumentError.throwIfNullOrEmpty(request.loaders, "request.loaders", "At least one loader should be specified to upload files to CurseForge.");
        ArgumentError.throwIfNullOrEmpty(request.gameVersions, "request.gameVersions", "At least one game version should be specified to upload files to CurseForge.");

        const api = new CurseForgeUploadApiClient({ token: request.token.unwrap(), fetch: this._fetch });
        const eternalApi = new CurseForgeEternalApiClient({ fetch: this._fetch });

        const project = await this.getProject(request.id, eternalApi);
        const version = await this.createVersion(request, project.id, api, eternalApi);

        return {
            id: project.id,
            version: version.id,
            url: `${project.links.websiteUrl}/files/${version.id}`,
            files: version.files.map(x => ({ id: x.id, name: x.name, url: x.url })),
        };
    }

    /**
     * Fetches the project details from CurseForge.
     *
     * @param idOrSlug - The identifier or slug of the project.
     * @param eternalApi - The API client instance to use for the request.
     *
     * @returns A promise resolved with the fetched project details.
     */
    private async getProject(idOrSlug: number | string, eternalApi: CurseForgeEternalApiClient): Promise<CurseForgeProject> {
        const project = await eternalApi.getProject(idOrSlug).catch(() => undefined as CurseForgeProject);
        if (project) {
            return project;
        }

        if (!isCurseForgeProjectId(idOrSlug)) {
            throw new Error(`Cannot access CurseForge project "${idOrSlug}" by its slug. Please specify the ID instead.`);
        }

        // If the project was not found, it could imply two situations:
        //   1) The project is not publicly visible.
        //   2) CurseForge is notorious for its frequent downtime. There's a significant probability that
        //      we attempted to access their API during one of those periods.
        //
        // Regardless, if the user provided us with a project ID, that's all we need
        // to attempt publishing their assets. Although the upload report may be imprecise
        // with this placeholder data, it's still preferable to not uploading anything at all.
        this._logger.debug(`CurseForge project "${idOrSlug}" is inaccessible.`);
        return {
            id: +idOrSlug,
            slug: String(idOrSlug),
            links: { websiteUrl: `https://www.curseforge.com/minecraft/mc-mods/${idOrSlug}` },
        } as CurseForgeProject;
    }


    /**
     * Creates a new version of the project on CurseForge.
     *
     * @param request - The upload request containing information about the new version.
     * @param projectId - The identifier of the project.
     * @param api - The API client instance to use for the upload request.
     * @param eternalApi - The API client instance to use for retrieving data.
     *
     * @returns The details of the newly created version.
     */
    private async createVersion(request: CurseForgeUploadRequest, projectId: number, api: CurseForgeUploadApiClient, eternalApi: CurseForgeEternalApiClient): Promise<CurseForgeVersion> {
        const dependencies = await this.convertToCurseForgeDependencies(request.dependencies, eternalApi);

        return await api.createVersion({
            name: request.name,
            project_id: projectId,
            version_type: request.versionType,
            changelog: request.changelog,
            game_versions: request.gameVersions,
            java_versions: request.java,
            loaders: request.loaders,
            files: request.files,
            dependencies,
        });
    }

    /**
     * Converts the dependencies to CurseForge-specific format.
     *
     * @param dependencies - The list of dependencies to convert.
     * @param eternalApi - The API client instance to use for retrieving data.
     *
     * @returns An array of converted dependencies.
     */
    private async convertToCurseForgeDependencies(dependencies: Dependency[], eternalApi: CurseForgeEternalApiClient): Promise<CurseForgeDependency[]> {
        const simpleDependencies = this.convertToSimpleDependencies(dependencies, CurseForgeDependencyType.fromDependencyType);
        const curseForgeDependencies = await Promise.all(simpleDependencies.map(async ([id, type]) => ({
            slug: isCurseForgeProjectId(id)
                ? await eternalApi.getProject(id).catch(() => undefined as CurseForgeProject).then(x => x?.slug)
                : id,

            type,
        })));
        const uniqueCurseForgeDependencies = curseForgeDependencies
            .filter(x => x.slug && x.type)
            .filter((x, i, self) => i === self.findIndex(y => stringEquals(x.slug, y.slug, { ignoreCase: true })));

        return uniqueCurseForgeDependencies;
    }
}
