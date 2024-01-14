import { VersionType } from "@/utils/versioning";
import { FileInfo } from "@/utils/io";
import { ModrinthDependency } from "./modrinth-dependency";

/**
 * Represents a Modrinth project version.
 */
export interface ModrinthVersion {
    /**
     * The ID of this version.
     */
    id: string;

    /**
     * The display name of the version.
     */
    name: string;

    /**
     * The project ID associated with this version.
     */
    project_id: string;

    /**
     * The author ID associated with this version.
     */
    author_id: string;

    /**
     * The version number of the project.
     */
    version_number: string;

    /**
     * A textual description of the changes introduced in this version.
     */
    changelog: string;

    /**
     * An array of dependencies for this version, including version ID, project ID,
     * file name, and the type of dependency (e.g., required, optional).
     */
    dependencies: ModrinthDependency[];

    /**
     * An array of supported game versions for this project version.
     */
    game_versions: string[];

    /**
     * The type of the version (e.g., release, beta, alpha).
     */
    version_type: VersionType;

    /**
     * An array of supported mod loaders for this project version.
     */
    loaders: string[];

    /**
     * Indicates if this version is featured or not.
     */
    featured: boolean;

    /**
     * The status of the version (e.g., listed, unlisted).
     */
    status: "listed" | "archived" | "draft" | "unlisted" | "scheduled" | "unknown";

    /**
     * The requested status of the version (e.g., listed, unlisted).
     */
    requested_status: "listed" | "archived" | "draft" | "unlisted";

    /**
     * The date when this version was published.
     */
    date_published: string;

    /**
     * The number of downloads for this version.
     */
    downloads: number;

    /**
     * The URL of the changelog, if any.
     */
    changelog_url?: string;

    /**
     * An array of files associated with this version.
     */
    files: {
        /**
         * The file hashes.
         */
        hashes: {
            /**
             * SHA-512 hash of the file.
             */
            sha512: string;

            /**
             * SHA-1 hash of the file.
             */
            sha1: string;
        };

        /**
         * The URL of the file.
         */
        url: string;

        /**
         * The file name.
         */
        filename: string;

        /**
         * Indicates if this file is the primary file for this version.
         */
        primary: boolean;

        /**
         * The size of the file in bytes.
         */
        size: number;

        /**
         * The type of the file (e.g., required-resource-pack).
         */
        file_type: "required-resource-pack" | "optional-resource-pack";
    }[];
}

/**
 * Options needed to create a new Modrinth Version.
 */
export interface ModrinthVersionInit {
    /**
     * The name of this version.
     */
    name: string;

    /**
     * The version number. Ideally will follow semantic versioning.
     */
    version_number: string;

    /**
     * The ID of the project this version is for.
     */
    project_id: string;

    /**
     * The changelog for this version.
     */
    changelog?: string;

    /**
     * A list of specific versions of projects that this version depends on.
     */
    dependencies?: ModrinthDependency[];

    /**
     * A list of versions of Minecraft that this version supports.
     */
    game_versions?: string[];

    /**
     * The release channel for this version.
     *
     * Defaults to `"release"`.
     */
    version_type?: VersionType;

    /**
     * The mod loaders that this version supports.
     */
    loaders?: string[];

    /**
     * Whether the version is featured or not.
     *
     * Defaults to `true`.
     */
    featured?: boolean;

    /**
     * The status of the version.
     */
    status?: "listed" | "archived" | "draft" | "unlisted" | "scheduled" | "unknown";

    /**
     * The requested status of the version.
     */
    requested_status?: "listed" | "archived" | "draft" | "unlisted";

    /**
     * A list of files that should be attached to the version.
     */
    files?: (FileInfo | string)[];
}

/**
 * The data needed to initialize a Modrinth version.
 */
interface ModrinthVersionInitData extends Omit<ModrinthVersionInit, "files"> {
    /**
     * The primary file of the version, if any.
     *
     * If the version has files, this should be "_0".
     */
    primary_file?: "_0";

    /**
     * An array of strings representing the names of each file part.
     *
     * If the version has no files, this should be an empty array.
     */
    file_parts: `_${number}`[];
}

/**
 * The shape of the object that should be passed to the Modrinth API when creating a new version.
 */
type ModrinthVersionInitForm = {
    /**
     * The data needed to initialize the Modrinth version.
     */
    data: ModrinthVersionInitData;
} & {
    /**
     * An array of strings representing the names of each file part.
     */
    [file_part: `_${number}`]: FileInfo;
};

/**
 * Options needed to update a Modrinth Version.
 */
export interface ModrinthVersionPatch {
    /**
     * The ID of this version.
     */
    id: string;

