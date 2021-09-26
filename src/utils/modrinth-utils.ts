import { FormData } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import fetch from "node-fetch";
import { File } from "./file-utils";

export async function createVersion(id: string, data: Record<string, any>, files: File[], token: string): Promise<string> {
    data = {
        dependencies: [],
        ...data,
        mod_id: id,
        file_parts: files.map((_, i) => i.toString())
    };

    const form = new FormData();
    form.append("data", JSON.stringify(data));
    for (let i = 0; i < files.length; ++i) {
        const file = files[i];
        form.append(i.toString(), await fileFromPath(file.path), file.name);
    }

    const response = await fetch("https://api.modrinth.com/api/v1/version", {
        method: "POST",
        headers: { Authorization: token },
        body: <any>form
    });

    if (!response.ok) {
        let errorText = response.statusText;
        try {
            errorText += `, ${await response.text()}`;
        } catch { }
        throw new Error(`Failed to upload file: ${response.status} (${errorText})`);
    }

    return (<{ id: string }>await response.json()).id;
}