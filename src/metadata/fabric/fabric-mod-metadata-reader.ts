import ZippedModTextMetadataReader from "../zipped-mod-text-metadata-reader";
import FabricModConfig from "./fabric-mod-config";
import FabricModMetadata from "./fabric-mod-metadata";

class FabricModMetadataReader extends ZippedModTextMetadataReader<FabricModConfig> {
    constructor() {
        super(FabricModConfig.FILENAME, x => new FabricModMetadata(x));
    }
}

export default FabricModMetadataReader;
