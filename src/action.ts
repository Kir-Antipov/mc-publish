/* ************************************************************************ */
/*               WARNING: AUTO-GENERATED FILE - DO NOT EDIT!                */
/*                                                                          */
/* Please be advised that this is an auto-generated file and should NOT be  */
/*       modified. Any changes made to this file WILL BE OVERWRITTEN.       */
/*                                                                          */
/*     To make changes to the contents of this file, please modify the      */
/* action.template.yml file instead. This will ensure that your changes are */
/*              properly reflected in the auto-generated file.              */
/* ************************************************************************ */
/* eslint-disable */
import { ModrinthUnfeatureMode } from "@/platforms/modrinth/modrinth-unfeature-mode";
import { SecureString } from "@/utils/security/secure-string";
import { FileInfo } from "@/utils/io/file-info";
import { VersionType } from "@/utils/versioning/version-type";
import { Dependency } from "@/dependencies/dependency";
import { GameVersionFilter } from "@/games/game-version-filter";
import { JavaVersion } from "@/utils/java/java-version";
import { FailMode } from "@/utils/errors/fail-mode";
import { UploadedFile } from "@/platforms/uploaded-file";

/**
 * Your one-stop GitHub Action for seamless Minecraft project publication across various platforms.
 */
export const ACTION_NAME = "mc-publish";

/**
 * The input parameters for the action.
 */
export interface McPublishInput {
    /**
     * Options used to publish Minecraft projects to Modrinth.
     */
    modrinth?: {
        /**
         * The unique identifier of your Modrinth project.
         */
        id?: string;

        /**
         * Set to true to feature the version on Modrinth; false otherwise.
         */
        featured?: boolean;

        /**
         * Sets the behavior for unfeaturing older Modrinth versions.
         */
        unfeatureMode?: ModrinthUnfeatureMode;

        /**
         * Your Modrinth API token.
         */
        token?: SecureString;

        /**
         * An array of globs determining which files to upload.
         */
        files?: FileInfo[];

        /**
         * The name of the version.
         */
        name?: string;

        /**
         * The version number.
         */
        version?: string;

        /**
         * The version type - alpha, beta, or release.
         */
        versionType?: VersionType;

        /**
         * The changelog for this version.
         */
        changelog?: string;

        /**
         * An array of supported mod loaders.
         */
        loaders?: string[];

        /**
         * An array of supported Minecraft versions.
         */
        gameVersions?: string[];

        /**
         * An array of dependencies required by your project.
         */
        dependencies?: Dependency[];

        /**
         * Controls the method used to filter game versions.
         */
        gameVersionFilter?: GameVersionFilter;

        /**
         * An array of Java versions compatible with your project.
         */
        java?: JavaVersion[];

        /**
         * Defines the maximum number of asset publishing attempts.
         */
        retryAttempts?: number;

        /**
         * Specifies the delay (in milliseconds) between asset publishing attempts.
         */
        retryDelay?: number;

        /**
         * Controls how the action responds to errors during the mod publishing process.
         */
        failMode?: FailMode;
    };

    /**
     * Options used to publish Minecraft projects to CurseForge.
     */
    curseforge?: {
        /**
         * The unique identifier of your CurseForge project.
         */
        id?: string;

        /**
         * Your CurseForge API token.
         */
        token?: SecureString;

        /**
         * An array of globs determining which files to upload.
         */
        files?: FileInfo[];

        /**
         * The name of the version.
         */
        name?: string;

        /**
         * The version number.
         */
        version?: string;

        /**
         * The version type - alpha, beta, or release.
         */
        versionType?: VersionType;

        /**
         * The changelog for this version.
         */
        changelog?: string;

        /**
         * An array of supported mod loaders.
         */
        loaders?: string[];

        /**
         * An array of supported Minecraft versions.
         */
        gameVersions?: string[];

        /**
         * An array of dependencies required by your project.
         */
        dependencies?: Dependency[];

        /**
         * Controls the method used to filter game versions.
         */
        gameVersionFilter?: GameVersionFilter;

        /**
         * An array of Java versions compatible with your project.
         */
        java?: JavaVersion[];

        /**
         * Defines the maximum number of asset publishing attempts.
         */
        retryAttempts?: number;

        /**
         * Specifies the delay (in milliseconds) between asset publishing attempts.
         */
        retryDelay?: number;

        /**
         * Controls how the action responds to errors during the mod publishing process.
         */
        failMode?: FailMode;
    };

