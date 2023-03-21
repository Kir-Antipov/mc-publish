import { ZippedTextLoaderMetadataReader } from "@/loaders/zipped-loader-metadata-reader";
import { QuiltMetadata } from "./quilt-metadata";
import { QUILT_MOD_JSON, RawQuiltMetadata } from "./raw-quilt-metadata";
/**
 * A metadata reader that is able to read Quilt mod metadata from a zipped file.
 */
export class QuiltMetadataReader extends ZippedTextLoaderMetadataReader<QuiltMetadata, RawQuiltMetadata> {
    /**
     * Constructs a new {@link QuiltMetadataReader} instance.
     */
    constructor() {
        super(QUILT_MOD_JSON, QuiltMetadata.from, JSON.parse);
    }
}
