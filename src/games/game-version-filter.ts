import { Enum, EnumOptions } from "@/utils/enum";
import { stringEquals } from "@/utils/string-utils";
import { deprecate } from "node:util";
import { GameVersion } from "./game-version";

// _ TODO: Remove deprecated stuff in v4.0

/**
 * Represents a game version filter.
 *
 * This filter can be used to filter game versions based on the provided criteria.
 *
 * @partial
 */
enum GameVersionFilterValues {
    /**
     * No filter applied.
     */
    NONE = 0,

    /**
     * Filter to include release versions.
     */
    RELEASES = 1,

    /**
     * Filter to include beta versions.
     */
    BETAS = 2,

    /**
     * Filter to include alpha versions.
     */
    ALPHAS = 4,

    /**
     * Filter to include both alpha and beta versions (snapshots).
     */
    SNAPSHOTS = ALPHAS | BETAS,

    /**
     * Filter to include any version type.
     */
    ANY = RELEASES | SNAPSHOTS,

    /**
     * Filter to include versions with the minimum patch number.
     */
    MIN_PATCH = 8,

    /**
     * Filter to include versions with the maximum patch number.
     */
    MAX_PATCH = 16,

    /**
     * Filter to include versions with the minimum minor number.
     */
    MIN_MINOR = 32,

    /**
     * Filter to include versions with the maximum minor number.
     */
    MAX_MINOR = 64,

    /**
     * Filter to include versions with the minimum major number.
     */
    MIN_MAJOR = 128,

    /**
     * Filter to include versions with the maximum major number.
     */
    MAX_MAJOR = 256,

    /**
     * Filter to include the last version in a range, considering major, minor, and patch numbers.
     */
    MIN = MIN_MAJOR | MIN_MINOR | MIN_PATCH,

    /**
     * Filter to include the first version in a range, considering major, minor, and patch numbers.
     */
    MAX = MAX_MAJOR | MAX_MINOR | MAX_PATCH,
}

/**
 * Options for configuring the behavior of the `GameVersionFilter` enum.
 *
 * @partial
 */
const GameVersionFilterOptions: EnumOptions = {
    /**
     * `GameVersionFilter` is a flag-based enum.
     */
    hasFlags: true,

    /**
     * The case should be ignored while parsing the filter.
     */
    ignoreCase: true,

    /**
     * Non-word characters should be ignored while parsing the filter.
     */
    ignoreNonWordCharacters: true,
};

/**
 * Filters game versions based on the provided filter.
 *
 * @template T - The type of the game versions.
 *
 * @param versions - An iterable of game versions to filter.
 * @param filter - The filter to apply to the versions.
 *
 * @returns An array of filtered game versions.
 */
function filter<T extends GameVersion>(versions: Iterable<T>, filter: GameVersionFilter): T[] {
    let filtered = [...versions];
    if (filter === GameVersionFilter.NONE || !filter) {
        return filtered;
    }

    filtered = filterVersionType(filtered, filter);
    filtered = applyVersionRange(filtered, x => x.version.major, filter, GameVersionFilter.MIN_MAJOR, GameVersionFilter.MAX_MAJOR);
    filtered = applyVersionRange(filtered, x => x.version.minor, filter, GameVersionFilter.MIN_MINOR, GameVersionFilter.MAX_MINOR);
    filtered = applyVersionRange(filtered, x => x.version.patch, filter, GameVersionFilter.MIN_PATCH, GameVersionFilter.MAX_PATCH);

    return filtered;
}

/**
 * Filters game versions based on version type.
 *
 * @template T - The type of the game versions.
 *
 * @param versions - An array of game versions to filter.
 * @param filter - The filter to apply to the versions.
 *
 * @returns An array of filtered game versions.
 */
function filterVersionType<T extends GameVersion>(versions: T[], filter: GameVersionFilter): T[] {
    const allowReleases = GameVersionFilter.hasFlag(filter, GameVersionFilter.RELEASES);
    const allowBetas = GameVersionFilter.hasFlag(filter, GameVersionFilter.BETAS);
    const allowAlphas = GameVersionFilter.hasFlag(filter, GameVersionFilter.ALPHAS);
    const allowAny = (allowReleases && allowBetas && allowAlphas) || !(allowReleases || allowBetas || allowAlphas);

    if (!allowAny) {
        return versions.filter(x => (!x.isRelease || allowReleases) && (!x.isBeta || allowBetas) && (!x.isAlpha || allowAlphas));
    }

    return versions;
}

/**
 * Applies a version range filter based on the provided flags.
 *
 * @template T - The type of the game versions.
 *
 * @param versions - An array of game versions to filter.
 * @param selector - A function to select a specific version value (major, minor, or patch).
 * @param flags - The filter flags to apply to the versions.
 * @param minFlag - The `minimum` flag applicable to the selected version value.
 * @param maxFlag - The `maximum` flag applicable to the selected version value.
 *
 * @returns An array of filtered game versions.
 */
function applyVersionRange<T extends GameVersion>(versions: T[], selector: (x: T) => number, flags: number, minFlag: number, maxFlag: number): T[] {
    const comparer = GameVersionFilter.hasFlag(flags, minFlag) ? -1 : GameVersionFilter.hasFlag(flags, maxFlag) ? 1 : 0;
    if (!comparer) {
        return versions;
    }

    const target = versions.reduce((current, version) => Math.sign(selector(version) - current) === comparer ? selector(version) : current, comparer === 1 ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
    return versions.filter(x => selector(x) === target);
}

/**
 * Converts a version resolver name to a game version filter.
 *
 * @param versionResolverName - The name of the version resolver.
 *
 * @returns The corresponding game version filter.
 */
function _fromVersionResolver(versionResolverName: string): GameVersionFilter {
    if (stringEquals(versionResolverName, "exact", { ignoreCase: true })) {
        return GameVersionFilterValues.MIN | GameVersionFilterValues.RELEASES;
    }

    if (stringEquals(versionResolverName, "latest", { ignoreCase: true })) {
        return (
            GameVersionFilterValues.MIN_MAJOR |
            GameVersionFilterValues.MIN_MINOR |
            GameVersionFilterValues.MAX_PATCH |
            GameVersionFilterValues.RELEASES
        );
    }

    if (stringEquals(versionResolverName, "all", { ignoreCase: true })) {
        return GameVersionFilterValues.MIN_MAJOR | GameVersionFilterValues.MIN_MINOR;
    }

    return (
        GameVersionFilterValues.MIN_MAJOR |
        GameVersionFilterValues.MIN_MINOR |
        GameVersionFilterValues.RELEASES
    );
}

/**
 * Converts a version resolver name to a game version filter.
 *
 * @param versionResolverName - The name of the version resolver.
 *
 * @returns The corresponding game version filter.
 *
 * @deprecated
 *
 * Use keys of the new {@link GameVersionFilter} instead.
 */
const fromVersionResolver = deprecate(
    _fromVersionResolver,
    "Use the new `game-version-filter` input instead of the deprecated `version-resolver` one."
);

/**
 * A collection of methods to work with `GameVersionFilter`.
 *
 * @partial
 */
const GameVersionFilterMethods = {
    filter,
    fromVersionResolver,
};


/**
 * Represents a game version filter.
 *
 * This filter can be used to filter game versions based on the provided criteria.
 */
export const GameVersionFilter = Enum.create(
    GameVersionFilterValues,
    GameVersionFilterOptions,
    GameVersionFilterMethods,
);

/**
 * Represents a game version filter.
 *
 * This filter can be used to filter game versions based on the provided criteria.
 */
export type GameVersionFilter = Enum<typeof GameVersionFilterValues>;
