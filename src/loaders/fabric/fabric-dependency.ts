import { Dependency, createDependency } from "@/dependencies";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { FabricDependencyType } from "./fabric-dependency-type";
import { RawFabricMetadata } from "./raw-fabric-metadata";

/**
 * Represents a single dependency for a Fabric mod project.
 */
export interface FabricDependency {
    /**
     * The identifier for the dependency.
     */
    id: string;

    /**
     * The version range for the dependency.
     *
     * Can be a single version or an array of version ranges.
     */
    version: string | string[];

    /**
     * The type of the dependency.
     */
    type: FabricDependencyType;
}

/**
 * Interface representing a list of dependencies for a Fabric mod project.
 */
export interface FabricDependencyList {
    /**
     * The key is a Mod ID of the dependency.
     *
     * The value is a string or array of strings declaring supported version ranges.
     */
    [id: string]: string | string[] | undefined;
}

/**
 * A list of special dependencies that should be ignored.
 */
const IGNORED_DEPENDENCIES: readonly string[] = [
    "minecraft",
    "java",
    "fabricloader",
];

/**
 * A map of aliases for special dependencies for different platforms.
 */
const DEPENDENCY_ALIASES: ReadonlyMap<string, ReadonlyMap<PlatformType, string>> = new Map([
    ["fabric", "fabric-api"],
].map(([k, v]) =>
    [k, typeof v === "string" ? $i(PlatformType.values()).map(x => [x, v] as const).toMap() : v],
));

/**
 * Retrieves Fabric dependencies from the metadata.
 *
 * @param metadata - The raw Fabric metadata.
 *
 * @returns An array of Fabric dependencies.
 */
export function getFabricDependencies(metadata: RawFabricMetadata): FabricDependency[] {
    return $i(FabricDependencyType.values()).flatMap(type => toFabricDependencyArray(metadata?.[type], type)).toArray();
}

/**
 * Converts a {@link FabricDependencyList} to a proper array of Fabric dependencies.
 *
 * @param list - The list of fabric dependencies.
 * @param type - The type of the dependencies in the list.
 *
 * @returns An array of Fabric dependencies.
 */
export function toFabricDependencyArray(list: FabricDependencyList, type: FabricDependencyType): FabricDependency[] {
    return Object.entries(list || {}).map(([id, version]) => ({ id, version, type }));
}

/**
 * Converts {@link FabricDependency} to a {@link Dependency} object.
 *
 * @returns A Dependency object representing the given Fabric dependency, or `undefined` if the input is invalid..
 */
export function normalizeFabricDependency(dependency: FabricDependency): Dependency | undefined {
    return createDependency({
        id: dependency?.id,
        versions: dependency?.version,
        type: FabricDependencyType.toDependencyType(dependency?.type || FabricDependencyType.DEPENDS),
        ignore: IGNORED_DEPENDENCIES.includes(dependency?.id),
        aliases: DEPENDENCY_ALIASES.get(dependency?.id),
    });
}
