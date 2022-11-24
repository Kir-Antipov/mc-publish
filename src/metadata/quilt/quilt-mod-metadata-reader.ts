import ZippedModTextMetadataReader from "../zipped-mod-text-metadata-reader";
import QuiltModConfig from "./quilt-mod-config";
import QuiltModMetadata from "./quilt-mod-metadata";

class QuiltModMetadataReader extends ZippedModTextMetadataReader<QuiltModConfig> {
    constructor() {
        super(QuiltModConfig.FILENAME, x => new QuiltModMetadata(x));
    }
}

export default QuiltModMetadataReader;
