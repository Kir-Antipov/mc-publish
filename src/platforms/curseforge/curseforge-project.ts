import { isIntegerString } from "@/utils/string-utils";

/**
 * Represents a CurseForge project.
 */
export interface CurseForgeProject {
    /**
     * The unique identifier for the project.
     */
    id: number;

    /**
     * The ID of the game that the project is associated with.
     */
    gameId: number;

    /**
     * The name of the project.
     */
    name: string;

    /**
     * The slug for the project.
     */
    slug: string;

    /**
     * URLs for various pages related to the project.
     */
    links: {
        /**
         * The URL of the project on CurseForge.
         */
        websiteUrl: string;

        /**
         * The URL of the project's wiki, if it has one.
         */
        wikiUrl?: string;

        /**
         * The URL of the project's issue tracker.
         */
        issuesUrl?: string;

        /**
         * The URL of the project's source code repository.
         */
        sourceUrl?: string;
    };

    /**
     * A brief summary of the project.
     */
    summary: string;

    /**
     * The status of the project.
     */
    status: number;

    /**
     * The number of times the project has been downloaded.
     */
    downloadCount: number;

    /**
     * Whether the project is featured on CurseForge.
     */
    isFeatured: boolean;

    /**
     * The primary category ID for the project.
     */
    primaryCategoryId: number;

    /**
     * The categories that the project belongs to.
     */
    categories: {
        /**
         * The unique identifier for the category.
         */
        id: number;

        /**
         * The ID of the game that the category is associated with.
         */
        gameId: number;

        /**
         * The name of the category.
         */
        name: string;

        /**
         * The slug for the category.
         */
        slug: string;

        /**
         * The URL of the category's page.
         */
        url: string;

        /**
         * The URL of the category's icon.
         */
        iconUrl: string;

        /**
         * The date that the category was last modified.
         */
        dateModified: string;

        /**
         * Whether the category is a class.
         */
        isClass: boolean;

        /**
         * The ID of the class that the category belongs to, if applicable.
         */
        classId: number;

        /**
         * The parent category ID for the category.
         */
        parentCategoryId: number;
    }[];

    /**
     * The ID of the class that the project belongs to, if applicable.
     */
    classId: number;

    /**
     * The authors of the project.
     */
    authors: {
        /**
         * The unique identifier for the author.
         */
        id: number;

        /**
         * The name of the author.
         */
        name: string;

        /**
         * The URL of the author's profile page.
         */
        url: string;
    }[];

    /**
     * Information about the project's logo.
     */
    logo: {
        /**
         * The unique identifier for the logo.
         */
        id: number;

        /**
         * The unique identifier for the project.
         */
        modId: number;

        /**
         * The title of the logo.
         */
        title: string;

        /**
         * The description of the logo.
         */
        description: string;

        /**
         * The URL of the logo's thumbnail.
         */
        thumbnailUrl: string;

        /**
         * The URL of the logo's full-size image.
         */
        url: string;
    };

    /**
     * Screenshots of the project.
     */
    screenshots: unknown[];

    /**
     * The ID of the main file for the project.
     */
    mainFileId: number;

    /**
     * Information about the latest files for the project.
     */
    latestFiles: {
        /**
         * The unique identifier for the file.
         */
        id: number;

        /**
         * The ID of the game that the file is associated with.
         */
        gameId: number;

        /**
         * The unique identifier for the project.
         */
        modId: number;

        /**
         * Whether the file is available for download.
         */
        isAvailable: boolean;

        /**
         * The display name of the file.
         */
        displayName: string;

        /**
         * The name of the file.
         */
        fileName: string;

        /**
         * The type of release for the file.
         */
        releaseType: number;

        /**
         * The status of the file.
         */
        fileStatus: number;

        /**
         * The hashes for the file.
         */
        hashes: {
            /**
             * The value of the hash.
             */
            value: string;

            /**
             * The algorithm used to generate the hash.
             */
            algo: number;
        }[];

        /**
         * The date that the file was uploaded.
         */
        fileDate: string;

        /**
         * The length of the file in bytes.
         */
        fileLength: number;

        /**
         * The number of times the file has been downloaded.
         */
        downloadCount: number;

        /**
         * The URL of the file download.
         */
        downloadUrl: string;

        /**
         * The versions of the game that the file is compatible with.
         */
        gameVersions: string[];

        /**
         * Information about the sortable versions of the game that the file is compatible with.
         */
        sortableGameVersions: {
            /**
             * The name of the game version.
             */
            gameVersionName: string;

            /**
             * The padded version number of the game version.
             */
            gameVersionPadded: string;

            /**
             * The version number of the game version.
             */
            gameVersion: string;

            /**
             * The release date of the game version.
             */
            gameVersionReleaseDate: string;

            /**
             * The ID of the game version type.
             */
            gameVersionTypeId: number;
        }[];

        /**
         * The dependencies for the file.
         */
        dependencies: {
            /**
             * The unique identifier for the mod that the file depends on.
             */
            modId: number;

            /**
             * The type of relationship between the mod and the file.
             */
            relationType: number;
        }[];

        /**
         * The ID of the alternate file for the file, if applicable.
         */
        alternateFileId: number;

        /**
         * Whether the file is a server pack.
         */
        isServerPack: boolean;

        /**
         * The fingerprint of the file.
         */
        fileFingerprint: number;

        /**
         * The modules included in the file.
         */
        modules: {
            /**
             * The name of the module.
             */
            name: string;

            /**
             * The fingerprint of the module.
             */
            fingerprint: number;
        }[];
    }[];

    /**
     * Information about the indexes of the latest files for the project.
     */
    latestFilesIndexes: {
        /**
         * The version of the game that the file is compatible with.
         */
        gameVersion: string;

        /**
         * The unique identifier for the file.
         */
        fileId: number;

        /**
         * The name of the file.
         */
        filename: string;

        /**
         * The type of release for the file.
         */
        releaseType: number;

        /**
         * The ID of the game version type.
         */
        gameVersionTypeId: number;

        /**
         * The ID of the mod loader that the file is compatible with.
         */
        modLoader: number;
    }[];

    /**
     * Information about the indexes of the latest early access files for the project.
     */
    latestEarlyAccessFilesIndexes: unknown[];

    /**
     * The date that the project was created.
     */
    dateCreated: string;

    /**
     * The date that the project was last modified.
     */
    dateModified: string;

    /**
     * The date that the project was released, if applicable.
     */
    dateReleased: string;

    /**
     * Whether the project allows mod distribution.
     */
    allowModDistribution: boolean;

    /**
     * The popularity rank of the project.
     */
    gamePopularityRank: number;

    /**
     * Whether the project is available for download.
     */
    isAvailable: boolean;

    /**
     * The number of thumbs up that the project has received.
     */
    thumbsUpCount: number;
}

/**
 * Determines whether the given value is a valid CurseForge project ID.
 *
 * @param idOrSlug - The value to check.
 *
 * @returns `true` if the value is a valid CurseForge project ID; otherwise, `false`.
 */
export function isCurseForgeProjectId(idOrSlug: number | string): boolean {
    return typeof idOrSlug === "number" || isIntegerString(idOrSlug);
}
