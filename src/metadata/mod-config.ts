import action from "../../package.json";
import Dependency from "./dependency";
import ModMetadata from "./mod-metadata";
import PublisherTarget from "../publishing/publisher-target";

export default abstract class ModConfig<TConfig = Record<string, unknown>> implements ModMetadata {
    public abstract get id(): string;
    public abstract get name(): string;
    public abstract get version(): string;
    public abstract get loaders(): string[];
    public abstract get dependencies(): Dependency[];

    protected readonly config: TConfig;

    constructor(config: TConfig) {
        this.config = config || <TConfig>{};
    }

    getProjectId(project: PublisherTarget): string | undefined {
        const projectName = PublisherTarget.toString(project).toLowerCase();
        const config = this.config;
        const custom = config["custom"];
        const projects = config["projects"];
        const projectId = (
            config[action.name]?.[projectName]?.id ?? config[action.name]?.[projectName] ??
            custom?.[action.name]?.[projectName]?.id ?? custom?.[action.name]?.[projectName] ??
            projects?.[projectName]?.id ?? projects?.[projectName] ??
            custom?.projects?.[projectName]?.id ?? custom?.projects?.[projectName]
        );
        return projectId === undefined ? projectId : String(projectId);
    }
}
