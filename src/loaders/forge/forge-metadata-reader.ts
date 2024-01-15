import { PathLike } from "node:fs";
import { parse as parseToml } from "toml";
import { readAllZippedText } from "@/utils/io/file-info";
import { LoaderMetadataReader } from "../loader-metadata-reader";
import { ForgeMetadata } from "./forge-metadata";
import { MODS_TOML } from "./raw-forge-metadata";

/**
 * A metadata reader that is able to read Forge mod metadata from a zipped file.
 */
export class ForgeMetadataReader implements LoaderMetadataReader<ForgeMetadata> {
    /**
     * @inheritdoc
     */
    async readMetadataFile(path: PathLike): Promise<ForgeMetadata> {
        const metadataText = await readAllZippedText(path, MODS_TOML);
        return ForgeMetadata.from(parseToml(metadataText));
    }
}
