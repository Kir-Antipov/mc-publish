import { ACTION_NAME } from "@/action";
import { QuiltContactInformation } from "./quilt-contact-information";
import { QuiltDependency } from "./quilt-dependency";
import { QuiltEnvironmentType } from "./quilt-environment-type";
import { QuiltLicense } from "./quilt-license";
import { QuiltPlugin } from "./quilt-plugin";
import { QuiltMetadataCustomPayload } from "./quilt-metadata-custom-payload";

// _ TODO: Remove the deprecated stuff in v4.0.

/**
 * The metadata file for a Quilt mod.
 */
export interface RawQuiltMetadata {
    /**
     * Needed for internal mechanisms.
     *
     * Must always be `1`.
     */
    schema_version: 1;

    /**
     * Information necessary for the mod loading process.
     */
    quilt_loader: {
        /**
         * A unique identifier for the organization behind or developers of the mod.
         *
         * The group string must match the `^[a-zA-Z0-9-_.]+$` regular expression, and must not begin with the reserved namespace `loader.plugin`.
         */
        group: string;

        /**
         * A unique identifier for the mod or library defined by this metadata.
         *
         * The ID string should match the `^[a-z][a-z0-9-_]{1,63}$` regular expression.
         *
         * Best practice is that mod ID's are in `snake_case`.
         */
        id: string;

        /**
         * The mod's version.
         *
         * Must conform to the Semantic Versioning 2.0.0 specification.
         */
        version: string;

        /**
         * Defines main classes of the mod, that will be loaded.
         */
        entrypoints?: Record<string, string | QuiltPlugin | (string | QuiltPlugin)[]>;

        /**
         * Defines loader plugins.
         */
        plugins?: (string | QuiltPlugin)[];

        /**
         * A list of paths to nested JAR files to load, relative to the root directory inside of the mods JAR.
         */
        jars?: string[];

        /**
         * Defines language adapters.
         */
        language_adapters?: Record<string, string>;

        /**
         * Defines other mods/APIs this mod provides.
         */
        provides?: (string | QuiltDependency)[];

        /**
         * Defines mods that this mod will not function without.
         */
        depends?: (string | QuiltDependency)[];

        /**
         * Defines mods that this mod either breaks or is broken by.
         */
        breaks?: (string | QuiltDependency)[];

        /**
         * Influences whether or not a mod candidate should be loaded or not.
         */
        load_type?: "always" | "if_possible" | "if_required";

        /**
         * A list of Maven repository URL strings where dependencies can be looked for in addition to Quilt's central repository.
         */
        repositories?: string[];

        /**
         * The intermediate mappings used for this mod.
         *
         * The intermediate mappings string must be a valid maven coordinate and match the `^[a-zA-Z0-9-_.]+:[a-zA-Z0-9-_.]+$` regular expression.
         *
         * This field currently only officially supports `org.quiltmc:hashed` and `net.fabricmc:intermediary`.
         */
        intermediate_mappings?: string;

        /**
         * Optional metadata that can be used by mods to display information about the mods installed.
         */
        metadata?: {
            /**
             * A human-readable name for this mod.
             */
            name?: string;

            /**
             * A human-readable description of this mod.
             */
            description?: string;

            /**
             * A collection of key/value pairs denoting the persons or organizations that contributed to this project.
             *
             *  - The key should be the name of the person or organization.
             *  - The value can be either a string representing a single role or an array of strings each one representing a single role.
             */
            contributors?: Record<string, string | string[]>;

            /**
             * Denotes various contact information for the people behind this mod.
             */
            contact?: QuiltContactInformation;

            /**
             * The license this project operates under.
             */
            license?: string | QuiltLicense | (string | QuiltLicense)[];

            /**
             * One or more paths to a square .PNG file.
             *
             * If an object is provided, the keys must be the resolution of the corresponding file.
             */
            icon?: string | Record<string, string>;
        };
    };

    /**
     * A single path or array of paths to mixin configuration files relative to the root of the mod JAR.
     */
    mixin?: string | string[];

    /**
     * A single path or array of paths to access widener files relative to the root of the mod JAR.
     */
    access_widener?: string | string[];

    /**
     * Contains flags and options related to Minecraft specifically.
     */
    minecraft?: {
        /**
         * Defines the environment(s) that the mod should be loaded on.
         */
        environment?: QuiltEnvironmentType;
    };

    /**
     * Custom action payload.
     */
    [ACTION_NAME]?: QuiltMetadataCustomPayload;

    /**
     * Custom action payload (legacy).
     *
     * @deprecated
     *
     * Use [{@link ACTION_NAME}] instead.
     */
    projects?: QuiltMetadataCustomPayload;
}

/**
 * Name of the `quilt.mod.json` file, that contains raw Quilt metadata.
 */
export const QUILT_MOD_JSON = "quilt.mod.json";
