import { FileInfo } from "@/utils/io";
import { JavaVersion } from "@/utils/java";
import { VersionType } from "@/utils/versioning";
import { CurseForgeDependency } from "./curseforge-dependency";
import { CurseForgeFile } from "./curseforge-file";

/**
 * Represents a CurseForge project version.
 */
export interface CurseForgeVersion {
    /**
     * The id of this version.
     */
    id: number;

    /**
     * The id of the project this version is for.
     */
    project_id: number;

    /**
     * The display name of the version.
     */
    name: string;

    /**
     * An array of files associated with this version.
     */
    files: CurseForgeFile[];
}

/**
 * Options needed to create a new CurseForge version.
 */
export interface CurseForgeVersionInit {
    /**
     * The name of this version.
     */
    name?: string;

    /**
     * The id of the project this version is for.
     */
    project_id: number;

    /**
     * The release channel for this version.
     *
     * Defaults to `"release"`.
     */
    version_type?: VersionType;

    /**
     * A string describing the changes in the uploaded file.
     *
     * Can be HTML or plain text if `changelogType` is set.
     */
    changelog?: string;

    /**
     * The format of the changelog.
     *
     * Defaults to "markdown" if not provided.
     */
    changelog_type?: "text" | "html" | "markdown";

    /**
     * An array of supported game versions for this project version.
     */
    game_versions?: string[];

    /**
     * An array of supported java versions for this project version.
     */
    java_versions?: (string | JavaVersion)[];

    /**
     * The mod loaders that this version supports.
     */
    loaders?: string[];

    /**
     * A list of specific versions of projects that this version depends on.
     */
    dependencies?: CurseForgeDependency[];

    /**
     * A list of files that should be attached to the version.
     */
    files?: (FileInfo | string)[];
}

/**
 * Options needed to create a new CurseForge version.
 */
export interface CurseForgeVersionInitMetadata {
    /**
     * A string describing the changes in the uploaded file.
     *
     * Can be HTML or markdown if `changelogType` is set.
     */
    changelog: string;

    /**
     * The format of the changelog.
     *
     * Defaults to "text" if not provided.
     */
    changelogType?: "text" | "html" | "markdown";

    /**
     * A friendly display name used on the site if provided.
     */
    displayName?: string;

    /**
     * The parent file of this file, if any.
     */
    parentFileID?: number;

    /**
     * A list of supported game versions. See the Game Versions API for details.
     *
     * @remarks
     *
     * Not supported if `parentFileID` is provided.
     */
    gameVersions: number[];

    /**
     * The type of the version (e.g., release, beta, alpha).
     */
    releaseType: VersionType;

    /**
     * Contains information about dependencies of this project.
     *
     * @remarks
     *
     * Not supported if `parentFileID` is provided, or `projects` array has no elements in it.
     */
    relations?: {
        /**
         * An array of project relations by slug and type of dependency for inclusion in your project.
         */
        projects: CurseForgeDependency[];
    };
}

/**
 * Represents the form data needed to initialize a CurseForge version.
 */
export interface CurseForgeVersionInitForm {
    /**
     * The file to be uploaded as part of the CurseForge version.
     */
    file: FileInfo;

    /**
     * The metadata describing the CurseForge version.
     */
    metadata: CurseForgeVersionInitMetadata;
}

/**
 * Packs the CurseForge version initialization data, game version IDs, and file information into a form data object.
 *
 * @param version - The CurseForge version initialization data.
 * @param gameVersions - The supported game version IDs.
 * @param file - The file path or `FileInfo` object for the file to be uploaded.
 * @param parentFileId - The optional ID of the parent file for this version.
 *
 * @returns A form data object containing the packed information.
 */
export function packCurseForgeVersionInit(version: CurseForgeVersionInit, gameVersions: number[], file: string | FileInfo, parentFileId?: number): CurseForgeVersionInitForm {
    file = FileInfo.of(file);

    const hasParentFile = typeof parentFileId === "number";
    const metadata: CurseForgeVersionInitMetadata = {
        changelog: version.changelog || "",
        changelogType: version.changelog_type || "markdown",
        displayName: (hasParentFile || !version.name) ? file.name : version.name,
        parentFileID: parentFileId,
        gameVersions: hasParentFile ? undefined : (gameVersions || []),
        releaseType: version.version_type || VersionType.RELEASE,
        relations: (hasParentFile || !version.dependencies?.length) ? undefined : { projects: version.dependencies },
    };

    return { file, metadata };
}