    /**
     * The name of this version.
     */
    name?: string;

    /**
     * The version number. Ideally will follow semantic versioning.
     */
    version_number?: string;

    /**
     * The changelog for this version.
     */
    changelog?: string;

    /**
     * A list of specific versions of projects that this version depends on.
     */
    dependencies?: ModrinthDependency[];

    /**
     * A list of versions of Minecraft that this version supports.
     */
    game_versions?: string[];

    /**
     * The release channel for this version.
     */
    version_type?: VersionType;

    /**
     * The mod loaders that this version supports.
     */
    loaders?: string[];

    /**
     * Whether the version is featured or not.
     */
    featured?: boolean;

    /**
     * The status of this version.
     */
    status?: "listed" | "archived" | "draft" | "unlisted" | "scheduled" | "unknown";

    /**
     * The requested status of this version.
     */
    requested_status?: "listed" | "archived" | "draft" | "unlisted";

    /**
     * The hash format and the hash of the new primary file.
     */
    primary_file?: ["sha1" | "sha512", string];

    /**
     * The types of the files of this version.
     */
    file_types?: {
        /**
         * The hash algorithm of the hash specified in the hash field.
         */
        algorithm: "sha1" | "sha512";

        /**
         * The hash of the file you're editing.
         */
        hash: string;

        /**
         * The file type of the file you're editing, or null if not provided.
         */
        file_type: "required-resource-pack" | "optional-resource-pack" | null;
    };
}

/**
 * Represents a version that may be unfeatured.
 */
export interface UnfeaturableModrinthVersion {
    /**
     * The ID of this version.
     */
    id?: string;

    /**
     * The project ID associated with this version.
     */
    project_id: string;

    /**
     * A list of versions of Minecraft that this version supports.
     */
    game_versions?: string[];

    /**
     * The release channel for this version.
     */
    version_type?: VersionType;

    /**
     * The mod loaders that this version supports.
     */
    loaders?: string[];
}

/**
 * Describes a template for searching Modrinth versions based on the specified criteria.
 */
export interface ModrinthVersionSearchTemplate {
    /**
     * The mod loaders that a version may support.
     *
     * @example ["fabric", "forge"]
     */
    loaders?: string[];

    /**
     * A list of versions of Minecraft that a version may support.
     *
     * @example ["1.16.5", "1.17.1"]
     */
    game_versions?: string[];

    /**
     * Whether a version should be featured or not.
     */
    featured?: boolean;
}

/**
 * Describes a template that should be passed to the Modrinth API
 * for searching Modrinth versions based on the specified criteria.
 */
interface ModrinthVersionSearchTemplateForm {
    /**
     * A JSON array of mod loaders that a version may support.
     *
     * @example '["fabric", "forge"]'
     */
    loaders?: string;

    /**
     * A JSON array of versions of Minecraft that a version may support.
     *
     * @example '["1.16.5", "1.17.1"]'
     */
    game_versions?: string;

    /**
     * Whether a version should be featured or not.
     */
    featured?: boolean;
}

/**
 * Returns the data and file information needed to create a new Modrinth version.
 *
 * @param version - The options for the new version.
 *
 * @returns An object containing the data and file information for the new version.
 */
export function packModrinthVersionInit(version: ModrinthVersionInit): ModrinthVersionInitForm {
    const { files = [] } = version;

    const data: ModrinthVersionInitData = {
        // Unpack the `version`
        ...{ ...version, files: undefined },

        // Default values
        name: version.name || version.version_number || files[0] && FileInfo.of(files[0]).name,
        version_type: version.version_type ?? VersionType.RELEASE,
        featured: version.featured ?? true,
        dependencies: version.dependencies ?? [],
        game_versions: version.game_versions ?? [],
        loaders: version.loaders ?? [],

        // Names of each file part
        primary_file: files.length ? "_0" : undefined,
        file_parts: files.map((_, i) => `_${i}` as const),
    };

    const form = files.reduce((form, file, i) => {
        form[`_${i}`] = FileInfo.of(file);
        return form;
    }, { data } as ModrinthVersionInitForm);

    return form;
}

/**
 * Returns the search template needed to search for a Modrinth version.
 *
 * @param version - The search template.
 *
 * @returns The search template needed to search for a Modrinth version.
 */
export function packModrinthVersionSearchTemplate(template: ModrinthVersionSearchTemplate): ModrinthVersionSearchTemplateForm {
    const loaders = template?.loaders ? JSON.stringify(template.loaders) : undefined;
    const game_versions = template?.game_versions ? JSON.stringify(template.game_versions) : undefined;
    const featured = template?.featured ?? undefined;

    return { loaders, game_versions, featured };
}
