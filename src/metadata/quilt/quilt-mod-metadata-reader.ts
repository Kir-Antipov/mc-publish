import ModMetadata from "../mod-metadata";
import ZippedModMetadataReader from "../zipped-mod-metadata-reader";
import QuiltModConfig from "./quilt-mod-config";
import QuiltModMetadata from "./quilt-mod-metadata";

class QuiltModMetadataReader extends ZippedModMetadataReader<QuiltModConfig> {
    constructor() {
        super(QuiltModConfig.FILENAME);
    }

    protected loadConfig(buffer: Buffer): QuiltModConfig {
        return JSON.parse(buffer.toString("utf8"));
    }

    protected createMetadataFromConfig(config: QuiltModConfig): ModMetadata {
        return new QuiltModMetadata(config);
    }
}

export default QuiltModMetadataReader;
