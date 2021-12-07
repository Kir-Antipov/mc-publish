import ModLoaderType from "./mod-loader-type";
import ModMetadataReader from "./mod-metadata-reader";

export default class ModMetadataReaderFactory {
    public create(loaderType: ModLoaderType): ModMetadataReader {
        switch (loaderType) {
            default:
                throw new Error(`Unknown mod loader "${ModLoaderType.toString(loaderType)}"`);
        }
    }
}
