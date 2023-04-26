import { asArray, asArrayLike, isIterable } from "@/utils/collections";
import { Enum, EnumOptions } from "@/utils/enum";
import { VersionType } from "@/utils/versioning";
import { UnfeaturableModrinthVersion } from "./modrinth-version";

/**
 * Represents the modes for unfeaturing Modrinth versions.
 *
 * @partial
 */
enum ModrinthUnfeatureModeValues {
    /**
     * No unfeature mode.
     */
    NONE = 0,

    /**
     * Unfeature mode for game version subset.
     */
    GAME_VERSION_SUBSET = 1,

    /**
     * Unfeature mode for version intersection.
     */
    GAME_VERSION_INTERSECTION = 2,

    /**
     * Unfeature mode for any version.
     */
    GAME_VERSION_ANY = 4,

    /**
     * Unfeature mode for version type subset.
     */
    VERSION_TYPE_SUBSET = 8,

    /**
     * Unfeature mode for version type intersection.
     */
    VERSION_TYPE_INTERSECTION = 16,

    /**
     * Unfeature mode for any version type.
     */
    VERSION_TYPE_ANY = 32,

    /**
     * Unfeature mode for loader subset.
     */
    LOADER_SUBSET = 64,

    /**
     * Unfeature mode for loader intersection.
     */
    LOADER_INTERSECTION = 128,

    /**
     * Unfeature mode for any loader.
     */
    LOADER_ANY = 256,

    /**
     * Unfeature mode for a subset of game versions, loaders, and version types.
     */
    SUBSET = GAME_VERSION_SUBSET | VERSION_TYPE_SUBSET | LOADER_SUBSET,

    /**
     * Unfeature mode for an intersection of game versions, loaders, and version types.
     */
    INTERSECTION = GAME_VERSION_INTERSECTION | VERSION_TYPE_INTERSECTION | LOADER_INTERSECTION,

    /**
     * Unfeature mode for any game version, loader, or version type.
     */
    ANY = GAME_VERSION_ANY | VERSION_TYPE_ANY | LOADER_ANY,
}

/**
 * Options for configuring the behavior of the ModrinthUnfeatureMode enum.
 *
 * @partial
 */
const ModrinthUnfeatureModeOptions: EnumOptions = {
    /**
     * `ModrinthUnfeatureMode` is a flag-based enum.
     */
    hasFlags: true,

    /**
     * The case should be ignored while parsing the unfeature mode.
     */
    ignoreCase: true,

    /**
     * Non-word characters should be ignored while parsing the unfeature mode.
     */
    ignoreNonWordCharacters: true,
};

/**
 * Determines if the given unfeature mode is the "none" mode.
 *
 * @param mode - The unfeature mode.
 *
 * @returns `true` if the mode is "none"; otherwise, `false`.
 */
function isNone(mode: ModrinthUnfeatureMode): boolean {
    return mode === ModrinthUnfeatureMode.NONE;
}

/**
 * Determines if the given unfeature mode is a subset mode.
 *
 * @param mode - The unfeature mode.
 *
 * @returns `true` if the mode is a subset mode; otherwise, `false`.
 */
function isSubset(mode: ModrinthUnfeatureMode): boolean {
    return (
        ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.GAME_VERSION_SUBSET) ||
        ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.VERSION_TYPE_SUBSET) ||
        ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.LOADER_SUBSET)
    );
}

/**
 * Determines if the given unfeature mode is an intersection mode.
 *
 * @param mode - The unfeature mode.
 *
 * @returns `true` if the mode is an intersection mode; otherwise, `false`.
 */
function isIntersection(mode: ModrinthUnfeatureMode): boolean {
    return (
        ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.GAME_VERSION_INTERSECTION) ||
        ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.VERSION_TYPE_INTERSECTION) ||
        ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.LOADER_INTERSECTION)
    );
}

/**
 * Determines if the given unfeature mode is an "any" mode.
 *
 * @param mode - The unfeature mode.
 *
 * @returns `true` if the mode is an "any" mode; otherwise, `false`.
 */
function isAny(mode: ModrinthUnfeatureMode): boolean {
    return !isSubset(mode) && !isIntersection(mode);
}

/**
 * Retrieves the version-specific unfeature mode from the composite unfeature mode.
 *
 * @param mode - The unfeature mode.
 *
 * @returns The version-specific unfeature mode.
 */
