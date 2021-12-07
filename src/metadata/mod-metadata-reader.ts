import ModMetadata from "./mod-metadata";

interface ModMetadataReader {
    readMetadata(modPath: string): Promise<ModMetadata | null>;
}

export default ModMetadataReader;
