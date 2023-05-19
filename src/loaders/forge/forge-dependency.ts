import { ACTION_NAME } from "@/action";
import { Dependency, DependencyType, createDependency } from "@/dependencies";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { asString } from "@/utils/string-utils";
import { PartialRecord } from "@/utils/types";
import { deprecate } from "node:util";
import { ForgeEnvironmentType } from "./forge-environment-type";
import { RawForgeMetadata } from "./raw-forge-metadata";

// _ TODO: Remove the deprecated stuff in v4.0.

/**
 * A dependency configuration for a Forge mod.
 */
export interface ForgeDependency {
    /**
     * The mod id of the dependency.
     */
    modId: string;

    /**
     * Whether to crash if this dependency is not met.
     */
    mandatory: boolean;

    /**
     * Whether this dependency is embedded or not.
     *
     * @custom
     */
    embedded?: boolean;

    /**
     * Whether this dependency is incompatible with the project or not.
     *
     * @custom
     */
    incompatible?: boolean;

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
    side?: ForgeEnvironmentType;

    /**
     * Custom action payload.
     */
    [ACTION_NAME]?: ForgeDependencyCustomPayload;

    /**
     * Custom action payload (legacy).
     *
     * @deprecated
     *
     * Use [{@link ACTION_NAME}] instead.
     */
    custom?: {
        /**
         * Custom action payload.
         */
        [ACTION_NAME]?: ForgeDependencyCustomPayload;
    }
}

/**
 * Custom payload attached to a Forge dependency.
 */
type ForgeDependencyCustomPayload = {
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
    "forge",
];

/**
 * Retrieves Forge dependencies from the metadata.
 *
 * @param metadata - The raw Forge metadata.
 *
 * @returns An array of Forge dependencies.
 */
export function getForgeDependencies(metadata: RawForgeMetadata): ForgeDependency[] {
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
export function normalizeForgeDependency(dependency: ForgeDependency): Dependency | undefined {
    const payload = getForgeDependencyCustomPayload(dependency);

    const id = dependency?.modId;
    const versions = dependency?.versionRange;
    const ignore = IGNORED_DEPENDENCIES.includes(dependency?.modId) || typeof payload.ignore === "boolean" && payload.ignore;
    const ignoredPlatforms = typeof payload.ignore === "boolean" ? undefined : payload.ignore;
    const aliases = $i(PlatformType.values()).map(type => [type, payload[type] ? asString(payload[type]) : undefined] as const).filter(([, id]) => id).toMap();
    const type = (
        dependency?.incompatible && DependencyType.INCOMPATIBLE ||
        dependency?.embedded && DependencyType.EMBEDDED ||
        dependency?.mandatory && DependencyType.REQUIRED ||
        DependencyType.OPTIONAL
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

/**
 * Gets the custom payload from the Forge dependency.
 *
 * @param dependency - The Forge dependency.
 *
 * @returns The custom payload object.
 */
function getForgeDependencyCustomPayload(dependency: ForgeDependency): ForgeDependencyCustomPayload {
    return containsLegacyForgeDependencyCustomPayload(dependency)
        ? getLegacyForgeDependencyCustomPayload(dependency)
        : (dependency?.[ACTION_NAME] || {});
}

/**
 * Checks if the dependency contains a legacy custom payload definition.
 *
 * @param dependency - The dependency to check.
 *
 * @returns A boolean indicating if the legacy custom payload definition is present.
 */
function containsLegacyForgeDependencyCustomPayload(dependency: ForgeDependency): boolean {
    return !!dependency?.custom?.[ACTION_NAME];
}

/**
 * Gets the legacy custom payload from the Forge dependency.
 *
 * @param dependency - The Forge dependency.
 *
 * @returns The custom payload object.
 */
function _getLegacyForgeDependencyCustomPayload(dependency: ForgeDependency): ForgeDependencyCustomPayload {
    const legacyPayload = dependency?.custom?.[ACTION_NAME];
    const basePayload = dependency?.[ACTION_NAME];
    return { ...legacyPayload, ...basePayload };
}

/**
 * Gets the legacy custom payload from the Forge dependency.
 *
 * @param dependency - The Forge dependency.
 *
 * @returns The custom payload object.
 *
 * @deprecated
 *
 * Define `mc-publish` property directly on your Forge dependency object instead of using nested `custom.mc-publish`.
 */
const getLegacyForgeDependencyCustomPayload = deprecate(
    _getLegacyForgeDependencyCustomPayload,
    "Define `mc-publish` property directly on your Forge dependency object instead of using nested `custom.mc-publish`.",
);
