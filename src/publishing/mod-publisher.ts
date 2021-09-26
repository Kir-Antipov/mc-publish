import { context } from "@actions/github";
import { getCompatibleBuilds, parseVersionNameFromFileVersion } from "../utils/minecraft-utils";
import { File, getFiles, parseVersionFromFilename, parseVersionTypeFromFilename } from "../utils/file-utils";
import Publisher from "./publisher";
import PublisherTarget from "./publisher-target";

interface ModPublisherOptions {
    id: string;
    token: string;
    versionType?: "alpha" | "beta" | "release";
    loaders?: string | string[];
    name?: string;
    version?: string;
    changelog?: string | { file?: string };
    gameVersions?: string | string[];
    java?: string | string[];
    files?: string | { primary?: string, secondary?: string };
}

const defaultFiles = {
    primary: "build/libs/!(*-@(dev|sources)).jar",
    secondary: "build/libs/*-@(dev|sources).jar"
};

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

export default abstract class ModPublisher<TUniqueOptions = unknown> extends Publisher<ModPublisherOptions & TUniqueOptions> {
    public async publish(): Promise<void> {
        const releaseInfo = <any>context.payload.release;

        const id = this.options.id;
        if (!id) {
            throw new Error(`Project id is required to publish your assets to ${PublisherTarget.toString(this.target)}`);
        }

        const token = this.options.token;
        if (!token) {
            throw new Error(`Token is required to publish your assets to ${PublisherTarget.toString(this.target)}`);
        }

        const fileSelector = this.options.files && (typeof(this.options.files) === "string" || this.options.files.primary) ? this.options.files : defaultFiles;
        const files = await getFiles(fileSelector);
        if (!files.length) {
            throw new Error(`Specified files (${typeof fileSelector === "string" ? fileSelector : fileSelector.primary}) were not found`);
        }

        const version = (typeof this.options.version === "string" && this.options.version) || <string>releaseInfo?.tag_name || parseVersionFromFilename(files[0].name);
        const versionType = this.options.versionType?.toLowerCase() || parseVersionTypeFromFilename(files[0].name);
        const name = (typeof this.options.name === "string" && this.options.name) || <string>releaseInfo?.name || version;
        const changelog = ((typeof this.options.changelog === "string" || this.options.changelog?.file) ? (await readChangelog(this.options.changelog)) : <string>releaseInfo?.body) || "";

        const loaders = processMultilineInput(this.options.loaders, /\s+/);
        if (!loaders.length) {
            loaders.push(...defaultLoaders);
        }

        const gameVersions = processMultilineInput(this.options.gameVersions);
        if (!gameVersions.length) {
            const minecraftVersion = parseVersionNameFromFileVersion(version);
            if (minecraftVersion) {
                gameVersions.push(...(await getCompatibleBuilds(minecraftVersion)).map(x => x.id));
            }
            if (!gameVersions.length) {
                throw new Error("At least one game version should be specified");
            }
        }

        const java = processMultilineInput(this.options.java);

        await this.publishMod(id, token, name, version, versionType, loaders, gameVersions, java, changelog, files);
    }

    protected abstract publishMod(id: string, token: string, name: string, version: string, versionType: string, loaders: string[], gameVersions: string[], java: string[], changelog: string, files: File[]): Promise<void>;
}