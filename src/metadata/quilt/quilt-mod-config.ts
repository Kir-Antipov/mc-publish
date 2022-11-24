type Plugin = string | { adapter?: string, value: string };

type Entrypoint = Plugin;

type License = string | {
    name: string;
    id: string;
    url: string;
    description?: string;
};

type Dependency = string | {
    id: string;
    version?: string;
    versions?: string | string[];
    reason?: string;
    optional?: boolean;
    unless?: Dependency | Dependency[];
};

// https://github.com/QuiltMC/rfcs/blob/main/specification/0002-quilt.mod.json.md
type QuiltModConfig = {
    schema_version: 1;

    quilt_loader: {
        group: string;
        id: string;
        provides?: Dependency[];
        version: string;
        entrypoints?: Record<string, Entrypoint | Entrypoint[]>;
        plugins?: Plugin[];
        jars?: string[];
        language_adapters?: Record<string, string>;
        depends?: Dependency[];
        breaks?: Dependency[];
        load_type?: "always" | "if_possible" | "if_required";
        repositories?: string[];
        intermediate_mappings?: string;
        metadata?: Record<string, unknown>;
        name?: string;
        description?: string;
        contributors?: Record<string, string>;
        contact?: {
            email?: string;
            homepage?: string;
            issues?: string;
            sources?: string;
            [key: string]: string;
        };
        license?: License | License[];
        icon?: string | Record<string, string>;

    };

    mixin?: string | string[];
    access_widener?: string | string[];
    minecraft?: {
        environment?: "client" | "dedicated_server" | "*";
    };
} & Record<string, any>;

namespace QuiltModConfig {
    export const FILENAME = "quilt.mod.json";
}

export default QuiltModConfig;
