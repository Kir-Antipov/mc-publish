/**
 * Represents a Modrinth project.
 */
export interface ModrinthProject {
    /**
     * The unique identifier of the project.
     */
    id: string;

    /**
     * A URL-friendly string that represents the project.
     */
    slug: string;

    /**
     * The title of the project.
     */
    title: string;

    /**
     * A short description of the project.
     */
    description: string;

    /**
     * An array of categories the project belongs to.
     */
    categories: string[];

    /**
     * Indicates if the client-side is required or optional.
     */
    client_side: "required" | "optional" | "unsupported";

    /**
     * Indicates if the server-side is required or optional.
     */
    server_side: "required" | "optional" | "unsupported";

    /**
     * A detailed description of the project.
     */
    body: string;

    /**
     * An array of additional categories the project belongs to.
     */
    additional_categories: string[];

    /**
     * A URL pointing to the project's issue tracker.
     */
    issues_url: string;

    /**
     * A URL pointing to the project's source code repository.
     */
    source_url: string;

    /**
     * A URL pointing to the project's wiki.
     */
    wiki_url: string;

    /**
     * A URL pointing to the project's Discord server.
     */
    discord_url: string;

    /**
     * An array of donation URLs for the project.
     */
    donation_urls: {
        /**
         * The unique identifier of the donation platform.
         */
        id: string;

        /**
         * The name of the donation platform.
         */
        platform: string;

        /**
         * The URL of the donation page for the project.
         */
        url: string;
    }[];

    /**
     * The type of the project.
     */
    project_type: "mod" | "modpack" | "resourcepack" | "shader";

    /**
     * The number of downloads for the project.
     */
    downloads: number;

    /**
     * A URL pointing to the project's icon.
     */
    icon_url: string;

    /**
     * An integer representing the color of the project.
     */
    color: number;

    /**
     * The unique identifier of the team associated with the project.
     */
    team: string;

    /**
     * A URL pointing to the project's body.
     */
    body_url?: string;

    /**
     * A message from the moderator related to the project.
     */
    moderator_message?: string;

    /**
     * A string representing the date when the project was published.
     */
    published: string;

    /**
     * A string representing the date when the project was last updated.
     */
    updated: string;

    /**
     * A string representing the date when the project was approved.
     */
    approved: string;

    /**
     * The number of followers for the project.
     */
    followers: number;

    /**
     * The current status of the project.
     */
    status: "approved" | "archived" | "rejected" | "draft" | "unlisted" | "processing" | "withheld" | "scheduled" | "private" | "unknown";

    /**
     * An object representing the license of the project.
     */
    license: {
        /**
         * The unique identifier of the license.
         */
        id: string;

        /**
         * The full name of the license.
         */
        name: string;

        /**
         * The URL of the license's official website.
         */
        url: string;
    };

    /**
     * An array of unique identifiers of the project's versions.
     */
    versions: string[];

    /**
     * An array of game versions the project supports.
     */
    game_versions: string[];

    /**
     * An array of loaders supported by the project.
     */
    loaders: string[];

    /**
     * An array of images in the project's gallery.
     */
    gallery: {
        /**
         * The URL of the image.
         */
        url: string;

        /**
         * Indicates if the image is featured.
         */
        featured: boolean;

        /**
         * The title of the image.
         */
        title: string;

        /**
         * A description of the image.
         */
        description: string;

        /**
         * A string representing the date when the image was created.
         */
        created: string;

        /**
         * An integer representing the order of the image in the gallery.
         */
        ordering: number;
    }[];
}

/**
 * Options needed to update a Modrinth Project.
 */
export interface ModrinthProjectPatch {
    /**
     * The unique identifier of the project.
     */
    id: string;

    /**
     * A URL-friendly string that represents the project.
     */
    slug?: string;

    /**
     * The title of the project.
     */
    title?: string;

    /**
     * A short description of the project.
     */
    description?: string;

    /**
     * An array of categories the project belongs to.
     */
    categories?: string[];

    /**
     * Indicates if the client-side is required or optional.
     */
    client_side?: "required" | "optional" | "unsupported";

    /**
     * Indicates if the server-side is required or optional.
     */
    server_side?: "required" | "optional" | "unsupported";

    /**
     * A detailed description of the project.
     */
    body?: string;

    /**
     * An array of additional categories the project belongs to.
     */
    additional_categories?: string[];

    /**
     * A URL pointing to the project's issue tracker.
     */
    issues_url?: string;

    /**
     * A URL pointing to the project's source code repository.
     */
    source_url?: string;

    /**
     * A URL pointing to the project's wiki.
     */
    wiki_url?: string;

    /**
     * A URL pointing to the project's Discord server.
     */
    discord_url?: string;

    /**
     * An array of donation URLs for the project.
     */
    donation_urls?: {
        /**
         * The unique identifier of the donation platform.
         */
        id: string;

        /**
         * The name of the donation platform.
         */
        platform: string;

        /**
         * The URL of the donation page for the project.
         */
        url: string;
    }[];

    /**
     * The current status of the project.
     */
    status?: "approved" | "archived" | "rejected" | "draft" | "unlisted" | "processing" | "withheld" | "scheduled" | "private" | "unknown";

    /**
     * The unique identifier of the license.
     */
    license_id?: string;

    /**
     * The URL of the license's official website.
     */
    license_url?: string;
}
