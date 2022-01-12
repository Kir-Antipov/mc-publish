import { FormData } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import fetch from "node-fetch";
import { File } from "./file";
import { computeHash } from "./hash-utils";
import SoftError from "./soft-error";

export async function createVersion(modId: string, data: Record<string, any>, files: File[], token: string): Promise<string> {
    data = {
        dependencies: [],
        ...data,
        mod_id: modId,
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
        const isServerError = response.status >= 500;
        throw new SoftError(isServerError, `Failed to upload file: ${response.status} (${errorText})`);
    }

    const versionId = (<{ id: string }>await response.json()).id;
    const primaryFile = files[0];
    if (primaryFile) {
        await makeFilePrimary(versionId, primaryFile.path, token);
    }
    return versionId;
}

export async function makeFilePrimary(versionId: string, filePath: string, token: string): Promise<boolean> {
    const algorithm = "sha1";
    const hash = (await computeHash(filePath, algorithm)).digest("hex");

    const response = await fetch(`https://api.modrinth.com/api/v1/version/${versionId}`, {
        method: "PATCH",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            primary_file: [algorithm, hash]
        })
    });
    return response.ok;
}
