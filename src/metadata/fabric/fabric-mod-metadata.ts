import action from "../../../package.json";
import Dependency from "../dependency";
import DependencyKind from "../dependency-kind";
import PublisherTarget from "../../publishing/publisher-target";
import FabricModConfig from "./fabric-mod-config";
import ModMetadata from "../mod-metadata";

type Aliases = Map<PublisherTarget, string>;

type FabricDependency = FabricModConfig["depends"][string];

function getDependencies(config: FabricModConfig): Dependency[] {
    return DependencyKind.getValues().flatMap(x => getDependenciesByKind(config, x));
}

function getDependenciesByKind(config: FabricModConfig, kind: DependencyKind): Dependency[] {
    const kindName = DependencyKind.toString(kind).toLowerCase() as Lowercase<keyof typeof DependencyKind>;
    const dependencies = new Array<Dependency>();
    for (const [id, value] of Object.entries(config[kindName] || {})) {
        const ignore = isDependencyIgnoredByDefault(id);
        const aliases = getDefaultDependencyAliases(id);
        const dependency = parseDependency(id, kind, value, ignore, aliases, config);

        dependencies.push(dependency);
    }
    return dependencies;
}

function parseDependency(id: string, kind: DependencyKind, body: FabricDependency, ignore: boolean, aliases: Aliases, config: FabricModConfig): Dependency {
    if (typeof body === "string" || Array.isArray(body)) {
        return parseSimpleDependency(id, kind, body, ignore, aliases, config);
    }

    let version = body.version || body.versions || "*";
    if (Array.isArray(version)) {
        version = version.join(" || ");
    }

    kind = getDependencyKind(id, config) ?? kind;
    ignore = isDependencyIgnoredInConfig(id, config) ?? body.custom?.[action.name]?.ignore ?? ignore;
    aliases = new Map([ ...(aliases || []), ...(getDependencyAliases(id, config) || []) ]);
    for (const target of PublisherTarget.getValues()) {
        const targetName = PublisherTarget.toString(target).toLowerCase();
        const alias = body.custom?.[action.name]?.[targetName];
        if (alias) {
            aliases.set(target, String(alias));
        }
    }

    return Dependency.create({ id, kind, version, ignore, aliases });
}

function parseSimpleDependency(id: string, kind: DependencyKind, version: string | string[], ignore: boolean, aliases: Aliases, config: FabricModConfig): Dependency {
    if (Array.isArray(version)) {
        version = version.join(" || ");
    }

    kind = getDependencyKind(id, config) ?? kind;
    ignore = isDependencyIgnoredInConfig(id, config) ?? ignore;
    aliases = new Map([ ...(aliases || []), ...(getDependencyAliases(id, config) || []) ]);
    return Dependency.create({ id, kind, version, ignore, aliases });
}

const ignoredByDefault = [
    "minecraft",
    "java",
    "fabricloader",
];
function isDependencyIgnoredByDefault(id: string): boolean {
    return ignoredByDefault.includes(id);
}

function isDependencyIgnoredInConfig(id: string, config: FabricModConfig): boolean | null {
    return config.custom?.[action.name]?.dependencies?.[id]?.ignore;
}

const defaultAliases = new Map<string, string | Aliases>([
    ["fabric", "fabric-api"],
]);
function getDefaultDependencyAliases(id: string): Aliases | null {
    if (!defaultAliases.has(id)) {
        return null;
    }

    const aliases = defaultAliases.get(id);
    if (typeof aliases !== "string") {
        return new Map([...aliases]);
    }

    return new Map(PublisherTarget.getValues().map(x => [x, aliases]));
}

function getDependencyAliases(id: string, config: FabricModConfig): Aliases | null {
    const metadata = config.custom?.[action.name]?.dependencies?.[id];
    if (!metadata) {
        return null;
    }

    const aliases = new Map() as Aliases;
    for (const target of PublisherTarget.getValues()) {
        const targetName = PublisherTarget.toString(target).toLowerCase();
        const alias = metadata[targetName] ?? id;
        aliases.set(target, String(alias));
    }
    return aliases;
}

function getDependencyKind(id: string, config: FabricModConfig): DependencyKind | null {
    const kind = config.custom?.[action.name]?.dependencies?.[id]?.kind;
    return kind ? DependencyKind.parse(kind) : null;
}

function getLoaders(config: FabricModConfig): string[] {
    if (config.custom?.[action.name]?.quilt) {
        return ["fabric", "quilt"];
    }
    return ["fabric"];
}

function getProjects(config: FabricModConfig): Map<PublisherTarget, string> {
    const projects = new Map();
    for (const target of PublisherTarget.getValues()) {
        const targetName = PublisherTarget.toString(target).toLowerCase();
        const projectId = config.custom?.[action.name]?.[targetName]
            ?? config.custom?.modmanager?.[targetName]
            ?? config.custom?.projects?.[targetName];

        if (projectId) {
            projects.set(target, String(projectId));
        }
    }
    return projects;
}

class FabricModMetadata implements ModMetadata {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly loaders: string[];
    readonly dependencies: Dependency[];

    private readonly _projects: Map<PublisherTarget, string>;

    constructor(config: FabricModConfig) {
        this.id = String(config.id ?? "");
        this.name = String(config.name ?? this.id);
        this.version = String(config.version ?? "*");
        this.loaders = getLoaders(config);
        this.dependencies = getDependencies(config);
        this._projects = getProjects(config);
    }

    getProjectId(project: PublisherTarget): string | undefined {
        return this._projects.get(project);
    }
}

export default FabricModMetadata;
