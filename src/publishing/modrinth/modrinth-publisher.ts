import { createVersion, getProject } from "../../utils/modrinth-utils";
import { File } from "../../utils/file";
import ModPublisher from "../mod-publisher";
import PublisherTarget from "../publisher-target";
import Dependency from "../../metadata/dependency";
import DependencyKind from "../../metadata/dependency-kind";
import { mapBooleanInput } from "../../utils/input-utils";

const modrinthDependencyKinds = new Map([
    [DependencyKind.Depends, "required"],
    [DependencyKind.Recommends, "optional"],
    [DependencyKind.Suggests, "optional"],
    [DependencyKind.Includes, "optional"],
    [DependencyKind.Breaks, "incompatible"],
]);

export default class ModrinthPublisher extends ModPublisher {
    public get target(): PublisherTarget {
        return PublisherTarget.Modrinth;
    }

    protected async publishMod(id: string, token: string, name: string, version: string, channel: string, loaders: string[], gameVersions: string[], _java: string[], changelog: string, files: File[], dependencies: Dependency[], options: Record<string, unknown>): Promise<void> {
        const featured = mapBooleanInput(options.featured, true);
        const projects = (await Promise.all(dependencies
            .filter((x, _, self) => (x.kind !== DependencyKind.Suggests && x.kind !== DependencyKind.Includes) || !self.find(y => y.id === x.id && y.kind !== DependencyKind.Suggests && y.kind !== DependencyKind.Includes))
            .map(async x => ({
                project_id: (await getProject(x.getProjectSlug(this.target)))?.id,
                dependency_type: modrinthDependencyKinds.get(x.kind)
            }))))
            .filter(x => x.project_id && x.dependency_type);

        const data = {
            name: name || version,
            version_number: version,
            changelog,
            game_versions: gameVersions,
            version_type: channel,
            loaders,
            featured,
            dependencies: projects
        };
        await createVersion(id, data, files, token);
    }
}