import PublisherTarget from "../publishing/publisher-target";
import DependencyKind from "./dependency-kind";

interface Dependency {
    get id(): string;
    get version(): string;
    get kind(): DependencyKind;
    get ignore(): boolean;

    getProjectSlug(project: PublisherTarget): string;
}

namespace Dependency {
    export function create({ id, version = "*", kind = DependencyKind.Depends, ignore = false }: { id: string, version?: string, kind?: DependencyKind, ignore?: boolean }): Dependency {
        return {
            id,
            version: version ?? "*",
            kind: kind ?? DependencyKind.Depends,
            ignore: ignore ?? false,
            getProjectSlug: _ => id
        };
    }
}

export default Dependency;
