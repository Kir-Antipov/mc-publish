import FormData from "form-data";
import fetch, { Response } from "node-fetch";
import File from "../io/file";
import SoftError from "../soft-error";

const baseUrl = "https://hangar.papermc.io/api/v1";

enum HangarPlatform {
    Paper = "PAPER",
    Waterfall = "WATERFALL",
    Velocity = "VELOCITY",
}

interface HangarUploadedVersion {
    url: string;
}

interface HangarTokenResponse {
    token: string;
    expiresIn: number;
}

export function createVersion(author: string, slug: string, data: Record<string, any>, files: File[], loaders: string[], gameVersions: string[], token: string): Promise<HangarUploadedVersion> {
    data = {
        files: [],
        platformDependencies: {},
        pluginDependencies: {},
        ...data,
    }

    const form = new FormData();
    const platforms = Object.values(HangarPlatform).filter(platform => loaders.find((l) => l.toLowerCase() === platform.toLowerCase()));
    files.forEach((file) => {
        form.append('files', file.getStream(), {
            filename: file.name,
            contentType: 'application/octet-stream'
        });
        data.files.push({
            platforms: platforms
        })
    });
    platforms.forEach((platform) => {
        data.platformDependencies[platform] = gameVersions;
    });
 
    console.log("[debug] " + JSON.stringify(data));
    form.append('versionUpload', JSON.stringify(data), { contentType: 'application/json' });

    const response = fetch(`${baseUrl}/projects/${author}/${slug}/upload`, {
        method: 'POST',
        headers: form.getHeaders({
            'Authorization': token,
            'User-Agent': 'mc-publish (+https://github.com/Kir-Antipov/mc-publish)',
            'accept': 'application/json'
        }),
        body: <any>form
    });

    return processResponse(response, undefined, (x, msg) => new SoftError(x, `Failed to upload file: ${msg}`));

}

export function authenticate(apiKey: string): Promise<HangarTokenResponse> {
    return processResponse(fetch(`${baseUrl}/authenticate?apiKey=${apiKey}`, {
        method: "POST",
        headers: {
            "User-Agent": "mc-publish (+https://github.com/Kir-Antipov/mc-publish)"
        }
    }));
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
    const isSoftError = response.status === 429 || response.status >= 500;
    if (errorFactory) {
        throw errorFactory(isSoftError, errorText, response);
    } else {
        throw new SoftError(isSoftError, errorText);
    }
}
