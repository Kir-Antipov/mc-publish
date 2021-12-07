import ModConfig from "../../metadata/mod-config";
import ModConfigDependency from "../../metadata/mod-config-dependency";
import Dependency from "../../metadata/dependency";
import DependencyKind from "../../metadata/dependency-kind";

function createDependency(body: any): Dependency {
    return new ModConfigDependency({
        ...body,
        id: body.modId,
        version: body.versionRange,
        kind: body.incompatible && DependencyKind.Breaks || body.embedded && DependencyKind.Includes || body.mandatory && DependencyKind.Depends || DependencyKind.Recommends
    });
}

export default class ForgeModMetadata extends ModConfig {
    public readonly id: string;
    public readonly name: string;
    public readonly version: string;
    public readonly loaders: string[];
    public readonly dependencies: Dependency[];

    constructor(config: Record<string, unknown>) {
        super(config);
        const mods = Array.isArray(this.config.mods) && <any[]>this.config.mods || [];
        const mod = mods[0];
        if (!mod) {
            throw new Error("At least one mod should be specified");
        }

        this.id = mod.modId;
        this.name = mod.displayName || this.id;
        this.version = mod.version || "*";
        this.loaders = ["forge"];
        this.dependencies = Object
            .values(this.config.dependencies || {})
            .filter(Array.isArray)
            .flatMap(x => x)
            .map(createDependency)
            .filter((x, i, self) => self.findIndex(y => x.id === y.id && x.kind === y.kind) === i);
    }
}
