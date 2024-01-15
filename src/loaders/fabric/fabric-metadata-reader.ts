import { PathLike } from "node:fs";
import { readAllZippedText } from "@/utils/io/file-info";
import { LoaderMetadataReader } from "../loader-metadata-reader";
import { FabricMetadata } from "./fabric-metadata";
import { FABRIC_MOD_JSON } from "./raw-fabric-metadata";

/**
 * A metadata reader that is able to read Fabric mod metadata from a zipped file.
 */
export class FabricMetadataReader implements LoaderMetadataReader<FabricMetadata> {
    /**
     * @inheritdoc
     */
    async readMetadataFile(path: PathLike): Promise<FabricMetadata> {
        const metadataText = await readAllZippedText(path, FABRIC_MOD_JSON);
        return FabricMetadata.from(JSON.parse(metadataText));
    }
}
