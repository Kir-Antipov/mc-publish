/**
 * Represents a game version type.
 */
export interface CurseForgeGameVersionType {
    /**
     * The unique identifier of the game version type.
     */
    id: number;

    /**
     * The name of the game version type.
     */
    name: string;

    /**
     * The slug (URL-friendly name) of the game version type.
     */
    slug: string;
}

/**
 * A hard-coded Bukkit game version type.
 *
 * @remarks
 *
 * This is needed because, for some inexplicable reason, CurseForge API
 * doesn't include Bukkit in its API response. And then they throw errors
 * when we don't use it ourselves. Amazing. Just absolutely amazing.
 *
 * So, here we are, patching things up ourselves. *sigh*
 */
export const BUKKIT_GAME_VERSION_TYPE: CurseForgeGameVersionType = {
    id: 1,
    name: "Bukkit",
    slug: "bukkit",
};
