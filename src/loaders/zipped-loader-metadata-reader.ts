import { Awaitable } from "@/utils/types";
import { StreamZipAsync, async as ZipArchive } from "node-stream-zip";
import { PathLike } from "node:fs";
import { LoaderMetadata } from "./loader-metadata";
import { LoaderMetadataReader } from "./loader-metadata-reader";

/**
 * Provides a base for reading metadata from zipped files for various loaders.
 *
 * @template TMetadata - Represents the processed metadata object.
 * @template TRawMetadata - Represents the raw metadata object to be transformed.
 */
export abstract class ZippedLoaderMetadataReader<TMetadata extends LoaderMetadata, TRawMetadata> implements LoaderMetadataReader<TMetadata> {
    /**
     * The name of the entry inside the zipped file to read.
     */
    private readonly _entry: string;

    /**
     * Constructs a new {@link ZippedLoaderMetadataReader} instance.
     *
     * @param entry - The name of the entry inside the zipped file to read.
     */
    protected constructor(entry: string) {
        this._entry = entry;
    }

    /**
     * Reads the metadata file from a zipped file at the given path.
     *
     * @param path - The path to the zipped file.
     *
     * @returns The metadata object, or `undefined` if the zipped file cannot be read.
     */
    async readMetadataFile(path: PathLike): Promise<TMetadata | undefined> {
        let zip = undefined as StreamZipAsync;
        try {
            zip = new ZipArchive({ file: path as string });
            const buffer = await zip.entryData(this._entry);
            if (!buffer) {
                return undefined;
            }

            const rawMetadata = await this.readRawMetadata(buffer);
            return await this.createMetadata(rawMetadata);
        } catch {
            return undefined;
        } finally {
            await zip?.close().catch(() => undefined);
        }
    }

    /**
     * Reads the raw metadata from a buffer.
     *
     * @param buffer - The buffer containing the raw metadata.
     *
     * @returns The raw metadata object.
     */
    protected abstract readRawMetadata(buffer: Buffer): Promise<TRawMetadata>;

    /**
     * Creates a metadata object from the raw metadata.
     *
     * @param config - The raw metadata object.
     *
     * @returns The metadata object.
     */
    protected abstract createMetadata(config: TRawMetadata): Promise<TMetadata>;
}

/**
 * Provides a base for reading metadata from text-based files within zipped files.
 *
 * @template TMetadata - Represents the processed metadata object.
 * @template TRawMetadata - Represents the raw metadata object to be transformed.
 */
export abstract class ZippedTextLoaderMetadataReader<TMetadata extends LoaderMetadata, TRawMetadata> extends ZippedLoaderMetadataReader<TMetadata, TRawMetadata> {
    /**
     * A function to transform the raw metadata into a processed metadata object.
     */
    private readonly _factory: (raw: TRawMetadata) => Awaitable<TMetadata>;

    /**
     * A function to parse the text content into a raw metadata object.
     */
    private readonly _parser: (text: string) => Awaitable<TRawMetadata>;

    /**
     * Constructs a new {@link ZippedTextLoaderMetadataReader} instance.
     *
     * @param entry - The name of the entry inside the zipped file to read.
     * @param factory - A function to transform the raw metadata into a processed metadata object.
     * @param parser - A function to parse the text content into a raw metadata object.
     */
    protected constructor(entry: string, factory: (raw: TRawMetadata) => Awaitable<TMetadata>, parser: (text: string) => Awaitable<TRawMetadata>) {
        super(entry);
        this._factory = factory;
        this._parser = parser;
    }

    /**
     * @inheritdoc
     */
    protected async readRawMetadata(buffer: Buffer): Promise<TRawMetadata> {
        return await this._parser(buffer.toString());
    }

    /**
     * @inheritdoc
     */
    protected async createMetadata(config: TRawMetadata): Promise<TMetadata> {
        return await this._factory(config);
    }
}
