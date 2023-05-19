import { ACTION_NAME } from "@/action";
import { Dependency, createDependency } from "@/dependencies";
import { LoaderType } from "@/loaders/loader-type";
import { PlatformType } from "@/platforms";
import { asString } from "@/utils/string-utils";
import { PartialRecord } from "@/utils/types";
import { deprecate } from "node:util";
import { RawFabricMetadata } from "./raw-fabric-metadata";

// _ TODO: Remove the deprecated stuff in v4.0.

/**
 * Custom payload for Fabric metadata.
 */
export type FabricMetadataCustomPayload = {
    /**
     * Indicates whether the mod support Quilt loader or not.
     *
     * @deprecated
     *
     * Use the universal `loaders` field instead with `["fabric", "quilt"]` to achieve the same result.
     */
    quilt?: boolean;

    /**
     * A list of supported mod loaders.
     */
    loaders?: string[];

    /**
     * A list of mod dependencies.
     */
    dependencies?: string[];
}
& PartialRecord<PlatformType, string>;

/**
 * Gets the custom payload from the Fabric metadata.
 *
 * @param metadata - The raw Fabric metadata.
 *
 * @returns The custom payload attached to the given metadata.
 */
export function getFabricMetadataCustomPayload(metadata: RawFabricMetadata): FabricMetadataCustomPayload {
    return containsLegacyCustomPayloadDefinition(metadata)
        ? getLegacyFabricMetadataCustomPayload(metadata)
        : (metadata?.custom?.[ACTION_NAME] || {});
}

/**
 * Checks if the metadata contains a legacy custom payload definition.
 *
 * @param metadata - The raw Fabric metadata.
 *
 * @returns A boolean indicating if the legacy custom payload definition is present.
 */
function containsLegacyCustomPayloadDefinition(metadata: RawFabricMetadata): boolean {
    return !!metadata?.custom?.modmanager;
}

/**
 * Gets the legacy custom payload from the Fabric metadata.
 *
 * @param metadata - The raw Fabric metadata.
 *
 * @returns The custom payload object.
 */
function _getLegacyFabricMetadataCustomPayload(metadata: RawFabricMetadata): FabricMetadataCustomPayload {
    const modManagerPayload = metadata?.custom?.modmanager;
    const basePayload = metadata?.custom?.[ACTION_NAME];
    return { ...modManagerPayload, ...basePayload };
}

/**
 * Gets the legacy custom payload from the Fabric metadata.
 *
 * @param metadata - The raw Fabric metadata.
 *
 * @returns The custom payload object.
 *
 * @deprecated
 *
 * Use `mc-publish` field instead of `modmanager` field.
 */
const getLegacyFabricMetadataCustomPayload = deprecate(
    _getLegacyFabricMetadataCustomPayload,
    "Use `mc-publish` field instead of `modmanager` field.",
);

/**
 * A list of default mod loaders associated with the Fabric loader.
 */
const DEFAULT_LOADERS = [LoaderType.FABRIC] as const;

/**
 * Gets an array of supported mod loaders from the custom payload attached to the Fabric metadata.
 *
 * @param payload - The custom payload object.
 *
 * @returns An array of supported mod loaders.
 */
export function getLoadersFromFabricMetadataCustomPayload(payload: FabricMetadataCustomPayload): string[] {
    if (containsLegacyLoadersDefinition(payload)) {
        return getLegacyLoadersFromFabricMetadataCustomPayload(payload);
    }

    return payload?.loaders || [...DEFAULT_LOADERS];
}

/**
 * Checks if the custom payload contains a legacy loaders definition.
 *
 * @param payload - The custom payload object.
 *
 * @returns A boolean indicating if the legacy loaders definition is present.
 */
function containsLegacyLoadersDefinition(payload: FabricMetadataCustomPayload): boolean {
    return typeof payload?.quilt === "boolean";
}

/**
 * Gets an array of supported mod loaders from the legacy custom payload attached to the Fabric metadata.
 *
 * @param payload - The legacy custom payload object.
 *
 * @returns An array of supported mod loaders.
 */
function _getLegacyLoadersFromFabricMetadataCustomPayload(payload: FabricMetadataCustomPayload): string[] {
    return payload?.quilt ? [LoaderType.FABRIC, LoaderType.QUILT] : [...DEFAULT_LOADERS];
}

/**
 * Gets an array of supported mod loaders from the legacy custom payload attached to the Fabric metadata.
 *
 * @param payload - The legacy custom payload object.
 *
 * @returns An array of supported mod loaders.
 *
 * @deprecated
 *
 * Use the universal `"loaders": ["fabric", "quilt"]` field instead of `"quilt": true`.
 */
const getLegacyLoadersFromFabricMetadataCustomPayload = deprecate(
    _getLegacyLoadersFromFabricMetadataCustomPayload,
    "Use the universal `\"loaders\": [\"fabric\", \"quilt\"]` field instead of `\"quilt\": true`",
);

/**
 * Gets the dependencies from the custom payload attached to the Fabric metadata.
 *
 * @param payload - The custom payload object.
 *
 * @returns An array of dependencies included into the custom payload.
 */
export function getDependenciesFromFabricMetadataCustomPayload(payload: FabricMetadataCustomPayload): Dependency[] {
    if (!Array.isArray(payload?.dependencies)) {
        return [];
    }

    return payload?.dependencies?.map(x => createDependency(x)).filter(x => x) || [];
}

/**
 * Gets the project ID from the custom payload attached to the Fabric metadata based on the given platform.
 *
 * @param payload - The custom payload object.
 * @param platform - The platform for which the project ID is required.
 *
 * @returns The project ID as a string, or `undefined` if not found.
 */
export function getProjectIdFromFabricMetadataCustomPayload(payload: FabricMetadataCustomPayload, platform: PlatformType): string | undefined {
    const id = payload?.[platform];
    return id ? asString(id) : undefined;
}
