import FormData from "form-data";
import fetch from "node-fetch";
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

export async function createVersion(modId: string, data: Record<string, any>, files: File[], token: string): Promise<ModrinthVersion> {
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

    const response = await fetch(`${baseUrl}/version`, {
        method: "POST",
        headers: form.getHeaders({
            Authorization: token,
        }),
        body: <any>form
    });

    if (!response.ok) {
        let errorText = response.statusText;
        try {
            errorText += `, ${await response.text()}`;
        } catch { }
        const isServerError = response.status >= 500;
        throw new SoftError(isServerError, `Failed to upload file: ${response.status} (${errorText})`);
    }

    return await response.json();
}

export async function getProject(idOrSlug: string): Promise<ModrinthProject> {
    const response = await fetch(`${baseUrl}/project/${idOrSlug}`);
    if (response.ok) {
        return await response.json();
    }

    if (response.status === 404) {
        return null;
    }

    const isServerError = response.status >= 500;
    throw new SoftError(isServerError, `${response.status} (${response.statusText})`);
}