    /**
     * Options used to publish Minecraft projects to GitHub.
     */
    github?: {
        /**
         * The tag name for the release where assets will be uploaded.
         */
        tag?: string;

        /**
         * Set to true to generate a changelog automatically for this release; false otherwise. Ignored if the GitHub Release already exists.
         */
        generateChangelog?: boolean;

        /**
         * Set to true to create a draft release; false otherwise. Ignored if the GitHub Release already exists.
         */
        draft?: boolean;

        /**
         * Set to true to mark the release as a prerelease; false otherwise. Ignored if the GitHub Release already exists.
         */
        prerelease?: boolean;

        /**
         * Defines the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Ignored if the Git tag already exists.
         */
        commitish?: string;

        /**
         * If specified, creates and links a discussion of the specified **existing** category to the release. Ignored if the GitHub Release already exists.
         */
        discussion?: string;

        /**
         * Your GitHub API token.
         */
        token?: SecureString;

        /**
         * An array of globs determining which files to upload.
         */
        files?: FileInfo[];

        /**
         * The name of the version.
         */
        name?: string;

        /**
         * The version number.
         */
        version?: string;

        /**
         * The version type - alpha, beta, or release.
         */
        versionType?: VersionType;

        /**
         * The changelog for this version.
         */
        changelog?: string;

        /**
         * An array of supported mod loaders.
         */
        loaders?: string[];

        /**
         * An array of supported Minecraft versions.
         */
        gameVersions?: string[];

        /**
         * An array of dependencies required by your project.
         */
        dependencies?: Dependency[];

        /**
         * Controls the method used to filter game versions.
         */
        gameVersionFilter?: GameVersionFilter;

        /**
         * An array of Java versions compatible with your project.
         */
        java?: JavaVersion[];

        /**
         * Defines the maximum number of asset publishing attempts.
         */
        retryAttempts?: number;

        /**
         * Specifies the delay (in milliseconds) between asset publishing attempts.
         */
        retryDelay?: number;

        /**
         * Controls how the action responds to errors during the mod publishing process.
         */
        failMode?: FailMode;
    };

    /**
     * An array of globs determining which files to upload.
     */
    files?: FileInfo[];

    /**
     * The name of the version.
     */
    name?: string;

    /**
     * The version number.
     */
    version?: string;

    /**
     * The version type - alpha, beta, or release.
     */
    versionType?: VersionType;

    /**
     * The changelog for this version.
     */
    changelog?: string;

    /**
     * An array of supported mod loaders.
     */
    loaders?: string[];

    /**
     * An array of supported Minecraft versions.
     */
    gameVersions?: string[];

    /**
     * An array of dependencies required by your project.
     */
    dependencies?: Dependency[];

    /**
     * Controls the method used to filter game versions.
     */
    gameVersionFilter?: GameVersionFilter;

    /**
     * An array of Java versions compatible with your project.
     */
    java?: JavaVersion[];

    /**
     * Defines the maximum number of asset publishing attempts.
     */
    retryAttempts?: number;

    /**
     * Specifies the delay (in milliseconds) between asset publishing attempts.
     */
    retryDelay?: number;

    /**
     * Controls how the action responds to errors during the mod publishing process.
     */
    failMode?: FailMode;
};

/**
 * Options used to publish Minecraft projects to Modrinth.
 */
export type ModrinthUploadRequest = McPublishInput["modrinth"];

/**
 * Options used to publish Minecraft projects to CurseForge.
 */
export type CurseForgeUploadRequest = McPublishInput["curseforge"];

/**
 * Options used to publish Minecraft projects to GitHub.
 */
export type GitHubUploadRequest = McPublishInput["github"];

/**
 * The output parameters provided by the action.
 */
export interface McPublishOutput {
    /**
     * Report detailing the status of the project published on Modrinth.
     */
    modrinth: {
        /**
         * The unique identifier of your Modrinth project.
         */
        id: string;

        /**
         * The unique identifier of the version published on Modrinth by this action.
         */
        version: string;

        /**
         * The URL directing to the newly published version on Modrinth.
         */
        url: string;

        /**
         * Array of objects, each containing details about the files published for the new version on Modrinth, such as file `name`, `id`, and download `url`.
         */
        files: UploadedFile[];
    };

    /**
     * Report detailing the status of the project published on CurseForge.
     */
    curseforge: {
        /**
         * The unique identifier of your CurseForge project.
         */
        id: number;

        /**
         * The unique identifier of the version published on CurseForge by this action.
         */
        version: number;

        /**
         * The URL directing to the newly published version on CurseForge.
         */
        url: string;

        /**
         * Array of objects, each containing details about the files published for the new version on CurseForge, such as file `name`, `id`, and download `url`.
         */
        files: UploadedFile[];
    };

    /**
     * Report detailing the status of the project published on GitHub.
     */
    github: {
        /**
         * The full repository name on GitHub, formatted as 'username/repository'.
         */
        repo: string;

        /**
         * The Git tag associated with the new or updated release published on GitHub.
         */
        tag: string;

        /**
         * The URL directing to the newly published version on GitHub.
         */
        url: string;

        /**
         * Array of objects, each containing details about the files published for the new version on GitHub, such as file `name`, `id`, and download `url`.
         */
        files: UploadedFile[];
    };
};

/**
 * Report detailing the status of the project published on Modrinth.
 */
export type ModrinthUploadReport = McPublishOutput["modrinth"];

/**
 * Report detailing the status of the project published on CurseForge.
 */
export type CurseForgeUploadReport = McPublishOutput["curseforge"];

/**
 * Report detailing the status of the project published on GitHub.
 */
export type GitHubUploadReport = McPublishOutput["github"];
