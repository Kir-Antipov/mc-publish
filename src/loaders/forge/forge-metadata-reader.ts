import { parse as parseToml } from "toml";
import { ZippedTextLoaderMetadataReader } from "@/loaders/zipped-loader-metadata-reader";
import { MODS_TOML, RawForgeMetadata } from "./raw-forge-metadata";
import { ForgeMetadata } from "./forge-metadata";

/**
 * A metadata reader that is able to read Forge mod metadata from a zipped file.
 */
export class ForgeMetadataReader extends ZippedTextLoaderMetadataReader<ForgeMetadata, RawForgeMetadata> {
    /**
     * Constructs a new {@link ForgeMetadataReader} instance.
     */
    constructor() {
        super(MODS_TOML, ForgeMetadata.from, parseToml);
    }
}
