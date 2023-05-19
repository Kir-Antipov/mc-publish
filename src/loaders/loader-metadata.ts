import { Dependency } from "@/dependencies";
import { PlatformType } from "@/platforms";

/**
 * This interface standardizes the representation of metadata
 * across various mod loaders (e.g. Fabric with "fabric.mod.json", Forge with
 * "mods.toml", etc.).
 *
 * It offers a consistent way to access important mod information.
 */
export interface LoaderMetadata {
    /**
     * A unique identifier associated with the mod.
     */
    get id(): string;

    /**
     * The user-friendly name of the mod.
     */
    get name(): string;

    /**
     * The mod's version.
     */
    get version(): string;

    /**
     * A list of mod loaders that are compatible with this mod.
     */
    get loaders(): string[];

    /**
     * The name of the game that the mod is created for.
     */
    get gameName(): string;

    /**
     * A list of game versions that the mod supports.
     */
    get gameVersions(): string[];

    /**
     * A list of dependencies required by this mod.
     */
    get dependencies(): Dependency[];

    /**
     * Retrieves the associated project ID for a specific platform.
     *
     * @param platform - The platform for which the project ID is needed.
     *
     * @returns The project ID corresponding to the provided platform.
     */
    getProjectId(platform: PlatformType): string;
}
