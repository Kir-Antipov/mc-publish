import { createVersion } from "../../utils/modrinth-utils";
import { File } from "../../utils/file";
import ModPublisher from "../mod-publisher";
import PublisherTarget from "../publisher-target";

export default class ModrinthPublisher extends ModPublisher {
    public get target(): PublisherTarget {
        return PublisherTarget.Modrinth;
    }

    protected async publishMod(id: string, token: string, name: string, version: string, channel: string, loaders: string[], gameVersions: string[], _java: string[], changelog: string, files: File[]): Promise<void> {
        const data = {
            version_title: name || version,
            version_number: version,
            version_body: changelog,
            release_channel: channel,
            game_versions: gameVersions,
            loaders,
            featured: true,
        };
        await createVersion(id, data, files, token);
    }
}