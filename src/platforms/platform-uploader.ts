import { CurseForgeUploader } from "./curseforge/curseforge-uploader";
import { GenericPlatformUploadRequest, KnownPlatformUploaderOptions } from "./generic-platform-uploader";
import { GitHubUploader } from "./github/github-uploader";
import { ModrinthUploader } from "./modrinth/modrinth-uploader";
import { PlatformType } from "./platform-type";

/**
 * Represents a platform uploader.
 *
 * @template TRequest - The type of content that can be uploaded using the uploader.
 * @template TReport - The type of report that is returned after the upload process.
 */
export interface PlatformUploader<TRequest, TReport> {
    /**
     * Returns the type of platform that the uploader supports.
     */
    get platform(): PlatformType;

    /**
     * Processes the provided upload request.
     *
     * @param request - The upload request to process.
     *
     * @returns A report generated after the upload.
     */
    upload(request: TRequest): Promise<TReport>;
}

/**
 * Creates a new platform uploader based on the provided platform type and options.
 *
 * @param platform - The type of platform for which to create the uploader.
 * @param options - The options to configure the uploader.
 *
 * @returns A new platform uploader.
 */
export function createPlatformUploader(platform: PlatformType, options: KnownPlatformUploaderOptions): PlatformUploader<GenericPlatformUploadRequest, unknown> {
    switch (platform) {
        case PlatformType.MODRINTH:
            return new ModrinthUploader(options);

        case PlatformType.CURSEFORGE:
            return new CurseForgeUploader(options);

        case PlatformType.GITHUB:
            return new GitHubUploader(options);

        default:
            throw new Error(`Unknown platform '${PlatformType.format(platform)}'`);
    }
}
