import action from "../../package.json";
import Dependency from "./dependency";
import DependencyKind from "./dependency-kind";
import PublisherTarget from "../publishing/publisher-target";

interface DependencyOptions {
    id: string;
    version?: string;
    kind?: DependencyKind;
    ignore?: boolean;
}

export default class ModConfigDependency<TMetadata extends DependencyOptions = Record<string, unknown> & DependencyOptions> implements Dependency {
    public readonly id: string;
    public readonly version: string;
    public readonly kind: DependencyKind;
    public readonly ignore: boolean;
    protected readonly metadata: TMetadata;

    constructor(metadata: TMetadata) {
        this.id = String(metadata.id ?? "");
        this.version = String(metadata.version ?? "*");
        this.kind = metadata.kind || DependencyKind.Depends;
        this.metadata = metadata;
        this.ignore = this.metadata["custom"]?.[action.name]?.ignore ?? this.metadata[action.name]?.ignore ?? this.metadata.ignore ?? false;
    }

    getProjectSlug(project: PublisherTarget): string {
        const projectName = PublisherTarget.toString(project).toLowerCase();
        const metadata = this.metadata;
        const custom = metadata["custom"];
        const projects = metadata["projects"];
        return String(
            metadata[action.name]?.[projectName]?.slug ?? metadata[action.name]?.[projectName] ??
            custom?.[action.name]?.[projectName]?.slug ?? custom?.[action.name]?.[projectName] ??
            projects?.[projectName]?.slug ?? projects?.[projectName] ??
            custom?.projects?.[projectName]?.slug ?? custom?.projects?.[projectName] ??
            this.id
        );
    }
}
