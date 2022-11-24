// https://forge.gemwire.uk/wiki/Mods.toml
type ForgeModConfig = {
    // Non-Mod-Specific Properties
    modLoader: string;
    loaderVersion: string;
    license: string;
    showAsResourcePack?: boolean;
    properties?: Record<string, unknown>;
    issueTrackerURL?: string;

    // Mod Properties
    mods: {
        modId: string;
        namespace?: string;
        version?: string;
        displayName?: string;
        description?: string;
        logoFile?: string;
        logoBlur?: boolean;
        updateJSONURL?: string;
        modproperties?: Record<string, unknown>;
        credits?: string;
        authors?: string;
        displayURL?: string;
        displayTest?: "MATCH_VERSION" | "IGNORE_SERVER_VERSION" | "IGNORE_ALL_VERSION" | "NONE";
    }[];

    // Dependency Configurations
    dependencies?: Record<string, ({
        modId: string;
        mandatory: boolean;
        incompatible?: boolean;
        embedded?: boolean;
        versionRange?: string;
        ordering?: "BEFORE" | "AFTER" | "NONE";
        side?: "CLIENT" | "SERVER" | "BOTH";
    } & Record<string, any>)[]>;
} & Record<string, any>;

namespace ForgeModConfig {
    export const FILENAME = "META-INF/mods.toml";
}

export default ForgeModConfig;
