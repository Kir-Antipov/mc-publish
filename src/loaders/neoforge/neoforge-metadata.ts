import { Dependency } from "@/dependencies";
import { MINECRAFT } from "@/games/minecraft";
import { LoaderMetadata } from "@/loaders/loader-metadata";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { asString } from "@/utils/string-utils";
import { getNeoForgeDependencies, normalizeNeoForgeDependency } from "./neoforge-dependency";
import { NeoForgeMetadataCustomPayload, getDependenciesFromNeoForgeMetadataCustomPayload, getNeoForgeMetadataCustomPayload, getLoadersFromNeoForgeMetadataCustomPayload, getProjectIdFromNeoForgeMetadataCustomPayload } from "./neoforge-metadata-custom-payload";
import { NeoForgeMod } from "./neoforge-mod";
import { RawNeoForgeMetadata } from "./raw-neoforge-metadata";

/**
 * Represents NeoForge mod metadata.
 */
export class NeoForgeMetadata implements LoaderMetadata {
    /**
     * The raw NeoForge metadata used to create this instance.
     */
    private readonly _raw: RawNeoForgeMetadata;

    /**
     * Constructs a new {@link NeoForgeMetadata} instance.
     *
     * @param raw - The raw NeoForge metadata.
     */
    private constructor(raw: RawNeoForgeMetadata) {
        this._raw = raw || {} as RawNeoForgeMetadata;
    }

    /**
     * Creates a new {@link NeoForgeMetadata} instance from the given raw metadata.
     *
     * @param raw - The raw NeoForge metadata.
     *
     * @returns A new `NeoForgeMetadata` instance.
     */
    static from(raw: RawNeoForgeMetadata): NeoForgeMetadata {
        return new NeoForgeMetadata(raw);
    }

    /**
     * @inheritdoc
     */
    get id(): string {
        return asString(this.mod.modId || "");
    }

    /**
     * @inheritdoc
     */
    get name(): string {
        return asString(this.mod.displayName || this.mod.modId || "");
    }

    /**
     * @inheritdoc
     */
    get version(): string {
        return asString(this.mod.version || "*");
    }

    /**
     * @inheritdoc
     */
    get loaders(): string[] {
        return getLoadersFromNeoForgeMetadataCustomPayload(this._raw);
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
        const baseDependencies = getNeoForgeDependencies(this._raw).map(normalizeNeoForgeDependency).filter(x => x);
        const payloadDependencies = getDependenciesFromNeoForgeMetadataCustomPayload(this.customPayload);
        const dependencyMap = $i(baseDependencies).concat(payloadDependencies).filter(x => x).map(x => [x.id, x] as const).toMap();
        return [...dependencyMap.values()];
    }

    /**
     * The mod represented by this metadata.
     */
    get mod(): NeoForgeMod {
        return this._raw.mods?.[0] || {} as NeoForgeMod;
    }

    /**
     * The raw NeoForge metadata representing this instance.
     */
    get raw(): RawNeoForgeMetadata {
        return this._raw;
    }

    /**
     * The custom payload attached to the NeoForge metadata.
     */
    get customPayload(): NeoForgeMetadataCustomPayload {
        return getNeoForgeMetadataCustomPayload(this._raw);
    }

    /**
     * @inheritdoc
     */
    getProjectId(platform: PlatformType): string {
        return getProjectIdFromNeoForgeMetadataCustomPayload(this.customPayload, platform) || this.id;
    }
}
