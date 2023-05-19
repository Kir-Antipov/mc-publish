import { ACTION_NAME } from "@/action";
import { Dependency, createDependency } from "@/dependencies";
import { LoaderType } from "@/loaders/loader-type";
import { PlatformType } from "@/platforms";
import { PartialRecord } from "@/utils/types";
import { deprecate } from "node:util";
import { RawQuiltMetadata } from "./raw-quilt-metadata";
import { asString } from "@/utils/string-utils";

// _ TODO: Remove the deprecated stuff in v4.0.

/**
 * Custom payload for Quilt metadata.
 */
export type QuiltMetadataCustomPayload = {
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
 * Gets the custom payload from the Quilt metadata.
 *
 * @param metadata - The raw Quilt metadata.
 *
 * @returns The custom payload attached to the given metadata.
 */
export function getQuiltMetadataCustomPayload(metadata: RawQuiltMetadata): QuiltMetadataCustomPayload {
    return containsLegacyCustomPayloadDefinition(metadata)
        ? getLegacyQuiltMetadataCustomPayload(metadata)
        : (metadata?.[ACTION_NAME] || {});
}

/**
 * Checks if the metadata contains a legacy custom payload definition.
 *
 * @param metadata - The raw Quilt metadata.
 *
 * @returns A boolean indicating if the legacy custom payload definition is present.
 */
function containsLegacyCustomPayloadDefinition(metadata: RawQuiltMetadata): boolean {
    return !!metadata?.projects;
}

/**
 * Gets the legacy custom payload from the Quilt metadata.
 *
 * @param metadata - The raw Quilt metadata.
 *
 * @returns The custom payload object.
 */
function _getLegacyQuiltMetadataCustomPayload(metadata: RawQuiltMetadata): QuiltMetadataCustomPayload {
    const legacyPayload = metadata?.projects;
    const basePayload = metadata?.[ACTION_NAME];
    return { ...legacyPayload, ...basePayload };
}

/**
 * Gets the legacy custom payload from the Quilt metadata.
 *
 * @param metadata - The raw Quilt metadata.
 *
 * @returns The custom payload object.
 *
 * @deprecated
 *
 * Use top-level `mc-publish` field in your mod metadata.
 */
const getLegacyQuiltMetadataCustomPayload = deprecate(
    _getLegacyQuiltMetadataCustomPayload,
    "Use top-level `mc-publish` field in your quilt.mod.json.",
);

/**
 * A list of default mod loaders associated with the Quilt loader.
 */
const DEFAULT_LOADERS = [LoaderType.QUILT] as const;

/**
 * Gets an array of supported mod loaders from the custom payload attached to the Quilt metadata.
 *
 * @param payload - The custom payload object.
 *
 * @returns An array of supported mod loaders.
 */
export function getLoadersFromQuiltMetadataCustomPayload(payload: QuiltMetadataCustomPayload): string[] {
    return payload?.loaders || [...DEFAULT_LOADERS];
}

/**
 * Gets the dependencies from the custom payload attached to the Quilt metadata.
 *
 * @param payload - The custom payload object.
 *
 * @returns An array of dependencies included into the custom payload.
 */
export function getDependenciesFromQuiltMetadataCustomPayload(payload: QuiltMetadataCustomPayload): Dependency[] {
    if (!Array.isArray(payload?.dependencies)) {
        return [];
    }

    return payload?.dependencies?.map(x => createDependency(x)).filter(x => x) || [];
}

/**
 * Gets the project ID from the custom payload attached to the Quilt metadata based on the given platform.
 *
 * @param payload - The custom payload object.
 * @param platform - The platform for which the project ID is required.
 *
 * @returns The project ID as a string, or `undefined` if not found.
 */
export function getProjectIdFromQuiltMetadataCustomPayload(payload: QuiltMetadataCustomPayload, platform: PlatformType): string | undefined {
    const id = payload?.[platform];
    return id ? asString(id) : undefined;
}
