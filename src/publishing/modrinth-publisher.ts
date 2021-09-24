import { Modrinth } from "modrinth";
import { File } from "../utils/file-utils";
import ModPublisher from "./mod-publisher";
import PublisherTarget from "./publisher-target";

export default class ModrinthPublisher extends ModPublisher {
    public get target(): PublisherTarget {
        return PublisherTarget.Modrinth;
    }

    protected async publishMod(id: string, token: string, name: string, version: string, channel: string, loaders: string[], gameVersions: string[], _java: string[], changelog: string, files: File[]): Promise<void> {
        const data = {
            name,
            version_number: version,
            changelog,
            game_versions: gameVersions,
            version_type: channel,
            loaders,
            featured: true,
        };
        const uploadFiles = files.map((x, i) => ({
            name: x.path,
            data: {
                filename: x.name,
                primary: i === 0
            }
        }));

        const modrinth = new Modrinth({ authorization: token });
        await modrinth.createVersion(id, data, uploadFiles);
    }
}