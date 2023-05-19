import { JavaVersion } from "@/utils/java";

/**
 * Represents a union of entities CurseForge treats as "game versions".
 */
export interface CurseForgeGameVersionUnion {
    /**
     * An array of supported game versions for this project version.
     */
    game_versions?: string[];

    /**
     * An array of supported java versions for this project version.
     */
    java_versions?: (string | JavaVersion)[];

    /**
     * The mod loaders that this version supports.
     */
    loaders?: string[];
}
