import FabricModMetadataReader from "./fabric/fabric-mod-metadata-reader";
import ModLoaderType from "./mod-loader-type";
import ModMetadataReader from "./mod-metadata-reader";

export default class ModMetadataReaderFactory {
    public create(loaderType: ModLoaderType): ModMetadataReader {
        switch (loaderType) {
            case ModLoaderType.Fabric:
                return new FabricModMetadataReader();

            default:
                throw new Error(`Unknown mod loader "${ModLoaderType.toString(loaderType)}"`);
        }
    }
}
