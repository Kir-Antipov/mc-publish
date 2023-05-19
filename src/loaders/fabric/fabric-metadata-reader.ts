import { ZippedTextLoaderMetadataReader } from "@/loaders/zipped-loader-metadata-reader";
import { FabricMetadata } from "./fabric-metadata";
import { FABRIC_MOD_JSON, RawFabricMetadata } from "./raw-fabric-metadata";

/**
 * A metadata reader that is able to read Fabric mod metadata from a zipped file.
 */
export class FabricMetadataReader extends ZippedTextLoaderMetadataReader<FabricMetadata, RawFabricMetadata> {
    /**
     * Constructs a new {@link FabricMetadataReader} instance.
     */
    constructor() {
        super(FABRIC_MOD_JSON, FabricMetadata.from, JSON.parse);
    }
}
