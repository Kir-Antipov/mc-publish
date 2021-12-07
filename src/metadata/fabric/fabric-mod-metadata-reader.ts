import ModMetadata from "../../metadata/mod-metadata";
import ZippedModMetadataReader from "../../metadata/zipped-mod-metadata-reader";
import FabricModMetadata from "./fabric-mod-metadata";

export default class FabricModMetadataReader extends ZippedModMetadataReader {
    constructor() {
        super("fabric.mod.json");
    }

    protected loadConfig(buffer: Buffer): Record<string, unknown> {
        return JSON.parse(buffer.toString("utf8"));
    }

    protected createMetadataFromConfig(config: Record<string, unknown>): ModMetadata {
        return new FabricModMetadata(config);
    }
}
