import { FileInfo } from "@/utils/io";
import { CurseForgeVersionInit } from "./curseforge-version";

/**
 * Represents a file uploaded to a project on CurseForge.
 */
export interface CurseForgeFile {
    /**
     * The unique identifier for the file.
     */
    id: number;

    /**
     * The display name of the file.
     */
    name: string;

    /**
     * The URL to download the file.
     */
    url: string;

    /**
     * The unique identifier for the project that the file belongs to.
     */
    project_id: number;

    /**
     * The unique identifier for the version that the file belongs to.
     */
    version_id: number;
}

/**
 * Represents the information required to initialize a CurseForge version file.
 */
export interface CurseForgeFileInit {
    /**
     * The CurseForge version initialization data.
     */
    version: CurseForgeVersionInit;

    /**
     * The file path or `FileInfo` object for the file to be uploaded.
     */
    file: string | FileInfo;

    /**
     * A 2D array containing variants of supported game version IDs.
     */
    game_versions: number[][];

    /**
     * The parent CurseForge version, if any.
     *
     * If this field is not specified, the file will be treated as a standalone version.
     */
    version_id?: number;
}
