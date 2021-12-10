import action from "../../../package.json";
import ModConfig from "../../metadata/mod-config";
import ModConfigDependency from "../../metadata/mod-config-dependency";
import Dependency from "../../metadata/dependency";
import DependencyKind from "../../metadata/dependency-kind";
import PublisherTarget from "../../publishing/publisher-target";

const ignoredByDefault = ["minecraft", "java", "fabricloader"];
const aliases = new Map([
    ["fabric", "fabric-api"]
]);
function getDependenciesByKind(config: any, kind: DependencyKind): Dependency[] {
    const kindName = DependencyKind.toString(kind).toLowerCase();
    const dependencies = new Array<Dependency>();
    for (const [id, value] of Object.entries(config[kindName] || {})) {
        const ignore = ignoredByDefault.includes(id);
        if (typeof value === "string") {
            const dependencyAliases = aliases.has(id) ? new Map(PublisherTarget.getValues().map(x => [x, aliases.get(id)])) : null;
            dependencies.push(Dependency.create({ id, kind, version: value, ignore, aliases: dependencyAliases }));
        } else {
            const dependencyMetadata = { ignore, ...<any>value, id, kind };
            if (aliases.has(id)) {
                if (!dependencyMetadata.custom) {
                    dependencyMetadata.custom = {};
                }
                if (!dependencyMetadata.custom[action.name]) {
                    dependencyMetadata.custom[action.name] = {};
                }
                for (const target of PublisherTarget.getValues()) {
                    const targetName = PublisherTarget.toString(target).toLowerCase();
                    if (typeof dependencyMetadata.custom[action.name][targetName] !== "string") {
                        dependencyMetadata.custom[action.name][targetName] = aliases.get(id);
                    }
                }
            }
            dependencies.push(new ModConfigDependency(dependencyMetadata));
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
