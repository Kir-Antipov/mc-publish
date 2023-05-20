import { ModrinthUploadReport as UploadReport, ModrinthUploadRequest as UploadRequest } from "@/action";
import { Dependency } from "@/dependencies";
import { GenericPlatformUploader, GenericPlatformUploaderOptions } from "@/platforms/generic-platform-uploader";
import { PlatformType } from "@/platforms/platform-type";
import { $i } from "@/utils/collections";
import { IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER } from "@/utils/comparison";
import { ModrinthApiClient } from "./modrinth-api-client";
import { ModrinthDependency } from "./modrinth-dependency";
import { ModrinthDependencyType } from "./modrinth-dependency-type";
import { ModrinthProject } from "./modrinth-project";
import { ModrinthUnfeatureMode } from "./modrinth-unfeature-mode";
import { ModrinthVersion } from "./modrinth-version";

/**
 * Configuration options for the uploader, tailored for use with Modrinth.
 */
export type ModrinthUploaderOptions = GenericPlatformUploaderOptions;

/**
 * Defines the structure for an upload request, adapted for use with Modrinth.
 */
export type ModrinthUploadRequest = UploadRequest;

/**
 * Specifies the structure of the report generated after a successful upload to Modrinth.
 */
export type ModrinthUploadReport = UploadReport;

/**
 * Implements the uploader for Modrinth.
 */
export class ModrinthUploader extends GenericPlatformUploader<ModrinthUploaderOptions, ModrinthUploadRequest, ModrinthUploadReport> {
    /**
     * Constructs a new {@link ModrinthUploader} instance.
     *
     * @param options - The options to use for the uploader.
     */
    constructor(options?: ModrinthUploaderOptions) {
        super(options);
    }

    /**
     * @inheritdoc
     */
    get platform(): PlatformType {
        return PlatformType.MODRINTH;
    }

    /**
     * @inheritdoc
     */
    protected async uploadCore(request: ModrinthUploadRequest): Promise<ModrinthUploadReport> {
        const api = new ModrinthApiClient({ token: request.token.unwrap() });
        const unfeatureMode = request.unfeatureMode ?? (request.featured ? ModrinthUnfeatureMode.SUBSET : ModrinthUnfeatureMode.NONE);

        const project = await this.getProject(request.id, api);
        const version = await this.createVersion(request, project, api);
        await this.unfeaturePreviousVersions(version, unfeatureMode, api);

        return {
            id: project.id,
            version: version.id,
            url: `https://modrinth.com/${project.project_type}/${project.slug}/version/${version.name}`,
            files: version.files.map(x => ({ id: x.hashes.sha1, name: x.filename, url: x.url })),
        };
    }

    /**
     * Fetches the project details from Modrinth.
     *
     * @param idOrSlug - The identifier or slug of the project.
     * @param api - The API client instance to use for the request.
     *
     * @returns The fetched project details.
     */
    private async getProject(idOrSlug: string, api: ModrinthApiClient): Promise<ModrinthProject> {
        const project = await api.getProject(idOrSlug);
        if (!project) {
            throw new Error(`Modrinth project "${idOrSlug}" was not found.`);
        }

        return project;
    }

    /**
     * Creates a new version of the project on Modrinth.
     *
     * @param request - The upload request containing information about the new version.
     * @param project - The project for which the new version is created.
     * @param api - The API client instance to use for the upload request.
     *
     * @returns The details of the newly created version.
     */
    private async createVersion(request: ModrinthUploadRequest, project: ModrinthProject, api: ModrinthApiClient): Promise<ModrinthVersion> {
        const gameVersions = await this.convertToModrinthGameVersionNames(request.gameVersions, api);
        const loaders = await this.convertToModrinthLoaderNames(request.loaders, project, api);
        const dependencies = await this.convertToModrinthDependencies(request.dependencies, api);

        return await api.createVersion({
            name: request.name,
            version_number: request.version,
            project_id: project.id,
            changelog: request.changelog,
            dependencies,
            game_versions: gameVersions,
            version_type: request.versionType,
            loaders,
            featured: request.featured,
            files: request.files,
        });
    }

    /**
     * Converts the dependencies to Modrinth-specific format.
     *
     * @param dependencies - The list of dependencies to convert.
     * @param api - The API client instance to use for retrieving data.
     *
     * @returns An array of converted dependencies.
     */
    private async convertToModrinthDependencies(dependencies: Dependency[], api: ModrinthApiClient): Promise<ModrinthDependency[]> {
        const simpleDependencies = this.convertToSimpleDependencies(dependencies, ModrinthDependencyType.fromDependencyType);
        const modrinthDependencies = await Promise.all(simpleDependencies.map(async ([id, type]) => ({
            project_id: await api.getProjectId(id).catch(() => undefined as string),
            dependency_type: type,
        })));
        return modrinthDependencies.filter(x => x.project_id && x.dependency_type);
    }

    /**
     * Converts loader names to Modrinth-specific format.
     *
     * @param loaders - The list of loaders to convert.
     * @param project - The project for which the loaders are used.
     * @param api - The API client instance to use for retrieving data.
     *
     * @returns An array of converted loader names.
     */
    private async convertToModrinthLoaderNames(loaders: string[], project: ModrinthProject, api: ModrinthApiClient): Promise<string[]> {
        if (!loaders?.length) {
            return [];
        }

        const modrinthLoaders = await api.getLoaders();
        return $i(loaders)
            .map(x => modrinthLoaders.find(y => IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER(x, y.name)))
            .filter(x => x.supported_project_types?.includes(project.project_type))
            .map(x => x.name)
            .toArray();
    }

    /**
     * Converts game version names to Modrinth-specific format.
     *
     * @param gameVersions - The list of game versions to convert.
     * @param api - The API client instance to use for retrieving data.
     *
     * @returns An array of converted game version names.
     */
    private async convertToModrinthGameVersionNames(gameVersions: string[], api: ModrinthApiClient): Promise<string[]> {
        if (!gameVersions?.length) {
            return [];
        }

        const modrinthGameVersions = await api.getGameVersions();
        return $i(gameVersions)
            .map(x => modrinthGameVersions.find(y => IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER(x, y.version))?.version)
            .filter(x => x)
            .toArray();
    }

    /**
     * Unfeatures previous versions of the project on Modrinth.
     *
     * @param version - The new version after which the previous ones should be unfeatured.
     * @param unfeatureMode - The mode to determine which versions should be unfeatured.
     * @param api - The API client instance to use for the unfeaturing request.
     */
    private async unfeaturePreviousVersions(version: ModrinthVersion, unfeatureMode: ModrinthUnfeatureMode, api: ModrinthApiClient): Promise<void> {
        if (unfeatureMode === ModrinthUnfeatureMode.NONE) {
            return;
        }

        this._logger.info("🔽 Initiating unfeaturing of older Modrinth project versions");
        const result = await api.unfeaturePreviousProjectVersions(version, unfeatureMode);
        const unfeaturedVersions = Object.entries(result).filter(([, success]) => success).map(([version]) => version);
        const nonUnfeaturedVersions = Object.entries(result).filter(([, success]) => !success).map(([version]) => version);
        if (unfeaturedVersions.length) {
            this._logger.info(`🟢 Successfully unfeatured ${unfeaturedVersions.join(", ")}`);
        }
        if (nonUnfeaturedVersions.length) {
            this._logger.info(`⚠️ Failed to unfeature ${nonUnfeaturedVersions.join(", ")}. Please, double-check your token`);
        }
    }
}
