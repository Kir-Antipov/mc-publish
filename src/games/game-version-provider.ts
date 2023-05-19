import { Awaitable } from "@/utils/types";
import { GameVersion } from "./game-version";
import { MINECRAFT, MINECRAFT_VERSION_PROVIDER } from "./minecraft";

/**
 * Represents a provider for game version.
 */
export interface GameVersionProvider {
    /**
     * Returns an array of game versions that satisfy the given version range.
     *
     * @param versions - A version range.
     *
     * @returns An array of game versions that satisfy the given version range.
     */
    (versions: string[]): Awaitable<GameVersion[]>;
}

/**
 * A map of game version providers keyed by game name.
 */
const GAME_VERSION_PROVIDERS: ReadonlyMap<string, GameVersionProvider> = new Map([
    [MINECRAFT, MINECRAFT_VERSION_PROVIDER],
]);

/**
 * Returns the game version provider for the given game name.
 *
 * @param name - The name of the game.
 *
 * @returns The {@link GameVersionProvider} for the given game name, or `undefined` if it does not exist.
 */
export function getGameVersionProviderByName(name: string): GameVersionProvider | undefined {
    return GAME_VERSION_PROVIDERS.get(name);
}
