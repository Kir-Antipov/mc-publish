import { CurseForgeGameVersion } from "./curseforge-game-version";
import { CurseForgeGameVersionType } from "./curseforge-game-version-type";

/**
 * Represents a map of game version categories.
 */
export interface CurseForgeGameVersionMap {
    /**
     * An array of game versions for Minecraft.
     */
    game_versions: CurseForgeGameVersion[];

    /**
     * An array of game versions for *mostly* Bukkit plugins.
     */
    game_versions_for_plugins: CurseForgeGameVersion[];

    /**
     * An array of game versions for addons.
     */
    game_versions_for_addons: CurseForgeGameVersion[];

    /**
     * An array of game versions for Java.
     */
    java_versions: CurseForgeGameVersion[];

    /**
     * An array of game versions for mod loaders.
     */
    loaders: CurseForgeGameVersion[];

    /**
     * An array of game versions for different environments.
     */
    environments: CurseForgeGameVersion[];
}

/**
 * Creates a CurseForge game version map by categorizing game versions based on their type names.
 *
 * @param versions - The array of all CurseForge game versions.
 * @param types - The array of all CurseForge game version types.
 *
 * @returns A game version map with categorized game versions.
 */
export function createCurseForgeGameVersionMap(versions: CurseForgeGameVersion[], types: CurseForgeGameVersionType[]): CurseForgeGameVersionMap {
    return {
        game_versions: filterGameVersionsByTypeName(versions, types, "minecraft"),
        game_versions_for_plugins: filterGameVersionsByTypeName(versions, types, "bukkit"),
        game_versions_for_addons: filterGameVersionsByTypeName(versions, types, "addon"),
        loaders: filterGameVersionsByTypeName(versions, types, "modloader"),
        java_versions: filterGameVersionsByTypeName(versions, types, "java"),
        environments: filterGameVersionsByTypeName(versions, types, "environment"),
    };
}

/**
 * Filters game versions by matching their type names.
 *
 * @param versions - The array of all CurseForge game versions.
 * @param types - The array of all CurseForge game version types.
 * @param typeName - The type name to filter by.
 *
 * @returns An array of game versions with matching type names.
 */
function filterGameVersionsByTypeName(versions: CurseForgeGameVersion[], types: CurseForgeGameVersionType[], typeName: string): CurseForgeGameVersion[] {
    const filteredTypes = types.filter(x => x.slug.startsWith(typeName));
    return versions.filter(v => filteredTypes.some(t => t.id === v.gameVersionTypeID));
}
