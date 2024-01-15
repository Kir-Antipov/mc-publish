import { PathLike } from "node:fs";
import { parse as parseToml } from "toml";
import { readAllZippedText } from "@/utils/io/file-info";
import { LoaderType } from "../loader-type";
import { LoaderMetadataReader } from "../loader-metadata-reader";
import { NeoForgeMetadata } from "./neoforge-metadata";
import { MODS_TOML } from "./raw-neoforge-metadata";

/**
 * A metadata reader that is able to read NeoForge mod metadata from a zipped file.
 */
export class NeoForgeMetadataReader implements LoaderMetadataReader<NeoForgeMetadata> {
    /**
     * @inheritdoc
     */
    async readMetadataFile(path: PathLike): Promise<NeoForgeMetadata> {
        const metadataText = await readAllZippedText(path, MODS_TOML);
        const metadata = NeoForgeMetadata.from(parseToml(metadataText));
        if (!metadata.dependencies.some(x => x.id === LoaderType.NEOFORGE)) {
            throw new Error("A NeoForge metadata file must contain a 'neoforge' dependency");
        }

        return metadata;
    }
}
