import { context } from "@actions/github";
import { parseVersionName, parseVersionNameFromFileVersion } from "../utils/minecraft-utils";
import { File } from "../utils/file";
import { getFiles } from "../utils/file-utils";
import Publisher from "./publisher";
import PublisherTarget from "./publisher-target";
import MinecraftVersionResolver from "../utils/minecraft-version-resolver";
import ModMetadataReader from "../metadata/mod-metadata-reader";
import Dependency from "../metadata/dependency";
import { parseVersionFromName, parseVersionTypeFromName } from "../utils/version-utils";
import DependencyKind from "../metadata/dependency-kind";
import path from "path";

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
    dependencies?: string | string[];
    files?: string | { primary?: string, secondary?: string };
}

function processMultilineInput(input: string | string[], splitter?: RegExp): string[] {
    if (!input) {
        return [];
    }
    return (typeof input === "string" ? input.split(splitter || /(\r?\n)+/) : input).map(x => x.trim()).filter(x => x);
}

function processDependenciesInput(input: string | string[], inputSplitter?: RegExp, entrySplitter?: RegExp): Dependency[] {
    return processMultilineInput(input, inputSplitter).map(x => {
        const parts = x.split(entrySplitter || /\|/);
        const id = parts[0].trim();
        return Dependency.create({
            id,
            kind: parts[1] && DependencyKind.parse(parts[1].trim()) || DependencyKind.Depends,
            version: parts[2]?.trim() || "*"
        });
    });
}

async function readChangelog(changelogPath: string): Promise<string | never> {
    const file = (await getFiles(changelogPath))[0];
    if (!file) {
        throw new Error("Changelog file was not found");
    }
    return (await file.getBuffer()).toString("utf8");
}

export default abstract class ModPublisher extends Publisher<ModPublisherOptions> {
    public async publish(files: File[], options: ModPublisherOptions): Promise<void> {
        this.validateOptions(options);
        const releaseInfo = <any>context.payload.release;

        if (!Array.isArray(files) || !files.length) {
            throw new Error("No upload files were specified");
        }

        const token = options.token;
        if (!token) {
            throw new Error(`Token is required to publish your assets to ${PublisherTarget.toString(this.target)}`);
        }

        const metadata = await ModMetadataReader.readMetadata(files[0].path);

        const id = options.id || metadata?.getProjectId(this.target);
        if (!id) {
            throw new Error(`Project id is required to publish your assets to ${PublisherTarget.toString(this.target)}`);
        }

        const filename = path.parse(files[0].path).name;
        const version = (typeof options.version === "string" && options.version) || <string>releaseInfo?.tag_name || metadata?.version || parseVersionFromName(filename);
        const versionType = options.versionType?.toLowerCase() || parseVersionTypeFromName(metadata?.version || filename);
        const name = typeof options.name === "string" ? options.name : (<string>releaseInfo?.name || version);
        const changelog = typeof options.changelog === "string"
            ? options.changelog
            : options.changelog?.file
                ? await readChangelog(options.changelog.file)
                : <string>releaseInfo?.body || "";

        const loaders = processMultilineInput(options.loaders, /\s+/);
        if (!loaders.length) {
            if (metadata) {
                loaders.push(...metadata.loaders);
            }
            if (!loaders.length) {
                throw new Error("At least one mod loader should be specified");
            }
        }

        const gameVersions = processMultilineInput(options.gameVersions);
        if (!gameVersions.length) {
            const minecraftVersion =
                metadata?.dependencies.filter(x => x.id === "minecraft").map(x => parseVersionName(x.version))[0] ||
                parseVersionNameFromFileVersion(version);

            if (minecraftVersion) {
                const resolver = options.versionResolver && MinecraftVersionResolver.byName(options.versionResolver) || MinecraftVersionResolver.releasesIfAny;
                gameVersions.push(...(await resolver.resolve(minecraftVersion)).map(x => x.id));
            }
            if (!gameVersions.length) {
                throw new Error("At least one game version should be specified");
            }
        }

        const java = processMultilineInput(options.java);
        const dependencies = typeof options.dependencies === "string"
            ? processDependenciesInput(options.dependencies)
            : metadata?.dependencies || [];
        const uniqueDependencies = dependencies.filter((x, i, self) => !x.ignore && self.findIndex(y => y.id === x.id && y.kind === x.kind) === i);

        await this.publishMod(id, token, name, version, versionType, loaders, gameVersions, java, changelog, files, uniqueDependencies, <Record<string, unknown>><unknown>options);
    }

    protected abstract publishMod(id: string, token: string, name: string, version: string, versionType: string, loaders: string[], gameVersions: string[], java: string[], changelog: string, files: File[], dependencies: Dependency[], options: Record<string, unknown>): Promise<void>;
}