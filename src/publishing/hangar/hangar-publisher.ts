import { createVersion, authenticate } from "../../utils/hangar";
import File from "../../utils/io/file";
import ModPublisher, { ModPublisherOptions } from "../mod-publisher";
import PublisherTarget from "../publisher-target";
import Dependency from "../../metadata/dependency";
import ModMetadata from "metadata/mod-metadata";

export default class HangarPublisher extends ModPublisher {
    public get target(): PublisherTarget {
        return PublisherTarget.Hangar;
    }

    protected override getVersionType(options: ModPublisherOptions, metadata: ModMetadata, filename: string): string {
        return options.versionType == "release" ? "Release" : options.versionType;
    }

    protected async publishMod(id: string, apiKey: string, name: string, version: string, channel: string, loaders: string[], gameVersions: string[], _java: string[], changelog: string, files: File[], dependencies: Dependency[], options: Record<string, unknown>): Promise<void> {
        if (!id.includes("/")) {
            throw new Error("Invalid project ID. Please ensure the project ID for hangar is in the format AUTHOR/SLUG, separated by a slash.");
        }
        const authorId = id.split("/")[0];
        const projectId = id.split("/")[1];
        
        const { token } = await authenticate(apiKey);
        const data = {
            version: version,
            description: changelog,
            channel: channel
        };

        // todo: dependencies
        await createVersion(authorId, projectId, data, files, loaders, gameVersions, token);
    }

}