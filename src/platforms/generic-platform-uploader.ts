import { Dependency, DependencyType } from "@/dependencies";
import { retry } from "@/utils/async-utils";
import { ArgumentNullError, isSoftError } from "@/utils/errors";
import { FileInfo } from "@/utils/io";
import { JavaVersion } from "@/utils/java";
import { Logger, LoggingStopwatch, NULL_LOGGER } from "@/utils/logging";
import { SecureString } from "@/utils/security";
import { VersionType } from "@/utils/versioning";
import { Fetch, fetch } from "@/utils/net";
import { CurseForgeUploaderOptions } from "./curseforge/curseforge-uploader";
import { GitHubUploaderOptions } from "./github/github-uploader";
import { ModrinthUploaderOptions } from "./modrinth/modrinth-uploader";
import { PlatformType } from "./platform-type";
import { PlatformUploader } from "./platform-uploader";

/**
 * Options for configuring a generic platform uploader.
 */
export interface GenericPlatformUploaderOptions {
    /**
     * An optional logger that can be used for recording log messages.
     */
    logger?: Logger;

    /**
     * The Fetch implementation used for making HTTP requests.
     */
    fetch?: Fetch;
}

/**
 * Represents all known options for a generic platform uploader.
 */
export type KnownPlatformUploaderOptions =
    & ModrinthUploaderOptions
    & GitHubUploaderOptions
    & CurseForgeUploaderOptions;

/**
 * Represents a request for uploading to a platform.
 */
export interface GenericPlatformUploadRequest {
    /**
     * The unique identifier of the project on the target platform.
     */
    id?: string;

    /**
     * A secure token used for authenticating with the platform's API.
     */
    token?: SecureString;

    /**
     * An array of files to be uploaded to the platform.
     */
    files?: FileInfo[];

    /**
     * The name for the new version of the project to be uploaded.
     */
    name?: string;

    /**
     * The new version identifier for the project.
     */
    version?: string;

    /**
     * The specified type of the version (e.g., 'release', 'beta', 'alpha').
     */
    versionType?: VersionType;

    /**
     * The changelog detailing the updates in the new version.
     */
    changelog?: string;

    /**
     * An array of loaders that the project is compatible with.
     */
    loaders?: string[];

    /**
     * An array of game versions that the project is compatible with.
     */
    gameVersions?: string[];

    /**
     * An array of dependencies required by this version of the project.
     */
    dependencies?: Dependency[];

    /**
     * An array of Java versions that the project supports.
     */
    java?: JavaVersion[];

    /**
     * The maximum number of attempts to publish assets to the platform.
     */
    retryAttempts?: number;

    /**
     * Time delay (in milliseconds) between each attempt to publish assets.
     */
    retryDelay?: number;
}

/**
 * The default number of retry attempts for a failed upload.
 */
const DEFAULT_RETRY_ATTEMPTS = 2;

/**
 * The default delay time (in milliseconds) between retry attempts for a failed upload.
 */
const DEFAULT_RETRY_DELAY = 1000;

/**
 * Base class for platform uploaders.
 *
 * @template TOptions - The type of options that the uploader can utilize.
 * @template TRequest - The type of content that can be uploaded using the uploader.
 * @template TReport - The type of report that is returned after the upload process.
 */
export abstract class GenericPlatformUploader<TOptions extends GenericPlatformUploaderOptions, TRequest extends GenericPlatformUploadRequest, TReport> implements PlatformUploader<TRequest, TReport> {
    /**
     * The logger used by the uploader.
     */
    protected readonly _logger: Logger;

    /**
     * The Fetch implementation used for making HTTP requests.
     */
    protected readonly _fetch: Fetch;

    /**
     * Constructs a new {@link PlatformUploader} instance.
     *
     * @param options - The options to use for the uploader.
     */
    protected constructor(options?: TOptions) {
        this._logger = options?.logger || NULL_LOGGER;
        this._fetch = options?.fetch || fetch;
    }

    /**
     * @inheritdoc
     */
    abstract get platform(): PlatformType;

    /**
     * @inheritdoc
     */
    async upload(request: TRequest): Promise<TReport> {
        ArgumentNullError.throwIfNull(request, "request");
        ArgumentNullError.throwIfNull(request.token, "request.token", `A token is required to upload files to ${PlatformType.friendlyNameOf(this.platform)}.`);
        ArgumentNullError.throwIfNullOrEmpty(request.files, "request.files", "No files to upload were specified. Please include at least one file in the request.");

        const platformName = PlatformType.friendlyNameOf(this.platform);
        const maxAttempts = request.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS;
        const delay = request.retryDelay ?? DEFAULT_RETRY_DELAY;

        const stopwatch = LoggingStopwatch.startNew(this._logger,
            () => `📤 Uploading assets to ${platformName}`,
            ms => `✅ Successfully published assets to ${platformName} in ${ms} ms`
        );
        const onError = (error: Error) => {
            if (isSoftError(error)) {
                this._logger.error(error);
                this._logger.info(`🔂 Facing difficulties, republishing assets to ${platformName} in ${delay} ms`);
                return true;
            }
            return false;
        };

        const report = await retry(
            () => this.uploadCore(request),
            { maxAttempts, delay, onError }
        );

        stopwatch.stop();
        return report;
    }

    /**
     * Processes the specified upload request.
     *
     * @param request - The request to process.
     *
     * @returns A report generated after the upload.
     */
    protected abstract uploadCore(request: TRequest): Promise<TReport>;

    /**
     * Converts the specified dependencies to a simpler format.
     *
     * @param dependencies - The list of dependencies to convert.
     * @param typeConverter - The function to use for converting dependency types.
     *
     * @returns An array of dependencies in a simplified format.
     */
    protected convertToSimpleDependencies<T>(dependencies: Dependency[], typeConverter: (type: DependencyType) => T): [id: string, type: T][] {
        return (dependencies || [])
            .filter(x => x && !x.isIgnored(this.platform))
            .map(x => [x.getProjectId(this.platform), typeConverter(x.type)] as [string, T])
            .filter(([id, type]) => id && type);
    }
}
