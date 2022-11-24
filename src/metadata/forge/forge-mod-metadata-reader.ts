import toml from "toml";
import ZippedModTextMetadataReader from "../zipped-mod-text-metadata-reader";
import ForgeModMetadata from "./forge-mod-metadata";
import ForgeModConfig from "./forge-mod-config";

class ForgeModMetadataReader extends ZippedModTextMetadataReader<ForgeModConfig> {
    constructor() {
        super(ForgeModConfig.FILENAME, x => new ForgeModMetadata(x), toml.parse);
    }
}

export default ForgeModMetadataReader;
