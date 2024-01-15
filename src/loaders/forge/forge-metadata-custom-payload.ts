import { ACTION_NAME } from "@/action";
import { Dependency, createDependency } from "@/dependencies";
import { LoaderType } from "@/loaders/loader-type";
import { PlatformType } from "@/platforms";
import { PartialRecord } from "@/utils/types";
import { deprecate } from "node:util";
import { RawForgeMetadata } from "./raw-forge-metadata";
import { asString } from "@/utils/string-utils";

// _ TODO: Remove the deprecated stuff in v4.0.

/**
 * Custom payload for Forge metadata.
 */
export type ForgeMetadataCustomPayload = {
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
 * Gets the custom payload from the Forge metadata.
 *
 * @param metadata - The raw Forge metadata.
 *
 * @returns The custom payload attached to the given metadata.
 */
export function getForgeMetadataCustomPayload(metadata: RawForgeMetadata): ForgeMetadataCustomPayload {
    return containsLegacyCustomPayloadDefinition(metadata)
        ? getLegacyForgeMetadataCustomPayload(metadata)
        : (metadata?.[ACTION_NAME] || {});
}

/**
 * Checks if the metadata contains a legacy custom payload definition.
 *
 * @param metadata - The raw Forge metadata.
 *
 * @returns A boolean indicating if the legacy custom payload definition is present.
 */
function containsLegacyCustomPayloadDefinition(metadata: RawForgeMetadata): boolean {
    return !!metadata?.custom?.[ACTION_NAME] || !!metadata?.custom?.projects || !!metadata?.projects;
}

/**
 * Gets the legacy custom payload from the Forge metadata.
 *
 * @param metadata - The raw Forge metadata.
 *
 * @returns The custom payload object.
 */
function _getLegacyForgeMetadataCustomPayload(metadata: RawForgeMetadata): ForgeMetadataCustomPayload {
    const legacyPayload = { ...metadata?.projects, ...metadata?.custom?.projects, ...metadata?.custom?.[ACTION_NAME] };
    const basePayload = metadata?.[ACTION_NAME];
    return { ...legacyPayload, ...basePayload };
}

/**
 * Gets the legacy custom payload from the Forge metadata.
 *
 * @param metadata - The raw Forge metadata.
 *
 * @returns The custom payload object.
 *
 * @deprecated
 *
 * Use top-level `mc-publish` field in your mod metadata.
 */
const getLegacyForgeMetadataCustomPayload = deprecate(
    _getLegacyForgeMetadataCustomPayload,
    "Use top-level `mc-publish` field in your mods.toml.",
);

/**
 * Gets an array of supported mod loaders from the custom payload attached to the Forge metadata.
 *
 * @param payload - The custom payload object.
 *
 * @returns An array of supported mod loaders.
 */
export function getLoadersFromForgeMetadataCustomPayload(metadata: RawForgeMetadata): string[] {
    const payload = getForgeMetadataCustomPayload(metadata);
    return payload.loaders || [LoaderType.FORGE];
}

/**
 * Gets the dependencies from the custom payload attached to the Forge metadata.
 *
 * @param payload - The custom payload object.
 *
 * @returns An array of dependencies included into the custom payload.
 */
export function getDependenciesFromForgeMetadataCustomPayload(payload: ForgeMetadataCustomPayload): Dependency[] {
    if (!Array.isArray(payload?.dependencies)) {
        return [];
    }

    return payload?.dependencies?.map(x => createDependency(x)).filter(x => x) || [];
}

/**
 * Gets the project ID from the custom payload attached to the Forge metadata based on the given platform.
 *
 * @param payload - The custom payload object.
 * @param platform - The platform for which the project ID is required.
 *
 * @returns The project ID as a string, or `undefined` if not found.
 */
export function getProjectIdFromForgeMetadataCustomPayload(payload: ForgeMetadataCustomPayload, platform: PlatformType): string | undefined {
    const id = payload?.[platform];
    return id ? asString(id) : undefined;
}
