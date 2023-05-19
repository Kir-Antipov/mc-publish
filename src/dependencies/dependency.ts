import { PlatformType } from "@/platforms/platform-type";
import { $i, isIterable } from "@/utils/collections";
import { VersionRange, anyVersionRange } from "@/utils/versioning";
import { DependencyType } from "./dependency-type";
import { isLegacyDependencyFormat, parseLegacyDependencyFormat } from "./dependency.legacy";

/**
 * Represents a dependency.
 */
export interface Dependency {
    /**
     * The unique identifier of the dependency.
     */
    get id(): string;

    /**
     * The importance of the dependency for the project.
     */
    get type(): DependencyType;

    /**
     * The range of allowed versions for the dependency.
     */
    get versions(): string[];

    /**
     * Checks if the dependency is ignored for a specific platform or globally
     * if no platform is specified.
     *
     * @param platform - The platform to check for (optional).
     *
     * @returns A boolean indicating if the dependency is ignored.
     */
    isIgnored(platform?: PlatformType): boolean;

    /**
     * Retrieves the project ID for the dependency on a specific platform.
     *
     * Useful when a dependency has different identifiers across platforms.
     *
     * @param platform - The platform to get the project ID for.
     *
     * @returns The project ID associated with the dependency on the specified platform.
     */
    getProjectId(platform: PlatformType): string;
}

/**
 * Represents  an intermediate representation of a dependency
 * when parsing and creating {@link Dependency} objects from various formats.
 */
export interface DependencyInfo {
    /**
     * The unique identifier of the dependency.
     */
    id: string;

    /**
     * The importance of the dependency for the project.
     */
    type?: string | DependencyType;

    /**
     * The range of allowed versions for the dependency.
     */
    versions?: string | string[] | VersionRange;

    /**
     * A boolean indicating if the dependency is ignored globally.
     */
    ignore?: boolean;

    /**
     * A list of platforms the dependency is ignored on.
     */
    ignoredPlatforms?: Iterable<string | PlatformType>;

    /**
     * A list of aliases for the dependency on different platforms.
     */
    aliases?: Iterable<readonly [string | PlatformType, string]>;
}

/**
 * Representing different ways a dependency can be expressed.
 */
export type DependencyLike = Dependency | DependencyInfo | string;

/**
 * Parses a dependency string and returns a Dependency object.
 *
 * @param dependency - The dependency string to parse.
 *
 * @returns A {@link Dependency} object, or `undefined` if the string is invalid.
 */
export function parseDependency(dependency: string): Dependency | undefined {
    const dependencyInfo = isLegacyDependencyFormat(dependency)
        ? parseLegacyDependencyFormat(dependency)
        : parseDependencyFormat(dependency);

    return dependencyInfo && createDependency(dependencyInfo);
}

/**
 * A regex pattern for matching formatted dependency strings.
 */
const DEPENDENCY_REGEX = /^\s*(?<id>[^@{(#]+)(@(?<versionRange>[^@{(#]*))?(?:\((?<type>[^@{(#]*)\))?(?<aliases>(?:\{[^:=]+(?:=|:)[^}]*\})+)?(?<ignore>#\(ignore(?::(?<ignoredPlatforms>[^)]*))?\))?\s*$/;

/**
 * A regex pattern for matching dependency aliases in dependency strings.
 */
const DEPENDENCY_ALIASES_REGEX = /\{(?<platform>[^:=]+)(?:=|:)(?<id>[^}]*)\}/g;

/**
 * Parses a dependency string and returns an intermediate representation of a dependency.
 *
 * @param dependencyFormat - The dependency string to parse.
 *
 * @returns A dependency info, or `undefined` if the string is invalid.
 *
 * @remarks
 *
 * The format is `[dependency-id]@[version-range]?([type])?{[platform]:[dependency-id]}?#(ignore:[platform1,platform2])?`.
 */
function parseDependencyFormat(dependencyFormat: string): DependencyInfo | undefined {
    const match = dependencyFormat?.match(DEPENDENCY_REGEX);
    if (!match) {
        return undefined;
    }

    const id = match.groups.id.trim();
    const versions = match.groups.versionRange?.trim();
    const type = match.groups.type?.trim();
    const aliases = $i(match.groups.aliases?.matchAll(DEPENDENCY_ALIASES_REGEX) || []).map(x => [x.groups.platform.trim(), x.groups.id.trim()] as const);
    const ignoredPlatforms = match.groups.ignoredPlatforms?.split(",").map(x => x.trim());
    const ignore = ignoredPlatforms?.length ? undefined : !!match.groups.ignore;

    return { id, versions, type, aliases, ignore, ignoredPlatforms };
}

/**
 * Creates a dependency from the given dependency-like value.
 *
 * @param dependency - A dependency-like value to create a dependency from.
 *
 * @returns A {@link Dependency}, or `undefined` if the input is invalid.
 */
export function createDependency(dependency: DependencyLike): Dependency | undefined {
    if (typeof dependency === "string") {
        return parseDependency(dependency);
    }

    if (isDependency(dependency)) {
        return dependency;
    }

    if (!dependency?.id) {
        return undefined;
    }

    const id = dependency.id || "";
    const type = dependency.type && DependencyType.parse(dependency.type) || DependencyType.REQUIRED;

    const versionRanges = typeof dependency.versions === "string"
        ? [dependency.versions]
        : isIterable(dependency.versions)
            ? [...dependency.versions]
            : [(dependency.versions || anyVersionRange()).toString()];

    const versions = versionRanges.filter(x => x && x !== anyVersionRange().toString());
    if (!versions.length) {
        versions.push(anyVersionRange().toString());
    }

    const ignoredPlatforms = $i(dependency.ignoredPlatforms || []).map(x => PlatformType.parse(x)).filter(x => x).toSet();
    const isIgnored = dependency.ignore
        ? () => true
        : (p: PlatformType) => p ? ignoredPlatforms.has(p) : ignoredPlatforms.size === PlatformType.size;

    const aliases = $i(dependency.aliases || []).map(([key, value]) => [PlatformType.parse(key), value] as const).filter(([key]) => key).toMap();
    const getProjectId = (p: PlatformType) => aliases.get(p) ?? id;

    return { id, versions, type, isIgnored, getProjectId };
}

/**
 * Formats a dependency as a string.
 *
 * @param dependency - The dependency to format.
 *
 * @returns A string representation of the dependency.
 */
export function formatDependency(dependency: Dependency): string {
    if (!dependency) {
        return "";
    }

    const versionRange = dependency.versions.join(" || ");
    const version = versionRange && versionRange !== anyVersionRange().toString() ? `@${versionRange}` : "";

    const ignoredBy = $i(PlatformType.values()).filter(x => dependency.isIgnored(x)).join(",");
    const ignore = ignoredBy && `#(ignore:${ignoredBy})`;

    const aliases = $i(PlatformType.values()).filter(x => dependency.getProjectId(x) !== dependency.id).map(x => `{${x}:${dependency.getProjectId(x)}}`).join("");

    return `${dependency.id}${version}(${dependency.type})${aliases}${ignore}`;
}

/**
 * Determines if the given value is a {@link Dependency}.
 *
 * @param dependency - The value to check.
 *
 * @returns A boolean indicating if the value is a {@link Dependency}.
 */
export function isDependency(dependency: unknown): dependency is Dependency {
    const d = dependency as Dependency;
    return (
        typeof d?.id === "string" &&
        typeof d.type === DependencyType.underlyingType &&
        Array.isArray(d.versions) &&
        typeof d.getProjectId === "function" &&
        typeof d.isIgnored === "function"
    );
}
