import PublisherTarget from "../publishing/publisher-target";
import Dependency from "./dependency";

export default interface ModMetadata {
    get id(): string;
    get name(): string;
    get version(): string;
    get loaders(): string[];
    get dependencies(): Dependency[];

    getProjectId(project: PublisherTarget): string | undefined;
}
