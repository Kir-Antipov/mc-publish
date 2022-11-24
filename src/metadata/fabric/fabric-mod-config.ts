import type DependencyKind from "../dependency-kind";

type Environment = "client" | "server" | "*";

type Person = string | { name: string; contact?: string; };

type Dependency = string | string[] | {
    version?: string | string[];
    versions?: string | string[];
    custom?: Record<string, any>;
};

type DependencyContainer = {
    // Dependency resolution
    [Kind in keyof typeof DependencyKind as Lowercase<Kind>]?: Record<string, Dependency>;
};

// https://fabricmc.net/wiki/documentation:fabric_mod_json
type FabricModConfig = {
    // Mandatory fields
    schemaVersion: 1;
    id: string;
    version: string;

    // Mod loading
    provides?: string;
    environment?: Environment;
    entrypoints?: Record<string, string[]>;
    jars?: { file: string }[];
    languageAdapters?: Record<string, string>;
    mixins?: (string | { config: string, environment: Environment })[];

    // Metadata
    name?: string;
    description?: string;
    contact?: {
        email?: string;
        irc?: string;
        homepage?: string;
        issues?: string;
        sources?: string;
        [key: string]: string;
    };
    authors?: Person[];
    contributors?: Person[];
    license?: string | string[];
    icon?: string | Record<string, string>;

    // Custom fields
    custom?: Record<string, any>;
} & DependencyContainer;

namespace FabricModConfig {
    export const FILENAME = "fabric.mod.json";
}

export default FabricModConfig;
