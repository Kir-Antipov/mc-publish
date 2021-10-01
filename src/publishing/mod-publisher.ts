import { context } from "@actions/github";
import { parseVersionNameFromFileVersion } from "../utils/minecraft-utils";
import { File, getFiles, parseVersionFromFilename, parseVersionTypeFromFilename } from "../utils/file-utils";
import Publisher from "./publisher";
import PublisherTarget from "./publisher-target";
import MinecraftVersionResolver from "../utils/minecraft-version-resolver";

interface ModPublisherOptions {
    id: string;
    token: string;
    versionType?: "alpha" | "beta" | "release";
    loaders?: string | string[];
    name?: string;
    version?: string;
    changelog?: string | { file?: string };
    versionResolver?: string;
    gameVersions?: string | string[];
    java?: string | string[];
    files?: string | { primary?: string, secondary?: string };
}

const defaultLoaders = ["fabric"];

function processMultilineInput(input: string | string[], splitter?: RegExp): string[] {
    if (!input) {
        return [];
    }
    return (typeof input === "string" ? input.split(splitter || /(\r?\n)+/) : input).map(x => x.trim()).filter(x => x);
}

async function readChangelog(changelog: string | { file?: string }): Promise<string | never> {
    if (typeof changelog === "string") {
        return changelog;
    }

    const file = (await getFiles(changelog.file || ""))[0];
    if (!file) {
        throw new Error("Changelog file was not found");
    }
    return (await file.getBuffer()).toString("utf8");
}

export default abstract class ModPublisher extends Publisher<ModPublisherOptions> {
    public async publish(files: File[], options: ModPublisherOptions): Promise<void> {
        this.validateOptions(options);
        const releaseInfo = <any>context.payload.release;

        const id = options.id;
        if (!id) {
            throw new Error(`Project id is required to publish your assets to ${PublisherTarget.toString(this.target)}`);
        }

        const token = options.token;
        if (!token) {
            throw new Error(`Token is required to publish your assets to ${PublisherTarget.toString(this.target)}`);
        }

        const version = (typeof options.version === "string" && options.version) || <string>releaseInfo?.tag_name || parseVersionFromFilename(files[0].name);
        const versionType = options.versionType?.toLowerCase() || parseVersionTypeFromFilename(files[0].name);
        const name = (typeof options.name === "string" && options.name) || <string>releaseInfo?.name || version;
        const changelog = ((typeof options.changelog === "string" || options.changelog?.file) ? (await readChangelog(options.changelog)) : <string>releaseInfo?.body) || "";

        const loaders = processMultilineInput(options.loaders, /\s+/);
        if (!loaders.length) {
            loaders.push(...defaultLoaders);
        }

        const gameVersions = processMultilineInput(options.gameVersions);
        if (!gameVersions.length) {
            const minecraftVersion = parseVersionNameFromFileVersion(version);
            if (minecraftVersion) {
                const resolver = options.versionResolver && MinecraftVersionResolver.byName(options.versionResolver) || MinecraftVersionResolver.releasesIfAny;
                gameVersions.push(...(await resolver.resolve(minecraftVersion)).map(x => x.id));
            }
            if (!gameVersions.length) {
                throw new Error("At least one game version should be specified");
            }
        }

        const java = processMultilineInput(options.java);

        await this.publishMod(id, token, name, version, versionType, loaders, gameVersions, java, changelog, files);
    }

    protected abstract publishMod(id: string, token: string, name: string, version: string, versionType: string, loaders: string[], gameVersions: string[], java: string[], changelog: string, files: File[]): Promise<void>;
}