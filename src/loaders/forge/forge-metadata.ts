import { Dependency } from "@/dependencies";
import { MINECRAFT } from "@/games/minecraft";
import { LoaderMetadata } from "@/loaders/loader-metadata";
import { PlatformType } from "@/platforms";
import { $i } from "@/utils/collections";
import { asString } from "@/utils/string-utils";
import { getForgeDependencies, normalizeForgeDependency } from "./forge-dependency";
import { ForgeMetadataCustomPayload, getDependenciesFromForgeMetadataCustomPayload, getForgeMetadataCustomPayload, getLoadersFromForgeMetadataCustomPayload, getProjectIdFromForgeMetadataCustomPayload } from "./forge-metadata-custom-payload";
import { ForgeMod } from "./forge-mod";
import { RawForgeMetadata } from "./raw-forge-metadata";

/**
 * Represents Forge mod metadata.
 */
export class ForgeMetadata implements LoaderMetadata {
    /**
     * The raw Forge metadata used to create this instance.
     */
    private readonly _raw: RawForgeMetadata;

    /**
     * Constructs a new {@link ForgeMetadata} instance.
     *
     * @param raw - The raw Forge metadata.
     */
    private constructor(raw: RawForgeMetadata) {
        this._raw = raw || {} as RawForgeMetadata;
    }

    /**
     * Creates a new {@link ForgeMetadata} instance from the given raw metadata.
     *
     * @param raw - The raw Forge metadata.
     *
     * @returns A new `ForgeMetadata` instance.
     */
    static from(raw: RawForgeMetadata): ForgeMetadata {
        return new ForgeMetadata(raw);
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
        return getLoadersFromForgeMetadataCustomPayload(this._raw);
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
        const baseDependencies = getForgeDependencies(this._raw).map(normalizeForgeDependency).filter(x => x);
        const payloadDependencies = getDependenciesFromForgeMetadataCustomPayload(this.customPayload);
        const dependencyMap = $i(baseDependencies).concat(payloadDependencies).filter(x => x).map(x => [x.id, x] as const).toMap();
        return [...dependencyMap.values()];
    }

    /**
     * The mod represented by this metadata.
     */
    get mod(): ForgeMod {
        return this._raw.mods?.[0] || {} as ForgeMod;
    }

    /**
     * The raw Forge metadata representing this instance.
     */
    get raw(): RawForgeMetadata {
        return this._raw;
    }

    /**
     * The custom payload attached to the Forge metadata.
     */
    get customPayload(): ForgeMetadataCustomPayload {
        return getForgeMetadataCustomPayload(this._raw);
    }

    /**
     * @inheritdoc
     */
    getProjectId(platform: PlatformType): string {
        return getProjectIdFromForgeMetadataCustomPayload(this.customPayload, platform) || this.id;
    }
}
