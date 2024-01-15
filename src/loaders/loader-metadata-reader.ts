import { $i } from "@/utils/collections";
import { PathLike } from "node:fs";
import { FabricMetadataReader } from "./fabric/fabric-metadata-reader";
import { ForgeMetadataReader } from "./forge/forge-metadata-reader";
import { LoaderMetadata } from "./loader-metadata";
import { LoaderType } from "./loader-type";
import { QuiltMetadataReader } from "./quilt/quilt-metadata-reader";
import { NeoForgeMetadataReader } from "./neoforge/neoforge-metadata-reader";

/**
 * Defines a structure for reading metadata files.
 *
 * @template T - The type of the metadata this reader is able to process.
 */
export interface LoaderMetadataReader<T extends LoaderMetadata = LoaderMetadata> {
    /**
     * Reads the metadata file from a given path.
     *
     * @param path - The path to the metadata file.
     *
     * @returns The metadata object.
     *
     * @throws {Error} - If the file cannot be read.
     */
    readMetadataFile(path: PathLike): Promise<T>;
}

/**
 * Combines multiple metadata readers into a single reader
 * that tries each reader in order until one successfully reads the metadata.
 *
 * @param readers - A collection of metadata readers to be combined.
 *
 * @returns A new metadata reader instance that represents the combined readers.
 */
export function combineLoaderMetadataReaders(readers: Iterable<LoaderMetadataReader>): LoaderMetadataReader {
    const readerArray = [...readers];

    const readMetadataFile = async (path: PathLike) => {
        for (const reader of readerArray) {
            const metadata = await reader.readMetadataFile(path).catch(() => undefined as LoaderMetadata);
            if (metadata) {
                return metadata;
            }
        }
        throw new Error(`Unable to read metadata from the file located at: '${path}'`);
    };

    return { readMetadataFile };
}

/**
 * Creates a metadata reader for the specified well-known loader.
 *
 * @param loader - The loader the metadata for which needs to be read.
 *
 * @returns A metadata reader for the given loader.
 */
export function createLoaderMetadataReader(loader: LoaderType): LoaderMetadataReader {
    switch (loader) {
        case LoaderType.FABRIC:
            return new FabricMetadataReader();

        case LoaderType.FORGE:
            return new ForgeMetadataReader();

        case LoaderType.QUILT:
            return new QuiltMetadataReader();

        case LoaderType.NEOFORGE:
            return new NeoForgeMetadataReader();

        default:
            throw new Error(`Unknown mod loader '${LoaderType.format(loader)}'.`);
    }
}

/**
 * Creates a metadata reader that is a combination of readers for all known loaders.
 *
 * @returns A metadata reader that can read metadata from all known loaders.
 */
export function createDefaultLoaderMetadataReader(): LoaderMetadataReader {
    return combineLoaderMetadataReaders($i(LoaderType.values()).map(createLoaderMetadataReader));
}
