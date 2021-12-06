import { File } from "../../utils/file-utils";
import ModPublisher from "../mod-publisher";
import PublisherTarget from "../publisher-target";
import { convertToCurseForgeVersions, uploadFile } from "../../utils/curseforge-utils";

export default class CurseForgePublisher extends ModPublisher {
    public get target(): PublisherTarget {
        return PublisherTarget.CurseForge;
    }

    protected async publishMod(id: string, token: string, name: string, _version: string, channel: string, loaders: string[], gameVersions: string[], java: string[], changelog: string, files: File[]): Promise<void> {
        let parentFileId = undefined;
        const versions = await convertToCurseForgeVersions(gameVersions, loaders, java, token);

        for (const file of files) {
            const data = {
                changelog,
                changelogType: "markdown",
                displayName: (parentFileId || !name) ? file.name : name,
                parentFileID: parentFileId,
                releaseType: channel,
                gameVersions: parentFileId ? undefined : versions
            };

            const fileId = await uploadFile(id, data, file, token);
            if (!parentFileId) {
                parentFileId = fileId;
            }
        }
    }
}