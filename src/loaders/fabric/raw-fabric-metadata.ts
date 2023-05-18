import { ACTION_NAME } from "@/action";
import { FabricContactInformation } from "./fabric-contact-information";
import { FabricDependencyList } from "./fabric-dependency";
import { FabricDeveloper } from "./fabric-developer";
import { FabricEnvironmentType } from "./fabric-environment-type";
import { FabricMetadataCustomPayload } from "./fabric-metadata-custom-payload";

/**
 * Metadata file used by Fabric Loader to load mods.
 */
export interface RawFabricMetadata {
    /**
     * Needed for internal mechanisms.
     *
     * Must always be `1`.
     */
    schemaVersion: 1;

    /**
     * Defines the mod's identifier - a string of Latin letters, digits, underscores with length from 2 to 64.
     */
    id: string;

    /**
     * Defines the mod's version - a string value, optionally matching the Semantic Versioning 2.0.0 specification.
     */
    version: string;

    /**
     * Defines the list of ids of mod. It can be seen as the aliases of the mod.
     *
     * Fabric Loader will treat these ids as mods that exist. If there are other mods using that id, they will not be loaded.
     */
    provides?: string[];

    /**
     * Defines where mod runs:
     *
     *  - Only on the client side (client mod).
     *  - Only on the server side (plugin).
     *  - Or on both sides (regular mod).
     */
    environment?: FabricEnvironmentType;

    /**
     * Defines main classes of your mod, that will be loaded.
     */
    entrypoints?: {
        /**
         * Will be run first.
         *
         * For classes implementing `ModInitializer`.
         */
        main?: string[];

        /**
         * Will be run second and only on the client side.
         *
         * For classes implementing `ClientModInitializer`.
         */
        client?: string[];

        /**
         * Will be run second and only on the server side.
         *
         * For classes implementing `DedicatedServerModInitializer`.
         */
        server?: string[];

        /**
         * Custom entrypoint.
         */
        [key: string]: string[] | undefined;
    };

    /**
     * A list of nested JARs inside your mod's JAR to load.
     */
    jars?: {
        /**
         * A path to the nested JAR.
         */
        file: string;
    }[];

    /**
     * A dictionary of adapters for used languages to their adapter classes full names.
     */
    languageAdapters?: Record<string, string>;

    /**
     * A list of mixin configuration files.
     */
    mixins?: (string | {
        /**
         * The path to the mixin configuration file inside your mod's JAR.
         */
        config: string;

        /**
         * The same as upper level environment field.
         */
        environment?: FabricEnvironmentType;
    })[];

    /**
     * For dependencies required to run. Without them a game will crash.
     */
    depends?: FabricDependencyList;

    /**
     * For dependencies not required to run. Without them a game will log a warning.
     */
    recommends?: FabricDependencyList;

    /**
     * For dependencies not required to run. Use this as a kind of metadata.
     */
    suggests?: FabricDependencyList;

    /**
     * For mods whose together with yours might cause a game crash. With them a game will crash.
     */
    breaks?: FabricDependencyList;

    /**
     * For mods whose together with yours cause some kind of bugs, etc. With them a game will log a warning.
     */
    conflicts?: FabricDependencyList;

    /**
     * Defines the user-friendly mod's name.
     */
    name?: string;

    /**
     * Defines the mod's description.
     */
    description?: string;

    /**
     * Defines the contact information for the project.
     */
    contact?: FabricContactInformation;

    /**
     * A list of authors of the mod.
     */
    authors?: (string | FabricDeveloper)[];

    /**
     * A list of contributors to the mod.
     */
    contributors?: (string | FabricDeveloper)[];

    /**
     * Defines the licensing information.
     */
    license?: string | string[];

    /**
     * Defines the mod's icon.
     */
    icon?: string | Record<string, string>;

    /**
     * Custom fields. Loader will ignore them.
     */
    custom?: {
        /**
         * Custom action payload.
         */
        [ACTION_NAME]?: FabricMetadataCustomPayload;

        // _ TODO: Remove this field in v4.0.
        /**
         * Custom `ModManager` payload.
         *
         * @deprecated
         *
         * Use {@link ACTION_NAME} field instead.
         */
        modmanager?: FabricMetadataCustomPayload;

        /**
         * Custom key-value pairs.
         */
        [key: string]: unknown;
    };
}

/**
 * Name of the `fabric.mod.json` file, that contains raw Fabric metadata.
 */
export const FABRIC_MOD_JSON = "fabric.mod.json";
