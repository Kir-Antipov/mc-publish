import { ACTION_NAME } from "@/action";
import { Dependency, createDependency } from "@/dependencies";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { asString } from "@/utils/string-utils";
import { PartialRecord } from "@/utils/types";
import { NeoForgeDependencyType } from "./neoforge-dependency-type";
import { NeoForgeEnvironmentType } from "./neoforge-environment-type";
import { RawNeoForgeMetadata } from "./raw-neoforge-metadata";

/**
 * A dependency configuration for a NeoForge mod.
 */
export interface NeoForgeDependency {
    /**
     * The mod id of the dependency.
     */
    modId: string;

    /**
     * Whether to crash if this dependency is not met.
     */
    mandatory?: boolean;

    /**
     * The type of the dependency.
     */
    type?: NeoForgeDependencyType;

    /**
     * The acceptable version range of the dependency, expressed as a Maven version spec.
     *
     * An empty string is an unbounded version range, which matches any version.
     */
    versionRange?: string;

    /**
     * Defines if the mod must load before or after this dependency.
     *
     * The valid values are `BEFORE` (must load before), `AFTER` (must load after), and `NONE` (does not care about order).
     *
     * Defaults to `NONE`.
     */
    ordering?: "BEFORE" | "AFTER" | "NONE";

    /**
     * The physical side. The valid values are:
     *
     *  - `CLIENT` (present on the client).
     *  - `SERVER` (present on the dedicated server).
     *  - `BOTH`, the default one, (present on both sides).
     */
    side?: NeoForgeEnvironmentType;

    /**
     * Custom action payload.
     */
    [ACTION_NAME]?: NeoForgeDependencyCustomPayload;
}

/**
 * Custom payload attached to a NeoForge dependency.
 */
type NeoForgeDependencyCustomPayload = {
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
    "neoforge",
];

/**
 * Retrieves NeoForge dependencies from the metadata.
 *
 * @param metadata - The raw NeoForge metadata.
 *
 * @returns An array of NeoForge dependencies.
 */
export function getNeoForgeDependencies(metadata: RawNeoForgeMetadata): NeoForgeDependency[] {
    const dependencyMap = $i(Object.values(metadata?.dependencies || {}))
        .filter(x => Array.isArray(x))
        .flatMap(x => x)
        .filter(x => x?.modId)
        .map(x => [x.modId, x] as const)
        .reverse()
        .toMap();

    return [...dependencyMap.values()];
}

/**
 * Converts {@link FabricDependency} to a {@link Dependency} object.
 *
 * @returns A Dependency object representing the given Fabric dependency, or `undefined` if the input is invalid..
 */
export function normalizeNeoForgeDependency(dependency: NeoForgeDependency): Dependency | undefined {
    const payload = dependency?.[ACTION_NAME] || {};

    const id = dependency?.modId;
    const versions = dependency?.versionRange;
    const ignore = IGNORED_DEPENDENCIES.includes(dependency?.modId) || typeof payload.ignore === "boolean" && payload.ignore;
    const ignoredPlatforms = typeof payload.ignore === "boolean" ? undefined : payload.ignore;
    const aliases = $i(PlatformType.values()).map(type => [type, payload[type] ? asString(payload[type]) : undefined] as const).filter(([, id]) => id).toMap();
    const type = NeoForgeDependencyType.toDependencyType(
        dependency?.type || ((dependency?.mandatory ?? true) ? NeoForgeDependencyType.REQUIRED : NeoForgeDependencyType.OPTIONAL)
    );

    return createDependency({
        id,
        versions,
        type,
        ignore,
        ignoredPlatforms,
        aliases,
    });
}
