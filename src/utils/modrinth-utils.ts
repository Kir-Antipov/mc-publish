import { FormData } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import fetch from "node-fetch";
import { File } from "./file-utils";

export async function createVersion(id: string, data: Record<string, any>, files: File[], token: string): Promise<string> {
    data = {
        ...data,
        mod_id: id,
        file_parts: files.map(x => x.name)
    };

    const form = new FormData();
    form.append("data", JSON.stringify(data));
    for (const file of files) {
        form.append(file.name, await fileFromPath(file.path), file.name);
    }

    const response = await fetch("https://api.modrinth.com/api/v1/version", {
        method: "POST",
        headers: { Authorization: token },
        body: <any>form
    });

    if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.status} (${response.statusText})`)
    }

    return (<{ id: string }>await response.json()).id;
}