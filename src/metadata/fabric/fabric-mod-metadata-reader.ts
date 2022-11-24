import ModMetadata from "../mod-metadata";
import ZippedModMetadataReader from "../zipped-mod-metadata-reader";
import FabricModConfig from "./fabric-mod-config";
import FabricModMetadata from "./fabric-mod-metadata";

class FabricModMetadataReader extends ZippedModMetadataReader<FabricModConfig> {
    constructor() {
        super(FabricModConfig.FILENAME);
    }

    protected loadConfig(buffer: Buffer): FabricModConfig {
        return JSON.parse(buffer.toString("utf8"));
    }

    protected createMetadataFromConfig(config: FabricModConfig): ModMetadata {
        return new FabricModMetadata(config);
    }
}

export default FabricModMetadataReader;
