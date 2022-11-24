import action from "../../../package.json";
import Dependency from "../dependency";
import DependencyKind from "../dependency-kind";
import PublisherTarget from "../../publishing/publisher-target";
import ModMetadata from "../mod-metadata";
import QuiltModConfig from "./quilt-mod-config";

type Aliases = Map<PublisherTarget, string>;

type QuiltDependency = QuiltModConfig["quilt_loader"]["breaks"][number];

type ExtendedQuiltDependency = QuiltDependency & {
    embedded?: boolean;
    incompatible?: boolean;
};

function getDependencies(config: QuiltModConfig): Dependency[] {
    const root = config.quilt_loader;
    return getExtendedDependencyEntries(root.depends)
        .concat(getExtendedDependencyEntries(root.provides, x => x.embedded = true))
        .concat(getExtendedDependencyEntries(root.breaks, x => x.incompatible = true))
        .map(parseDependency)
        .filter((x, i, self) => self.findIndex(y => x.id === y.id && x.kind === y.kind) === i);
}

function parseId(id?: string): string | null {
    if (!id) {
        return id ?? null;
    }

    const separatorIndex = id.indexOf(":");
    if (separatorIndex === -1) {
        return id;
    }
    return id.substring(separatorIndex + 1);
}

function getExtendedDependencyEntries(container: QuiltDependency[], transformer?: (x: ExtendedQuiltDependency) => void): ExtendedQuiltDependency[] {
    if (!Array.isArray(container)) {
        return [];
    }

    if (transformer) {
        container = container.map(x => typeof x === "string" ? ({ id: x }) : ({ ...x }));
        container.forEach(transformer);
    }
    return container;
}

function parseDependency(body: ExtendedQuiltDependency): Dependency {
    const id = parseId(typeof body === "string" ? body : String(body.id ?? ""));
    const ignoredByDefault = isDependencyIgnoredByDefault(id);
    const defaultAliases = getDefaultDependencyAliases(id);

    if (typeof body === "string") {
        return Dependency.create({ id, ignore: ignoredByDefault, aliases: defaultAliases });
    }

    const version = body.version ?? (Array.isArray(body.versions) ? body.versions.join(" || ") : body.versions || "*");
    const kind = (
        body.incompatible && body.unless && DependencyKind.Conflicts ||
        body.incompatible && DependencyKind.Breaks ||
        body.embedded && DependencyKind.Includes ||
        body.optional && DependencyKind.Recommends ||
        DependencyKind.Depends
    );
    const ignore = body[action.name]?.ignore ?? ignoredByDefault;

    const aliases = new Map([...(defaultAliases || [])]);
    for (const target of PublisherTarget.getValues()) {
        const targetName = PublisherTarget.toString(target).toLowerCase();
        const alias = body[action.name]?.[targetName];
        if (alias) {
            aliases.set(target, String(alias));
        }
    }

    return Dependency.create({ id, version, kind, ignore, aliases });
}

const ignoredByDefault = [
    "minecraft",
    "java",
    "quilt_loader",
];
function isDependencyIgnoredByDefault(id: string): boolean {
    return ignoredByDefault.includes(id);
}

const defaultAliases = new Map<string, string | Aliases>([
    ["fabric", "fabric-api"],
    ["quilted_fabric_api", "qsl"],
]);
function getDefaultDependencyAliases(id: string): Aliases | null {
    if (id.startsWith("quilted_")) {
        id = "quilted_fabric_api";
    }

    if (!defaultAliases.has(id)) {
        return null;
    }

    const aliases = defaultAliases.get(id);
    if (typeof aliases !== "string") {
        return new Map([...aliases]);
    }

    return new Map(PublisherTarget.getValues().map(x => [x, aliases]));
}

function getProjects(config: QuiltModConfig): Map<PublisherTarget, string> {
    const projects = new Map();
    for (const target of PublisherTarget.getValues()) {
        const targetName = PublisherTarget.toString(target).toLowerCase();
        const projectId = config[action.name]?.[targetName] ?? config.projects?.[targetName];

        if (projectId) {
            projects.set(target, String(projectId));
        }
    }
    return projects;
}

class QuiltModMetadata implements ModMetadata {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly loaders: string[];
    readonly dependencies: Dependency[];

    private readonly _projects: Map<PublisherTarget, string>;

    constructor(config: QuiltModConfig) {
        this.id = String(config.quilt_loader.id ?? "");
        this.name = String(config.quilt_loader.name ?? this.id);
        this.version = String(config.quilt_loader.version ?? "*");
        this.loaders = ["quilt"];
        this.dependencies = getDependencies(config);
        this._projects = getProjects(config);
    }

    getProjectId(project: PublisherTarget): string | undefined {
        return this._projects.get(project);
    }
}

export default QuiltModMetadata;
