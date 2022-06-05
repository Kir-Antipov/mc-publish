import ModMetadata from "../../metadata/mod-metadata";
import ZippedModMetadataReader from "../../metadata/zipped-mod-metadata-reader";
import QuiltModMetadata from "./quilt-mod-metadata";

export default class QuiltModMetadataReader extends ZippedModMetadataReader {
    constructor() {
        super("quilt.mod.json");
    }

    protected loadConfig(buffer: Buffer): Record<string, unknown> {
        return JSON.parse(buffer.toString("utf8"));
    }

    protected createMetadataFromConfig(config: Record<string, unknown>): ModMetadata {
        return new QuiltModMetadata(config);
    }
}
