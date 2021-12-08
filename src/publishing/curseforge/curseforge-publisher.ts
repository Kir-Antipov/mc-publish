import { File } from "../../utils/file";
import ModPublisher from "../mod-publisher";
import PublisherTarget from "../publisher-target";
import { convertToCurseForgeVersions, uploadFile } from "../../utils/curseforge-utils";
import Dependency from "../../metadata/dependency";
import DependencyKind from "../../metadata/dependency-kind";

const forgeDependencyKinds = new Map([
    [DependencyKind.Depends, "requiredDependency"],
    [DependencyKind.Recommends, "optionalDependency"],
    [DependencyKind.Suggests, "optionalDependency"],
    [DependencyKind.Includes, "embeddedLibrary"],
    [DependencyKind.Breaks, "incompatible"],
]);

export default class CurseForgePublisher extends ModPublisher {
    public get target(): PublisherTarget {
        return PublisherTarget.CurseForge;
    }

    protected async publishMod(id: string, token: string, name: string, _version: string, channel: string, loaders: string[], gameVersions: string[], java: string[], changelog: string, files: File[], dependencies: Dependency[]): Promise<void> {
        let parentFileId = undefined;
        const versions = await convertToCurseForgeVersions(gameVersions, loaders, java, token);

        for (const file of files) {
            const data = {
                changelog,
                changelogType: "markdown",
                displayName: (parentFileId || !name) ? file.name : name,
                parentFileID: parentFileId,
                releaseType: channel,
                gameVersions: parentFileId ? undefined : versions,
                relations: parentFileId ? undefined : {
                    projects: dependencies
                        .filter((x, _, self) => x.kind !== DependencyKind.Suggests || !self.find(y => y.id === x.id && y.kind !== DependencyKind.Suggests))
                        .map(x => ({
                            slug: x.getProjectSlug(this.target),
                            type: forgeDependencyKinds.get(x.kind)
                        }))
                        .filter(x => x.slug && x.type)
                }
            };

            const fileId = await uploadFile(id, data, file, token);
            if (!parentFileId) {
                parentFileId = fileId;
            }
        }
    }
}