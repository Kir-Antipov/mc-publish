import FormData from "form-data";
import fetch, { Response } from "node-fetch";
import { File } from "./file";
import SoftError from "./soft-error";

const baseUrl = "https://api.modrinth.com/v2";

interface ModrinthProject {
    id: string;
    slug: string;
}

interface ModrinthVersion {
    id: string;
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

    const response = fetch(`${baseUrl}/version`, {
        method: "POST",
        headers: form.getHeaders({
            Authorization: token,
        }),
        body: <any>form
    });

    return processResponse(response, undefined, (x, msg) => new SoftError(x, `Failed to upload file: ${msg}`));
}

export function getProject(idOrSlug: string): Promise<ModrinthProject> {
    return processResponse(fetch(`${baseUrl}/project/${idOrSlug}`), { 404: () => <ModrinthProject>null });
    return await response.json();
}

async function processResponse<T>(response: Response | Promise<Response>, mappers?: Record<number, (response: Response) => T | Promise<T>>, errorFactory?: (isServerError: boolean, message: string, response: Response) => Error | Promise<Error>): Promise<T | never> {
    response = await response;
    if (response.ok) {
        return <T>await response.json();
    }

    const mapper = mappers?.[response.status];
    if (mapper) {
        const mapped = await mapper(response);
        if (mapped !== undefined) {
            return mapped;
        }
    }

    let errorText = response.statusText;
    try {
        errorText += `, ${await response.text()}`;
    } catch { }
    errorText = `${response.status} (${errorText})`;
    const isServerError = response.status >= 500;
    if (errorFactory) {
        throw errorFactory(isServerError, errorText, response);
    } else {
        throw new SoftError(isServerError, errorText);
    }
}
