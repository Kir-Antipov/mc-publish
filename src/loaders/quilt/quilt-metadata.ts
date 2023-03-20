import { Dependency } from "@/dependencies";
import { MINECRAFT } from "@/games/minecraft";
import { LoaderMetadata } from "@/loaders/loader-metadata";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { asString } from "@/utils/string-utils";
import { getQuiltDependencies, normalizeQuiltDependency } from "./quilt-dependency";
import { QuiltMetadataCustomPayload, getDependenciesFromQuiltMetadataCustomPayload, getLoadersFromQuiltMetadataCustomPayload, getProjectIdFromQuiltMetadataCustomPayload, getQuiltMetadataCustomPayload } from "./quilt-metadata-custom-payload";
import { RawQuiltMetadata } from "./raw-quilt-metadata";

/**
 * Represents Quilt mod metadata.
 */
export class QuiltMetadata implements LoaderMetadata {
    /**
     * The raw Quilt metadata used to create this instance.
     */
    private readonly _raw: RawQuiltMetadata;

    /**
     * Constructs a new {@link QuiltMetadata} instance.
     *
     * @param raw - The raw Quilt metadata.
     */
    private constructor(raw: RawQuiltMetadata) {
        this._raw = raw || {} as RawQuiltMetadata;
    }

    /**
     * Creates a new {@link QuiltMetadata} instance from the given raw metadata.
     *
     * @param raw - The raw Quilt metadata.
     *
     * @returns A new `QuiltMetadata` instance.
     */
    static from(raw: RawQuiltMetadata): QuiltMetadata {
        return new QuiltMetadata(raw);
    }

    /**
     * @inheritdoc
     */
    get id(): string {
        const id = asString(this._raw.quilt_loader?.id || "");
        return id.includes(":") ? id.substring(id.indexOf(":") + 1) : id;
    }

    /**
     * @inheritdoc
     */
    get name(): string {
        return asString(this._raw.quilt_loader?.metadata?.name || this.id);
    }

    /**
     * @inheritdoc
     */
    get version(): string {
        return asString(this._raw.quilt_loader?.version || "*");
    }

    /**
     * @inheritdoc
     */
    get loaders(): string[] {
        return getLoadersFromQuiltMetadataCustomPayload(this.customPayload);
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
        const baseDependencies = getQuiltDependencies(this._raw).map(normalizeQuiltDependency).filter(x => x);
        const payloadDependencies = getDependenciesFromQuiltMetadataCustomPayload(this.customPayload);
        const dependencyMap = $i(baseDependencies).concat(payloadDependencies).filter(x => x).map(x => [x.id, x] as const).toMap();
        return [...dependencyMap.values()];
    }

    /**
     * The raw Quilt metadata representing this instance.
     */
    get raw(): RawQuiltMetadata {
        return this._raw;
    }

    /**
     * The custom payload attached to the Quilt metadata.
     */
    get customPayload(): QuiltMetadataCustomPayload {
        return getQuiltMetadataCustomPayload(this._raw);
    }

    /**
     * @inheritdoc
     */
    getProjectId(platform: PlatformType): string {
        return getProjectIdFromQuiltMetadataCustomPayload(this.customPayload, platform) || this.id;
    }
}
