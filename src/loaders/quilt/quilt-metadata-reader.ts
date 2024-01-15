import { PathLike } from "node:fs";
import { readAllZippedText } from "@/utils/io/file-info";
import { LoaderMetadataReader } from "../loader-metadata-reader";
import { QuiltMetadata } from "./quilt-metadata";
import { QUILT_MOD_JSON } from "./raw-quilt-metadata";

/**
 * A metadata reader that is able to read Quilt mod metadata from a zipped file.
 */
export class QuiltMetadataReader implements LoaderMetadataReader<QuiltMetadata> {
    /**
     * @inheritdoc
     */
    async readMetadataFile(path: PathLike): Promise<QuiltMetadata> {
        const metadataText = await readAllZippedText(path, QUILT_MOD_JSON);
        return QuiltMetadata.from(JSON.parse(metadataText));
    }
}
