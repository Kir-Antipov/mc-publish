import FormData from "form-data";
// import fetch, { Response } from "node-fetch";
import got, {CancelableRequest, Response} from 'got'
import { URLSearchParams } from "url";
import File from "../io/file";
import SoftError from "../soft-error";

const baseUrl = "https://api.modrinth.com/v2";

interface ModrinthProject {
    id: string;
    slug: string;
}

interface ModrinthVersion {
    id: string;
    loaders: string[];
    game_versions: string[];
    featured: boolean;
}

export function createVersion(modId: string, data: Record<string, any>, files: File[], token: string): Promise<ModrinthVersion> {
    data = {
        featured: true,
        dependencies: [],
        ...data,
        project_id: modId,
        primary_file: files.length ? "0" : undefined,
        file_parts: files.map((_, i) => i.toString())
    };

    const form = new FormData();
    form.append("data", JSON.stringify(data));
    for (let i = 0; i < files.length; ++i) {
        const file = files[i];
        form.append(i.toString(), file.getStream(), file.name);
    }

    const response = got(`${baseUrl}/version`, {
        method: "POST",
        headers: form.getHeaders({
            Authorization: token,
        }),
        body: <any>form
    });

    return processResponse(response, undefined, (x, msg) => new SoftError(x, `Failed to upload file: ${msg}`));
}

export function getProject(idOrSlug: string): Promise<ModrinthProject> {
    return processResponse(got.get(`${baseUrl}/project/${idOrSlug}`), { 404: () => <ModrinthProject>null });
}

export function getVersions(idOrSlug: string, loaders?: string[], gameVersions?: string[], featured?: boolean, token?: string): Promise<ModrinthVersion[]> {
    const urlParams = new URLSearchParams();
    if (loaders) {
        urlParams.append("loaders", JSON.stringify(loaders));
    }
    if (gameVersions) {
        urlParams.append("game_versions", JSON.stringify(gameVersions));
    }
    if (typeof featured === "boolean") {
        urlParams.append("featured", String(featured));
    }

    const response = got(`${baseUrl}/project/${idOrSlug}/version?${urlParams}`, token ? {
        headers: { Authorization: token }
    } : undefined);
    return processResponse(response, { 404: () => <ModrinthVersion[]>[] });
}

export async function modifyVersion(id: string, version: Partial<ModrinthVersion>, token: string): Promise<boolean> {
    const response = await got(`${baseUrl}/version/${id}`, {
        method: "PATCH",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(version)
    });

    return response.ok;
}

async function processResponse<T>(response: CancelableRequest<Response<string>> | Response<unknown>, mappers?: Record<number, (response: Response) => T | Promise<T>>, errorFactory?: (isServerError: boolean, message: string, response: any) => Error | Promise<Error>): Promise<T | never> {
    response = await response;

    if (response.statusCode === 404) {
        return mappers? mappers[response.statusCode](response) : null;
    }
    
    if (response.ok) { 
        // @ts-expect-error
        return JSON.parse(response.body);
    }

    const mapper = mappers?.[(await response).statusCode];
    if (mapper) {
        const mapped = await mapper(response);
        if (mapped !== undefined) {
            return mapped;
        }
    }

    let errorText = response.statusMessage;
    try {
        errorText += `, ${response.body}`;
    } catch { }
    errorText = `${response.statusCode} (${errorText})`;
    const isSoftError = response.statusCode === 429 || response.statusCode >= 500;
    if (errorFactory) {
        throw errorFactory(isSoftError, errorText, response);
    } else {
        throw new SoftError(isSoftError, errorText);
    }
}
