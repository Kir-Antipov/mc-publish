import { GameVersion } from "@/games";
import { $i } from "@/utils/collections";
import { EqualityComparer, IGNORE_CASE_EQUALITY_COMPARER } from "@/utils/comparison";

/**
 * Represents a game version.
 */
export interface CurseForgeGameVersion {
    /**
     * The unique identifier of the game version.
     */
    id: number;

    /**
     * The game version type identifier.
     */
    gameVersionTypeID: number;

    /**
     * The name of the game version.
     */
    name: string;

    /**
     * The slug (URL-friendly name) of the game version.
     */
    slug: string;
}

/**
 * An equality comparer that compares two game version names ignoring the "-Snapshot" suffix.
 */
export const CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER: EqualityComparer<string> = (a, b) => {
    const aVersion = a?.replace("-Snapshot", "");
    const bVersion = b?.replace("-Snapshot", "");

    return aVersion === bVersion;
};

/**
 * An equality comparer that compares two game version names by
 * extracting the version numbers (e.g., "1.0") and checking if they
 * are the same.
 */
export const CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER: EqualityComparer<string> = (a, b) => {
    const aVersion = a?.match(/\d+\.\d+/)?.[0];
    const bVersion = b?.match(/\d+\.\d+/)?.[0];

    return aVersion === bVersion;
};

/**
 * Finds the CurseForge game version IDs that match the provided names using the specified comparers.
 *
 * @param versions - The array of CurseForge game versions.
 * @param names - The array of game version names to find.
 * @param comparer - The primary equality comparer to use for matching names (optional).
 * @param fallbackComparer - The fallback equality comparer to use if the primary comparer fails (optional).
 *
 * @returns An array of matching CurseForge game version IDs.
 */
export function findCurseForgeGameVersionIdsByNames(versions: CurseForgeGameVersion[], names: string[], comparer?: EqualityComparer<string>, fallbackComparer?: EqualityComparer<string>): number[] {
    comparer ||= IGNORE_CASE_EQUALITY_COMPARER;

    return $i(names)
        .map(name => {
            const version = versions.find(v => comparer(v.name, name));
            if (version || !fallbackComparer) {
                return version;
            }

            return versions.find(v => fallbackComparer(v.name, name));
        })
        .filter(x => x)
        .map(x => x.id)
        .distinct()
        .toArray();
}

/**
 * Formats the game version based on its version.
 *
 * @param gameVersion - A game version to format.
 *
 * @returns A formatted string representing the game version.
 */
export function formatCurseForgeGameVersion(gameVersion: GameVersion): string {
    return `${gameVersion.version.major}.${gameVersion.version.minor}${gameVersion.version.patch ? `.${gameVersion.version.patch}` : ""}`;
}

/**
 * Formats the game version based on its version and snapshot status.
 *
 * @param gameVersion - A game version to format.
 *
 * @returns A formatted string representing the game version.
 */
export function formatCurseForgeGameVersionSnapshot(gameVersion: GameVersion): string {
    return `${gameVersion.version.major}.${gameVersion.version.minor}${gameVersion.version.patch ? `.${gameVersion.version.patch}` : ""}${gameVersion.isSnapshot ? "-Snapshot" : ""}`;
}
