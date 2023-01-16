import File from "../../utils/io/file";
import ModPublisher from "../mod-publisher";
import PublisherTarget from "../publisher-target";
import {convertToCurseForgeVersions, getModSlug, uploadFile} from "../../utils/curseforge";
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

    protected async publishMod(id: string, token: string, name: string, _version: string, channel: string, loaders: string[], gameVersions: string[], java: string[], changelog: string, files: File[], dependencies: Dependency[]): Promise<{ file_id: number, project_slug: string }> {
        let parentFileId = undefined;
        const versions = await convertToCurseForgeVersions(gameVersions, loaders, java, token);
        const projects = dependencies
            .filter((x, _, self) => x.kind !== DependencyKind.Suggests || !self.find(y => y.id === x.id && y.kind !== DependencyKind.Suggests))
            .map(x => ({
                slug: x.getProjectSlug(this.target),
                type: forgeDependencyKinds.get(x.kind)
            }))
            .filter(x => x.slug && x.type);

        for (const file of files) {
            const data = {
                changelog,
                changelogType: "markdown",
                displayName: (parentFileId || !name) ? file.name : name,
                parentFileID: parentFileId,
                releaseType: channel,
                gameVersions: parentFileId ? undefined : versions,
                relations: (parentFileId || !projects.length) ? undefined : { projects }
            };

            if (this.dryRun) {
                this.logger.info(`Would upload this data to CurseForge: ${JSON.stringify(data)}`);
                continue;
            }

            const fileId = await this.upload(id, data, file, token);
            if (!parentFileId) {
                parentFileId = fileId;
            }
        }
        return {
            project_slug: await getModSlug(Number(id)),
            file_id: parentFileId
        };
    }

    protected makeLink(ret: { project_slug: string, file_id: number }): string {
        return `https://www.curseforge.com/minecraft/mc-mods/${ret.project_slug}/files/${ret.file_id}`;
    }

    private async upload(id: string, data: Record<string, any>, file: File, token: string): Promise<number | never> {
        while (true) {
            try {
                return await uploadFile(id, data, file, token);
            } catch (error) {
                if (error?.info?.errorCode === 1018 && typeof error.info.errorMessage === "string") {
                    const match = error.info.errorMessage.match(/Invalid slug in project relations: '([^']+)'/);
                    const projects = <{ slug: string }[]>data.relations?.projects;
                    if (match && projects?.length) {
                        const invalidSlugIndex = projects.findIndex(x => x.slug === match[1]);
                        if (invalidSlugIndex !== -1) {
                            projects.splice(invalidSlugIndex, 1);
                            continue;
                        }
                    }
                }
                throw error;
            }
        }
    }
}