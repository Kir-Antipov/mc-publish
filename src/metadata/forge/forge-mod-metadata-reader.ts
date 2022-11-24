import ModMetadata from "../mod-metadata";
import toml from "toml";
import ZippedModMetadataReader from "../zipped-mod-metadata-reader";
import ForgeModMetadata from "./forge-mod-metadata";
import ForgeModConfig from "./forge-mod-config";

class ForgeModMetadataReader extends ZippedModMetadataReader<ForgeModConfig> {
    constructor() {
        super(ForgeModConfig.FILENAME);
    }

    protected loadConfig(buffer: Buffer): ForgeModConfig {
        return toml.parse(buffer.toString("utf8"));
    }

    protected createMetadataFromConfig(config: ForgeModConfig): ModMetadata {
        return new ForgeModMetadata(config);
    }
}

export default ForgeModMetadataReader;
