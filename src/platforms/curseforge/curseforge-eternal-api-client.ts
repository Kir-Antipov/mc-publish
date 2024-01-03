import { Fetch, HttpRequest, HttpResponse, createFetch, defaultResponse, throwOnError } from "@/utils/net";
import { SecureString } from "@/utils/security";
import { CurseForgeProject, isCurseForgeProjectId } from "./curseforge-project";

/**
 * The API version used for making requests to the CurseForge Eternal API.
 */
const CURSEFORGE_ETERNAL_API_VERSION = 1;

/**
 * The base URL for the CurseForge Eternal API.
 */
export const CURSEFORGE_ETERNAL_API_URL = `https://api.curseforge.com/v${CURSEFORGE_ETERNAL_API_VERSION}` as const;

/**
 * This is not an API key for an API that requires authentication even for public routes because it wants to track you.
 *
 * Trust me on this one.
 */
const DEFINITELY_NOT_AN_API_KEY = SecureString.from(Buffer.from([36, 50, 97, 36, 49, 48, 36, 81, 73, 47, 121, 101, 83, 110, 106, 105, 69, 90, 72, 90, 109, 70, 108, 109, 105, 74, 86, 73, 46, 50, 120, 109, 87, 89, 108, 80, 98, 107, 65, 88, 87, 56, 114, 81, 46, 120, 77, 54, 53, 118, 107, 116, 65, 115, 115, 97, 74, 112, 109, 105])).unwrap();

/**
 * Describes the configuration options for the CurseForge Eternal API client.
 */
export interface CurseForgeEternalApiOptions {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    fetch?: Fetch;

    /**
     * The base URL for the CurseForge Eternal API.
     *
     * Defaults to {@link CURSEFORGE_ETERNAL_API_URL}.
     */
    baseUrl?: string | URL;

    /**
     * The API token to be used for authentication with the CurseForge Eternal API.
     */
    token?: string;
}

/**
 * A client for interacting with the CurseForge Eternal API.
 */
export class CurseForgeEternalApiClient {
    /**
     * The Fetch implementation used for making HTTP requests.
     */
    private readonly _fetch: Fetch;

    /**
     * Creates a new {@link CurseForgeEternalApiClient} instance.
     *
     * @param options - The configuration options for the client.
     */
    constructor(options?: CurseForgeEternalApiOptions) {
        this._fetch = createFetch({
            handler: options?.fetch,
            baseUrl: options?.baseUrl || options?.fetch?.["baseUrl"] || CURSEFORGE_ETERNAL_API_URL,
            defaultHeaders: {
                "X-Api-Key": options?.token || DEFINITELY_NOT_AN_API_KEY,
            },
        })
        .use(defaultResponse({ response: r => HttpResponse.json(null, r) }))
        .use(throwOnError({ filter: x => !x.ok && x.status !== 404 }));
    }

    /**
     * Fetches a project by its id or slug.
     *
     * @param idOrSlug - The project id or slug.
     *
     * @returns The project, or `undefined` if not found.
     */
    async getProject(idOrSlug: number | string): Promise<CurseForgeProject | undefined> {
        if (!isCurseForgeProjectId(idOrSlug)) {
            const response = await this._fetch("/mods/search", HttpRequest.get().with({ gameId: 432, slug: idOrSlug }));
            return await response.json<{ data: CurseForgeProject[] }>().then(x => x?.data?.find(y => y.slug === idOrSlug)) ?? undefined;
        }

        const response = await this._fetch(`/mods/${idOrSlug}`);
        return await response.json<{ data: CurseForgeProject }>().then(x => x?.data) ?? undefined;
    }
}
