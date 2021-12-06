import fetch from "node-fetch";
import Version from "./version";

export enum MinecraftVersionType {
    Release = "release",
    Snapshot = "snapshot",
    OldBeta = "old_beta",
    OldAlpha = "old_alpha"
}

export class MinecraftVersion {
    public readonly id: string;
    public readonly name: string;
    public readonly version: Version;
    public readonly type: MinecraftVersionType;
    public readonly url: string;
    public readonly time: Date;
    public readonly releaseTime: Date;

    public constructor(id: string, name: string, type: MinecraftVersionType, url: string, time: Date, releaseTime: Date) {
        this.id = id;
        this.name = name;
        this.version = new Version(name);
        this.type = type;
        this.url = url;
        this.time = time;
        this.releaseTime = releaseTime;
    }

    public get isRelease(): boolean {
        return this.type === MinecraftVersionType.Release;
    }

    public get isSnapshot(): boolean {
        return this.type === MinecraftVersionType.Snapshot;
    }
}

interface ParsedMinecraftVersion {
    id: string;
    type: MinecraftVersionType;
    url: string;
    time: string;
    releaseTime: string;
}

let cachedVersionsById: Map<string, MinecraftVersion> = null;
async function getVersionMap(): Promise<Map<string, MinecraftVersion>> {
    if (!cachedVersionsById) {
        cachedVersionsById = await loadVersions();
    }
    return cachedVersionsById;
}

async function loadVersions(): Promise<Map<string, MinecraftVersion>> {
    const response = <{ versions: ParsedMinecraftVersion[] }>await (await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json")).json();
    const versionsById = new Map<string, MinecraftVersion>();
    for (let i = 0; i < response.versions.length; ++i) {
        const version = response.versions[i];
        versionsById.set(version.id, new MinecraftVersion(version.id, getNearestReleaseVersionName(response.versions, i), version.type, version.url, new Date(version.time), new Date(version.releaseTime)));
    }
    return versionsById;
}

function getNearestReleaseVersionName(versions: ParsedMinecraftVersion[], start: number): string {
    for (let i = start; i >= 0; --i) {
        if (versions[i].type === MinecraftVersionType.Release) {
            return versions[i].id;
        }
    }

    const versionMatch = versions[start].id.match(/\d+\.\d+(?:\.\d+)?/);
    if (versionMatch && versionMatch.length > 0) {
        return versionMatch[0];
    }

    for (let i = start + 1; i < versions.length; ++i) {
        if (versions[i].type === MinecraftVersionType.Release) {
            return extractVersion(versions[i].id).split(".").map((x, i) => i === 1 ? (+x + 1) : x).filter((x, i) => i < 2).join(".");
        }
    }

    return null;
}

export async function getVersions(): Promise<MinecraftVersion[]> {
    return [...(await getVersionMap()).values()];
}

export async function getVersionById(id: string): Promise<MinecraftVersion | null> {
    return (await getVersionMap()).get(id.trim()) || null;
}

export async function findVersionByName(name: string, snapshot?: boolean): Promise<MinecraftVersion | null> {
    const versionMap = await getVersionMap();
    snapshot ??= isSnapshot(name);
    const foundVersion = versionMap.get(name);
    if (foundVersion && foundVersion.isSnapshot === !!snapshot) {
        return foundVersion;
    }

    name = extractVersion(name);
    for (const version of versionMap.values()) {
        if (version.name === name && version.isSnapshot) {
            return version;
        }
    }
    return null;
}

function extractVersion(versionName: string): string {
    return versionName.match(/(?<![a-z][\w\s\-.]*)\d+/ig).join(".");
}

const weirdOldSnapshots = new Set(["1.7.1", "1.7", "1.6.3", "1.6", "1.5", "1.4.3", "1.4.1", "1.4", "1.3"]);
export function isSnapshot(versionName: string): boolean {
    return !versionName.match(/^\s*\d+\.\d+/) || !!versionName.match(/pre|rc|snapshot/i) || weirdOldSnapshots.has(versionName);
}

export function parseVersionNameFromFileVersion(fileVersion: string): string | null {
    const mcMatch = fileVersion.match(/mc(\d+\.\d+(?:\.\d+)?)/i);
    if (mcMatch) {
        return mcMatch[1];
    } else {
        const versionCandidates = fileVersion.split(/[+-]/).map(x => x.match(/\d+\.\d+(?:\.\d+)?/)).filter(x => x).map(x => x[0]);
        return versionCandidates.length > 1 ? versionCandidates.filter(x => x.startsWith("1.")).reverse()[0] : null;
    }
}

export function parseVersionName(version: string): string | null {
    const versionCandidates = [...(version.match(/\d+\.\d+(?:\.\d+)?/g) || [])];
    return versionCandidates.filter(x => x.startsWith("1."))[0] || null;
}

export async function getLatestRelease(): Promise<MinecraftVersion | null> {
    return (await getVersions()).find(x => x.isRelease) || null;
}

export async function getCompatibleBuilds(build: string | Version): Promise<MinecraftVersion[]> {
    if (!(build instanceof Version)) {
        build = new Version(build);
    }
    const versions = new Array<MinecraftVersion>();
    for (const version of await getVersions()) {
        if (version.version.major !== build.major) {
            continue;
        }

        if (version.version.minor < build.minor) {
            break;
        }

        if (version.version.minor === build.minor && version.version.build >= build.build) {
            versions.push(version);
        }
    }
    return versions;
}
