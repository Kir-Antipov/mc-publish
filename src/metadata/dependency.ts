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
    export function create({ id, version = "*", kind = DependencyKind.Depends, ignore = false, aliases = null }: { id: string, version?: string, kind?: DependencyKind, ignore?: boolean, aliases?: Map<PublisherTarget, string> }): Dependency {
        return {
            id,
            version: version ?? "*",
            kind: kind ?? DependencyKind.Depends,
            ignore: ignore ?? false,
            getProjectSlug: target => aliases?.has(target) ? aliases.get(target) : id
        };
    }
}

export default Dependency;
