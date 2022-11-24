import ModMetadata from "./mod-metadata";
import ZippedModMetadataReader from "./zipped-mod-metadata-reader";

type ModMetadataFactory<T> = (config: T) => ModMetadata;

type Parser<T> = (input: string) => T;

abstract class ZippedModTextMetadataReader<TConfig = Record<string, unknown>> extends ZippedModMetadataReader<TConfig> {
    private readonly _factory: ModMetadataFactory<TConfig>;
    private readonly _parser: Parser<TConfig>;

    protected constructor(configEntryName: string, factory: ModMetadataFactory<TConfig>, parser?: Parser<any>) {
        super(configEntryName);
        this._factory = factory;
        this._parser = parser ?? JSON.parse;
    }

    protected loadConfig(buffer: Buffer): TConfig {
        return this._parser(buffer.toString("utf8"));
    }

    protected createMetadataFromConfig(config: TConfig): ModMetadata {
        return this._factory(config);
    }
}

export default ZippedModTextMetadataReader;
