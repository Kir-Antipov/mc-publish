import { createVersion, getProjectFromSlug } from "../../utils/modrinth-utils";
import { File } from "../../utils/file";
import ModPublisher from "../mod-publisher";
import PublisherTarget from "../publisher-target";

const modrinthDependencyKinds = new Map([
    [DependencyKind.Depends, "required"],
    [DependencyKind.Recommends, "optional"],
    [DependencyKind.Suggests, "optional"],
    [DependencyKind.Includes, ""],
    [DependencyKind.Breaks, "incompatible"],
]);

export default class ModrinthPublisher extends ModPublisher {
    public get target(): PublisherTarget {
        return PublisherTarget.Modrinth;
    }

    protected async publishMod(id: string, token: string, name: string, version: string, channel: string, loaders: string[], gameVersions: string[], _java: string[], changelog: string, files: File[], dependencies: Dependency[]): Promise<void> {
        const projects = dependencies
            .filter((x, _, self) => (x.kind !== DependencyKind.Suggests && x.kind !== DependencyKind.Includes) || !self.find(y => y.id === x.id && y.kind !== DependencyKind.Suggests && y.kind !== DependencyKind.Includes))
            .map(x => ({
                project_id: (await getProjectFromSlug(x.getProjectSlug(this.target))).id, // Should probably allow id's here also
                dependency_type: modrinthDependencyKinds.get(x.kind)
            }))
            .filter(x => x.project_id && x.dependency_type);
        const data = {
            version_title: name || version,
            version_number: version,
            version_body: changelog,
            release_channel: channel,
            game_versions: gameVersions,
            loaders,
            featured: true,
            dependencies: !projects.length ? undefined : projects
        };
        await createVersion(id, data, files, token);
    }
}