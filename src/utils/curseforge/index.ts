import fetch from "node-fetch";
import FormData from "form-data";
import File from "../io/file";
import { findVersionByName } from "../minecraft";
import SoftError from "../soft-error";

const baseUrl = "https://minecraft.curseforge.com/api";
const newAPIBaseUrl = "https://api.curseforge.com";
const apiKey = "$2a$10$Eie/MzKO6B13/AhuQVs9ieNc.LV8dooZENuK2594vSW9AXAdN59vK";

interface CurseForgeVersion {
    id: number;
    gameVersionTypeID: number;
    name: string;
    slug: string;
}

interface CurseForgeVersions {
    gameVersions: CurseForgeVersion[];
    loaders: CurseForgeVersion[];
    java: CurseForgeVersion[];
}

interface CurseForgeUploadErrorInfo {
    errorCode: number;
    errorMessage: string;
}

class CurseForgeUploadError extends SoftError {
    public readonly info?: CurseForgeUploadErrorInfo;

    constructor(soft: boolean, message?: string, info?: CurseForgeUploadErrorInfo) {
        super(soft, message);
        this.info = info;
    }
}

async function fetchJsonArray<T>(url: string, headers?: Record<string, string>): Promise<T[] | never> {
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const isSoft = response.status === 429 || response.status >= 500;
        throw new SoftError(isSoft, `${response.status} (${response.statusText})`);
    }

    let array: T[];
    try {
        array = await response.json();
    } catch {
        array = null;
    }

    if (!Array.isArray(array)) {
        throw new SoftError(true, "CurseForge sometimes returns Cloudflare's HTML page instead of its API response. Yeah, I know, very cool. Just wait 15-20 minutes, then try re-running this action, and you should be fine.");
    }
    return array;
}

let cachedCurseForgeVersions: CurseForgeVersions = null;
async function getCurseForgeVersions(token: string): Promise<CurseForgeVersions> {
    if (!cachedCurseForgeVersions) {
        cachedCurseForgeVersions = await loadCurseForgeVersions(token);
    }
    return cachedCurseForgeVersions;
}

async function loadCurseForgeVersions(token: string): Promise<CurseForgeVersions> {
    const versionTypes = await fetchJsonArray<{ id: number, slug: string }>(`${baseUrl}/game/version-types`, { "X-Api-Token": token });
    const javaVersionTypes = versionTypes.filter(x => x.slug.startsWith("java")).map(x => x.id);
    const minecraftVersionTypes = versionTypes.filter(x => x.slug.startsWith("minecraft")).map(x => x.id);
    const loaderVersionTypes = versionTypes.filter(x => x.slug.startsWith("modloader")).map(x => x.id);

    const versions = await fetchJsonArray<CurseForgeVersion>(`${baseUrl}/game/versions`, { "X-Api-Token": token });
    return versions.reduce((container, version) => {
        if (javaVersionTypes.includes(version.gameVersionTypeID)) {
            container.java.push(version);
        } else if (minecraftVersionTypes.includes(version.gameVersionTypeID)) {
            container.gameVersions.push(version);
        } else if (loaderVersionTypes.includes(version.gameVersionTypeID)) {
            container.loaders.push(version);
        }
        return container;
    }, { gameVersions: new Array<CurseForgeVersion>(), loaders: new Array<CurseForgeVersion>(), java: new Array<CurseForgeVersion>() });
}

export async function unifyGameVersion(gameVersion: string): Promise<string> {
    gameVersion = gameVersion.trim();
    const minecraftVersion = await findVersionByName(gameVersion);
    if (minecraftVersion) {
        return `${minecraftVersion.name}${(minecraftVersion.isSnapshot ? "-Snapshot" : "")}`;
    }
    return gameVersion.replace(/([^\w]|_)+/g, ".").replace(/[.-][a-zA-Z]\w+$/, "-Snapshot");
}

export function unifyJava(java: string): string {
    java = java.trim();
    const match = java.match(/(?:\d+\D)?(\d+)$/);
    if (match && match.length === 2) {
        return `Java ${match[1]}`;
    }
    return java;
}

async function addVersionIntersectionToSet(curseForgeVersions: CurseForgeVersion[], versions: string[], unify: (v: string) => string | Promise<string>, comparer: (cfv: CurseForgeVersion, v: string) => boolean, intersection: Set<number> ) {
    for (const version of versions) {
        const unifiedVersion = await unify(version);
        const curseForgeVersion = curseForgeVersions.find(x => comparer(x, unifiedVersion));
        if (curseForgeVersion) {
            intersection.add(curseForgeVersion.id);
        }
    }
}

export async function convertToCurseForgeVersions(gameVersions: string[], loaders: string[], java: string[], token: string): Promise<number[]> {
    const versions = new Set<number>();
    const curseForgeVersions = await getCurseForgeVersions(token);

    await addVersionIntersectionToSet(curseForgeVersions.gameVersions, gameVersions, unifyGameVersion, (cfv, v) => cfv.name === v, versions);
    await addVersionIntersectionToSet(curseForgeVersions.loaders, loaders, x => x.trim().toLowerCase(), (cfv, v) => cfv.slug === v, versions);
    await addVersionIntersectionToSet(curseForgeVersions.java, java, unifyJava, (cfv, v) => cfv.name === v, versions);

    return [...versions];
}

export async function uploadFile(id: string, data: Record<string, any>, file: File, token: string): Promise<number> {
    if (Array.isArray(data.relations?.projects) && (!data.relations.projects.length || data.parentFileID)) {
        delete data.relations;
    }

    if (data.gameVersions && data.parentFileID) {
        delete data.gameVersions;
    }

    const form = new FormData();
    form.append("file", file.getStream(), file.name);
    form.append("metadata", JSON.stringify(data));

    const response = await fetch(`${baseUrl}/projects/${id}/upload-file`, {
        method: "POST",
        headers: form.getHeaders({
            "X-Api-Token": token
        }),
        body: <any>form
    });

    if (!response.ok) {
        let errorText = response.statusText;
        let info: CurseForgeUploadErrorInfo;
        try {
            info = <CurseForgeUploadErrorInfo>await response.json();
            errorText += `, ${JSON.stringify(info)}`;
        } catch { }
        const isSoftError = response.status === 429 || response.status >= 500;
        throw new CurseForgeUploadError(isSoftError, `Failed to upload file: ${response.status} (${errorText})`, info);
    }

    return (<{ id: number }>await response.json()).id;
}

export async function getModSlug(modId: number): Promise<string> {
    const response = await fetch(`${newAPIBaseUrl}/v1/mods/${modId}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "x-api-key": apiKey
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to get mod slug: ${response.status} (${response.statusText})`);
    }
    return (<{data: {slug: string}}>await response.json()).data.slug;
}
