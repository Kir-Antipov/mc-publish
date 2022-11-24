import ModMetadata from "./mod-metadata";
import ModMetadataReader from "./mod-metadata-reader";
import { StreamZipAsync, async as ZipArchive } from "node-stream-zip";

abstract class ZippedModMetadataReader<TConfig = Record<string, unknown>> implements ModMetadataReader {
    private _configEntryName: string;

    protected constructor(configEntryName: string) {
        this._configEntryName = configEntryName;
    }

    async readMetadata(modPath: string): Promise<ModMetadata | null> {
        let zip = null as StreamZipAsync;
        try {
            zip = new ZipArchive({ file: modPath });
            const buffer = await zip.entryData(this._configEntryName).catch(_ => null as Buffer);
            return buffer && this.createMetadataFromConfig(this.loadConfig(buffer));
        } catch {
            return null;
        } finally {
            await zip?.close();
        }
    }

    protected abstract loadConfig(buffer: Buffer): TConfig;

    protected abstract createMetadataFromConfig(config: TConfig): ModMetadata;
}

export default ZippedModMetadataReader;
