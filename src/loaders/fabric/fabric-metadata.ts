import { Dependency } from "@/dependencies";
import { MINECRAFT } from "@/games/minecraft";
import { LoaderMetadata } from "@/loaders/loader-metadata";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { asString } from "@/utils/string-utils";
import { getFabricDependencies, normalizeFabricDependency } from "./fabric-dependency";
import { FabricMetadataCustomPayload, getDependenciesFromFabricMetadataCustomPayload, getFabricMetadataCustomPayload, getLoadersFromFabricMetadataCustomPayload, getProjectIdFromFabricMetadataCustomPayload } from "./fabric-metadata-custom-payload";
import { RawFabricMetadata } from "./raw-fabric-metadata";

/**
 * Represents Fabric mod metadata.
 */
export class FabricMetadata implements LoaderMetadata {
    /**
     * The raw Fabric metadata used to create this instance.
     */
    private readonly _raw: RawFabricMetadata;

    /**
     * Constructs a new {@link FabricMetadata} instance.
     *
     * @param raw - The raw Fabric metadata.
     */
    private constructor(raw: RawFabricMetadata) {
        this._raw = raw || {} as RawFabricMetadata;
    }

    /**
     * Creates a new {@link FabricMetadata} instance from the given raw metadata.
     *
     * @param raw - The raw Fabric metadata.
     *
     * @returns A new `FabricMetadata` instance.
     */
    static from(raw: RawFabricMetadata): FabricMetadata {
        return new FabricMetadata(raw);
    }

    /**
     * @inheritdoc
     */
    get id(): string {
        return asString(this._raw.id || "");
    }

    /**
     * @inheritdoc
     */
    get name(): string {
        return asString(this._raw.name || this._raw.id || "");
    }

    /**
     * @inheritdoc
     */
    get version(): string {
        return asString(this._raw.version || "*");
    }

    /**
     * @inheritdoc
     */
    get loaders(): string[] {
        return getLoadersFromFabricMetadataCustomPayload(this.customPayload);
    }

    /**
     * @inheritdoc
     */
    get gameName(): string {
        return MINECRAFT;
    }

    /**
     * @inheritdoc
     */
    get gameVersions(): string[] {
        return [...(this.dependencies.find(x => x.id === this.gameName)?.versions || [])];
    }

    /**
     * @inheritdoc
     */
    get dependencies(): Dependency[] {
        const baseDependencies = getFabricDependencies(this._raw).map(normalizeFabricDependency).filter(x => x);
        const payloadDependencies = getDependenciesFromFabricMetadataCustomPayload(this.customPayload);
        const dependencyMap = $i(baseDependencies).concat(payloadDependencies).filter(x => x).map(x => [x.id, x] as const).toMap();
        return [...dependencyMap.values()];
    }

    /**
     * The raw Fabric metadata representing this instance.
     */
    get raw(): RawFabricMetadata {
        return this._raw;
    }

    /**
     * The custom payload attached to the Fabric metadata.
     */
    get customPayload(): FabricMetadataCustomPayload {
        return getFabricMetadataCustomPayload(this._raw);
    }

    /**
     * @inheritdoc
     */
    getProjectId(platform: PlatformType): string {
        return getProjectIdFromFabricMetadataCustomPayload(this.customPayload, platform) || this.id;
    }
}
