import ModMetadata from "./mod-metadata";
import ModMetadataReader from "./mod-metadata-reader";
import { StreamZipAsync, async as ZipArchive } from "node-stream-zip";

export default abstract class ZippedModMetadataReader<TConfig = Record<string, unknown>> implements ModMetadataReader {
    private configEntryName: string;

    protected constructor(configEntryName: string) {
        this.configEntryName = configEntryName;
    }

    async readMetadata(modPath: string): Promise<ModMetadata | null> {
        let zip = <StreamZipAsync>null;
        try {
            zip = new ZipArchive({ file: modPath });
            const buffer = await zip.entryData(this.configEntryName).catch(_ => <Buffer>null);
            if (buffer) {
                return this.createMetadataFromConfig(this.loadConfig(buffer));
            } else {
                return null;
            }
        } catch {
            return null;
        } finally {
            await zip?.close();
        }
    }

    protected abstract loadConfig(buffer: Buffer): TConfig;

    protected abstract createMetadataFromConfig(config: TConfig): ModMetadata;
}
