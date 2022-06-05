import action from "../../../package.json";
import Dependency from "../../metadata/dependency";
import DependencyKind from "../../metadata/dependency-kind";
import ModConfig from "../../metadata/mod-config";
import ModConfigDependency from "../../metadata/mod-config-dependency";
import PublisherTarget from "../../publishing/publisher-target";

function extractId(id?: string): string | null {
    if (!id) {
        return id ?? null;
    }

    const separatorIndex = id.indexOf(":");
    if (separatorIndex !== -1) {
        id = id.substring(separatorIndex + 1);
    }

    return id;
}

function getDependencyEntries(container: any, transformer?: (x: any) => void): any[] {
    if (!Array.isArray(container)) {
        return [];
    }

    if (transformer) {
        container = container.map(x => typeof x === "string" ? ({ id: x }) : ({ ...x }));
        container.forEach(transformer);
    }
    return container;
}

const ignoredByDefault = ["minecraft", "java", "quilt_loader"];
const aliases = new Map([
    ["fabric", "fabric-api"],
    ["quilted_fabric_api", "qsl"],
]);
function createDependency(body: any): Dependency {
    const id = extractId(typeof body === "string" ? body : String(body.id ?? ""));
    const ignore = ignoredByDefault.includes(id);
    if (id.startsWith("quilted_") || id.startsWith("quilt_")) {
        aliases.set(id, "qsl");
    }

    if (typeof body === "string") {
        const dependencyAliases = aliases.has(id) ? new Map(PublisherTarget.getValues().map(x => [x, aliases.get(id)])) : null;
        return Dependency.create({ id, ignore, aliases: dependencyAliases });
    }

    const dependencyMetadata = {
        ignore,
        ...body,
        id,
        version: body.version ?? String(Array.isArray(body.versions) ? body.versions[0] : body.versions || "*"),
        kind: (
            body.incompatible && body.unless && DependencyKind.Conflicts ||
            body.incompatible && DependencyKind.Breaks ||
            body.embedded && DependencyKind.Includes ||
            body.optional && DependencyKind.Recommends ||
            DependencyKind.Depends
        )
    };
    if (aliases.has(id)) {
        if (!dependencyMetadata[action.name]) {
            dependencyMetadata[action.name] = {};
        }
        for (const target of PublisherTarget.getValues()) {
            const targetName = PublisherTarget.toString(target).toLowerCase();
            if (typeof dependencyMetadata[action.name][targetName] !== "string") {
                dependencyMetadata[action.name][targetName] = aliases.get(id);
            }
        }
    }
    return new ModConfigDependency(dependencyMetadata);
}

export default class QuiltModMetadata extends ModConfig {
    public readonly id: string;
    public readonly name: string;
    public readonly version: string;
    public readonly loaders: string[];
    public readonly dependencies: Dependency[];

    constructor(config: Record<string, unknown>) {
        super(config);
        const root = <Record<string, unknown>>this.config.quilt_loader ?? {};
        this.id = String(root.id ?? "");
        this.name = String(root.name ?? this.id);
        this.version = String(root.version ?? "*");
        this.loaders = ["quilt"];
        this.dependencies = getDependencyEntries(root.depends)
            .concat(getDependencyEntries(root.provides, x => x.embedded = true))
            .concat(getDependencyEntries(root.breaks, x => x.incompatible = true))
            .map(createDependency)
            .filter((x, i, self) => self.findIndex(y => x.id === y.id && x.kind === y.kind) === i);
    }
}