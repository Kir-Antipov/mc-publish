import ModConfig from "../../metadata/mod-config";
import ModConfigDependency from "../../metadata/mod-config-dependency";
import Dependency from "../../metadata/dependency";
import DependencyKind from "../../metadata/dependency-kind";
import PublisherTarget from "../../publishing/publisher-target";

function getDependenciesByKind(config: any, kind: DependencyKind): Dependency[] {
    const kindName = DependencyKind.toString(kind).toLowerCase();
    const dependencies = new Array<Dependency>();
    for (const [id, value] of Object.entries(config[kindName] || {})) {
        if (typeof value === "string") {
            dependencies.push(Dependency.create({ id, kind, version: value }));
        } else {
            dependencies.push(new ModConfigDependency({ ...<any>value, id, kind }));
        }
    }
    return dependencies;
}

export default class FabricModMetadata extends ModConfig {
    public readonly id: string;
    public readonly name: string;
    public readonly version: string;
    public readonly loaders: string[];
    public readonly dependencies: Dependency[];

    constructor(config: Record<string, unknown>) {
        super(config);
        this.id = String(this.config.id ?? "");
        this.name = String(this.config.name ?? this.id);
        this.version = String(this.config.version ?? "*");
        this.loaders = ["fabric"];
        this.dependencies = DependencyKind.getValues().flatMap(x => getDependenciesByKind(this.config, x));
    }

    getProjectId(project: PublisherTarget): string | undefined {
        const projectId = super.getProjectId(project);
        if (projectId) {
            return projectId;
        }

        const projectName = PublisherTarget.toString(project).toLowerCase();
        const custom = <any>this.config.custom;
        const modManagerProjectId = custom?.modmanager?.[projectName]?.id ?? custom?.modmanager?.[projectName];
        return modManagerProjectId === undefined ? modManagerProjectId : String(modManagerProjectId);
    }
}
