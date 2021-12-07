import ModLoaderType from "./mod-loader-type";
import ModMetadata from "./mod-metadata";
import ModMetadataReaderFactory from "./mod-metadata-reader-factory";

interface ModMetadataReader {
    readMetadata(modPath: string): Promise<ModMetadata | null>;
}

namespace ModMetadataReader {
    export async function readMetadata(modPath: string): Promise<ModMetadata | null> {
        const factory = new ModMetadataReaderFactory();
        for (const loaderType of ModLoaderType.getValues()) {
            const metadata = await factory.create(loaderType).readMetadata(modPath).catch(_ => null);
            if (metadata) {
                return metadata;
            }
        }
        return null;
    }
}

export default ModMetadataReader;
