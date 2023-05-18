import { ACTION_NAME } from "@/action";
import { Dependency, DependencyType, createDependency } from "@/dependencies";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { asString } from "@/utils/string-utils";
import { PartialRecord } from "@/utils/types";
import { RawQuiltMetadata } from "./raw-quilt-metadata";

/**
 * Represents a single dependency for a Quilt mod project.
 */
export interface QuiltDependency {
    /**
     * A mod identifier in the form of either `mavenGroup:modId` or `modId`.
     */
    id: string;

    /**
     * The version of the dependency.
     */
    version?: string;

    /**
     * The version range for the dependency.
     *
     * Can be a single version or an array of version ranges.
     */
    versions?: string | string[];

    /**
     * A short, human-readable reason for the dependency object to exist.
     */
    reason?: string;

    /**
     * Dependencies marked as `optional` will only be checked if the mod/plugin specified by the `id` field is present.
     */
    optional?: boolean;

    /**
     * Indicates whether this dependency is embedded into the mod.
     *
     * @custom
     */
    provided?: boolean;

    /**
     * Indicates whether this dependency is incompatible with the mod.
     *
     * @custom
     */
    breaking?: boolean;

    /**
     * Describes situations where this dependency can be ignored.
     */
    unless?: string | QuiltDependency;

    /**
     * Custom action payload.
     *
     * @custom
     */
    [ACTION_NAME]?: QuiltDependencyCustomPayload;
}

/**
 * Custom payload attached to a Quilt dependency.
 */
type QuiltDependencyCustomPayload = {
    /**
     * Indicates whether the dependency should be ignored globally,
     * or by the platforms specified in the given array.
     */
    ignore?: boolean | PlatformType[];
} & PartialRecord<PlatformType, string>;

/**
 * A list of special dependencies that should be ignored.
 */
const IGNORED_DEPENDENCIES: readonly string[] = [
    "minecraft",
    "java",
    "quilt_loader",
];

/**
 * A map of aliases for special dependencies for different platforms.
 */
const DEPENDENCY_ALIASES: ReadonlyMap<string, ReadonlyMap<PlatformType, string>> = $i([
    ["fabric", "fabric-api"],
    ["quilt_base", "qsl"],
    ["quilted_fabric_api", "qsl"],
].map(([k, v]) =>
    [k, typeof v === "string" ? $i(PlatformType.values()).map(x => [x, v] as const).toMap() : v] as const,
)).toMap();

/**
 * Retrieves Quilt dependencies from the metadata.
 *
 * @param metadata - The raw Quilt metadata.
 *
 * @returns An array of Quilt dependencies.
 */
export function getQuiltDependencies(metadata: RawQuiltMetadata): QuiltDependency[] {
    const dependencyMap = $i(mapQuiltDependencies(metadata?.quilt_loader?.depends))
        .concat(mapQuiltDependencies(metadata?.quilt_loader?.breaks, { breaking: true }))
        .concat(mapQuiltDependencies(metadata?.quilt_loader?.provides, { provided: true }))
        .filter(x => x.id)
        .map(x => [x.id, x] as const)
        .toMap();

    return [...dependencyMap.values()];
}

/**
 * Maps a dependency field presented in raw Quilt metadata into the array of Quilt dependencies.
 *
 * @param dependencies - The dependency field to be mapped.
 * @param customFields - Custom fields to attach to the dependencies.
 *
 * @returns The array of Quilt dependencies represented by the given field.
 */
function mapQuiltDependencies(dependencies: (string | QuiltDependency)[], customFields?: Partial<QuiltDependency>): Iterable<QuiltDependency> {
    if (!dependencies) {
        return [];
    }

    return $i(dependencies).map(x => typeof x === "string" ? { id: x, ...customFields } : { ...x, ...customFields });
}

/**
 * Converts {@link QuiltDependency} to a {@link Dependency} object.
 *
 * @returns A Dependency object representing the given Quilt dependency.
 */
export function normalizeQuiltDependency(dependency: QuiltDependency): Dependency {
    const payload = getQuiltDependencyCustomPayload(dependency);

    const id = dependency?.id?.includes(":") ? dependency.id.substring(dependency.id.indexOf(":") + 1) : dependency?.id;
    const versions = dependency?.version || dependency?.versions;
    const ignore = IGNORED_DEPENDENCIES.includes(id) || typeof payload.ignore === "boolean" && payload.ignore;
    const ignoredPlatforms = typeof payload.ignore === "boolean" ? undefined : payload.ignore;
    const type = (
        dependency?.breaking && dependency?.unless && DependencyType.CONFLICTING ||
        dependency?.breaking && DependencyType.INCOMPATIBLE ||
        dependency?.provided && DependencyType.EMBEDDED ||
        (dependency?.optional || dependency?.unless) && DependencyType.OPTIONAL ||
        DependencyType.REQUIRED
    );
    const aliases = $i(DEPENDENCY_ALIASES.get(id) as Iterable<readonly [PlatformType, string]> || [])
        .concat(
            $i(PlatformType.values()).map(type => [type, payload[type] ? asString(payload[type]) : undefined] as const)
        )
        .filter(([, id]) => id)
        .toMap();

    return createDependency({
        id,
        versions,
        type,
        ignore,
        ignoredPlatforms,
        aliases,
    });
}

/**
 * Gets the custom payload from the Quilt dependency.
 *
 * @param dependency - The Quilt dependency.
 *
 * @returns The custom payload object.
 */
function getQuiltDependencyCustomPayload(dependency: QuiltDependency): QuiltDependencyCustomPayload {
    return dependency?.[ACTION_NAME] || {};
}
