import { ACTION_NAME } from "@/action";
import { Dependency, createDependency } from "@/dependencies";
import { LoaderType } from "@/loaders/loader-type";
import { PlatformType } from "@/platforms";
import { PartialRecord } from "@/utils/types";
import { RawNeoForgeMetadata } from "./raw-neoforge-metadata";
import { asString } from "@/utils/string-utils";

/**
 * Custom payload for NeoForge metadata.
 */
export type NeoForgeMetadataCustomPayload = {
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
 * Gets the custom payload from the NeoForge metadata.
 *
 * @param metadata - The raw NeoForge metadata.
 *
 * @returns The custom payload attached to the given metadata.
 */
export function getNeoForgeMetadataCustomPayload(metadata: RawNeoForgeMetadata): NeoForgeMetadataCustomPayload {
    return metadata?.[ACTION_NAME] || {};
}

/**
 * Gets an array of supported mod loaders from the custom payload attached to the NeoForge metadata.
 *
 * @param payload - The custom payload object.
 *
 * @returns An array of supported mod loaders.
 */
export function getLoadersFromNeoForgeMetadataCustomPayload(metadata: RawNeoForgeMetadata): string[] {
    const payload = getNeoForgeMetadataCustomPayload(metadata);
    return payload.loaders || [LoaderType.NEOFORGE];
}

/**
 * Gets the dependencies from the custom payload attached to the NeoForge metadata.
 *
 * @param payload - The custom payload object.
 *
 * @returns An array of dependencies included into the custom payload.
 */
export function getDependenciesFromNeoForgeMetadataCustomPayload(payload: NeoForgeMetadataCustomPayload): Dependency[] {
    if (!Array.isArray(payload?.dependencies)) {
        return [];
    }

    return payload?.dependencies?.map(x => createDependency(x)).filter(x => x) || [];
}

/**
 * Gets the project ID from the custom payload attached to the NeoForge metadata based on the given platform.
 *
 * @param payload - The custom payload object.
 * @param platform - The platform for which the project ID is required.
 *
 * @returns The project ID as a string, or `undefined` if not found.
 */
export function getProjectIdFromNeoForgeMetadataCustomPayload(payload: NeoForgeMetadataCustomPayload, platform: PlatformType): string | undefined {
    const id = payload?.[platform];
    return id ? asString(id) : undefined;
}