function getGameVersionMode(mode: ModrinthUnfeatureMode): ModrinthUnfeatureMode {
    if (ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.GAME_VERSION_SUBSET)) {
        return ModrinthUnfeatureMode.GAME_VERSION_SUBSET;
    }

    if (ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.GAME_VERSION_INTERSECTION)) {
        return ModrinthUnfeatureMode.GAME_VERSION_INTERSECTION;
    }

    return ModrinthUnfeatureMode.GAME_VERSION_ANY;
}

/**
 * Retrieves the version type-specific unfeature mode from the given composite unfeature mode.
 *
 * @param mode - The unfeature mode.
 *
 * @returns The version type-specific unfeature mode.
 */
function getVersionTypeMode(mode: ModrinthUnfeatureMode): ModrinthUnfeatureMode {
    if (ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.VERSION_TYPE_SUBSET)) {
        return ModrinthUnfeatureMode.VERSION_TYPE_SUBSET;
    }

    if (ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.VERSION_TYPE_INTERSECTION)) {
        return ModrinthUnfeatureMode.VERSION_TYPE_INTERSECTION;
    }

    return ModrinthUnfeatureMode.VERSION_TYPE_ANY;
}

/**
 * Retrieves the loader-specific unfeature mode from the given composite unfeature mode.
 *
 * @param mode - The unfeature mode.
 *
 * @returns The loader-specific unfeature mode.
 */
function getLoaderMode(mode: ModrinthUnfeatureMode): ModrinthUnfeatureMode {
    if (ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.LOADER_SUBSET)) {
        return ModrinthUnfeatureMode.LOADER_SUBSET;
    }

    if (ModrinthUnfeatureMode.hasFlag(mode, ModrinthUnfeatureMode.LOADER_INTERSECTION)) {
        return ModrinthUnfeatureMode.LOADER_INTERSECTION;
    }

    return ModrinthUnfeatureMode.LOADER_ANY;
}

/**
 * Determines if the `previous` value satisfies the given unfeature condition.
 *
 * @param previous - The previous value.
 * @param current - The current value.
 * @param mode - The unfeature mode.
 *
 * @returns `true` if the `previous` value satisfies the given unfeature condition; otherwise, `false`.
 */
function satisfies<T>(previous: T, current: T, mode: ModrinthUnfeatureMode): boolean {
    if (isAny(mode)) {
        return true;
    }

    // If the provided items are scalars, the only way the could intersect with each other
    // or one be a subset of another is for them to be strictly equal.
    // This way we cover both possibilities at the same time.
    if (!isIterable(current) || !isIterable(previous)) {
        return current === previous;
    }

    const currentArray = asArray(current);
    if (isSubset(mode)) {
        return asArrayLike(previous).every(x => currentArray.includes(x));
    }

    // isIntersection(mode) === true
    return asArrayLike(previous).some(x => currentArray.includes(x));
}

/**
 * Determines if the `previous` version should be unfeatured based on the given unfeature mode.
 *
 * @param previous - The previous version.
 * @param current - The current version.
 * @param mode - The unfeature mode.
 *
 * @returns `true` if the `previous` version should be unfeatured based on the given unfeature mode; otherwise, `false`.
 */
function shouldUnfeature(previous: UnfeaturableModrinthVersion, current: UnfeaturableModrinthVersion, mode: ModrinthUnfeatureMode): boolean {
    if (previous.id === current.id) {
        return false;
    }

    const gameVersionMode = getGameVersionMode(mode);
    const versionTypeMode = getVersionTypeMode(mode);
    const loaderMode = getLoaderMode(mode);

    return (
        satisfies(previous.game_versions || [], current.game_versions || [], gameVersionMode) &&
        satisfies(previous.version_type || VersionType.RELEASE, current.version_type || VersionType.RELEASE, versionTypeMode) &&
        satisfies(previous.loaders || [], current.loaders || [], loaderMode)
    );
}

/**
 * A collection of methods to work with ModrinthUnfeatureMode.
 *
 * @partial
 */
const ModrinthUnfeatureModeMethods = {
    isNone,
    isSubset,
    isIntersection,
    isAny,
    getGameVersionMode,
    getVersionTypeMode,
    getLoaderMode,
    shouldUnfeature,
};

/**
 * Represents the modes for unfeaturing Modrinth versions.
 */
export const ModrinthUnfeatureMode = Enum.create(
    ModrinthUnfeatureModeValues,
    ModrinthUnfeatureModeOptions,
    ModrinthUnfeatureModeMethods,
);

/**
 * Represents the modes for unfeaturing Modrinth versions.
 */
export type ModrinthUnfeatureMode = Enum<typeof ModrinthUnfeatureModeValues>;
