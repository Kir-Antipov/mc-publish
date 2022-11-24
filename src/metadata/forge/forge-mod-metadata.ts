import action from "../../../package.json";
import Dependency from "../dependency";
import DependencyKind from "../dependency-kind";
import ForgeModConfig from "./forge-mod-config";
import ModMetadata from "../mod-metadata";
import PublisherTarget from "../../publishing/publisher-target";

type ForgeDependency = ForgeModConfig["dependencies"][string][number];

function getDependencies(config: ForgeModConfig): Dependency[] {
    return Object
        .values(config.dependencies || {})
        .filter(x => Array.isArray(x))
        .flatMap(x => x)
        .map(parseDependency)
        .filter((x, i, self) => self.findIndex(y => x.id === y.id && x.kind === y.kind) === i);
}

function parseDependency(body: ForgeDependency): Dependency {
    const id = body.modId;
    const kind = body.incompatible && DependencyKind.Breaks || body.embedded && DependencyKind.Includes || body.mandatory && DependencyKind.Depends || DependencyKind.Recommends;
    const version = body.versionRange;
    const ignore = body[action.name]?.ignore ?? body.custom?.[action.name]?.ignore ?? body.ignore ?? isDependencyIgnoredByDefault(id);
    const aliases = new Map<PublisherTarget, string>();
    for (const target of PublisherTarget.getValues()) {
        const targetName = PublisherTarget.toString(target).toLowerCase();
        const alias = body[action.name]?.[targetName] ?? body.custom?.[action.name]?.[targetName];
        if (alias) {
            aliases.set(target, String(alias));
        }
    }

    return Dependency.create({ id, kind, version, ignore, aliases });
}

const ignoredByDefault = [
    "minecraft",
    "java",
    "forge",
];
function isDependencyIgnoredByDefault(id: string): boolean {
    return ignoredByDefault.includes(id);
}

function getProjects(config: ForgeModConfig): Map<PublisherTarget, string> {
    const projects = new Map();
    for (const target of PublisherTarget.getValues()) {
        const targetName = PublisherTarget.toString(target).toLowerCase();
        const projectId = config[action.name]?.[targetName]
            ?? config.custom?.[action.name]?.[targetName]
            ?? config.projects?.[targetName]
            ?? config.custom?.projects?.[targetName];

        if (projectId) {
            projects.set(target, String(projectId));
        }
    }
    return projects;
}

class ForgeModMetadata implements ModMetadata {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly loaders: string[];
    readonly dependencies: Dependency[];

    private readonly _projects: Map<PublisherTarget, string>;

    constructor(config: ForgeModConfig) {
        const mods = Array.isArray(config.mods) && config.mods || [];
        const mod = mods[0];
        if (!mod) {
            throw new Error("At least one mod should be specified");
        }

        this.id = mod.modId;
        this.name = mod.displayName || this.id;
        this.version = mod.version || "*";
        this.loaders = ["forge"];
        this.dependencies = getDependencies(config);

        this._projects = getProjects(config);
    }

    getProjectId(project: PublisherTarget): string | undefined {
        return this._projects.get(project);
    }
}

export default ForgeModMetadata;
