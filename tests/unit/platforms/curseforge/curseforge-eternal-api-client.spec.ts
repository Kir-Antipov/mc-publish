import { createFakeFetch } from "../../../utils/fetch-utils";
import { HttpResponse } from "@/utils/net/http-response";
import { CURSEFORGE_ETERNAL_API_URL, CurseForgeEternalApiClient } from "@/platforms/curseforge/curseforge-eternal-api-client";

const DB = Object.freeze([
    { id: 2, slug: "mod-id-2" },
    { id: 1, slug: "mod-id" },
]);

const ETERNAL_FETCH = createFakeFetch({
    baseUrl: CURSEFORGE_ETERNAL_API_URL,
    requiredHeaders: ["X-Api-Key"],

    GET: {
        "^\\/mods\\/search\\?(?:gameId=432&)?slug=([^&]*)": ([slug]) => {
            const mods = DB.filter(x => x.slug.includes(slug));
            return { data: mods };
        },

        "^\\/mods\\/(\\d+)": ([id]) => {
            const mod = DB.find(x => x.id === +id);
            return mod ? { data: mod } : HttpResponse.json({ success: false }, { status: 404 });
        },
    },
});

describe("CurseForgeEternalApiClient", () => {
    describe("getProject", () => {
        test("returns a project with the specified slug", async () => {
            const api = new CurseForgeEternalApiClient({ fetch: ETERNAL_FETCH });

            expect(await api.getProject("mod-id")).toHaveProperty("slug", "mod-id");
            expect(await api.getProject("mod-id-2")).toHaveProperty("slug", "mod-id-2");
        });

        test("returns a project with the specified id", async () => {
            const api = new CurseForgeEternalApiClient({ fetch: ETERNAL_FETCH });

            expect(await api.getProject(1)).toHaveProperty("id", 1);
            expect(await api.getProject("1")).toHaveProperty("id", 1);

            expect(await api.getProject(2)).toHaveProperty("id", 2);
            expect(await api.getProject("2")).toHaveProperty("id", 2);
        });

        test("returns undefined if project with the given slug doesn't exist", async () => {
            const api = new CurseForgeEternalApiClient({ fetch: ETERNAL_FETCH });

            expect(await api.getProject("mod-id-3")).toBeUndefined();
            expect(await api.getProject("mod-id-4")).toBeUndefined();
        });

        test("returns undefined if project with the given id doesn't exist", async () => {
            const api = new CurseForgeEternalApiClient({ fetch: ETERNAL_FETCH });

            expect(await api.getProject(3)).toBeUndefined();
            expect(await api.getProject("3")).toBeUndefined();
        });
    });
});
