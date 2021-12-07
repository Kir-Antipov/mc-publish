import ModMetadata from "../../metadata/mod-metadata";
import toml from "toml";
import ZippedModMetadataReader from "../../metadata/zipped-mod-metadata-reader";
import ForgeModMetadata from "./forge-mod-metadata";

export default class ForgeModMetadataReader extends ZippedModMetadataReader {
    constructor() {
        super("META-INF/mods.toml");
    }

    protected loadConfig(buffer: Buffer): Record<string, unknown> {
        return toml.parse(buffer.toString("utf8"));
    }

    protected createMetadataFromConfig(config: Record<string, unknown>): ModMetadata {
        return new ForgeModMetadata(config);
    }
}
