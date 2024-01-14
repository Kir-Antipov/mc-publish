import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mockFs from "mock-fs";
import { createFakeFetch } from "../../../utils/fetch-utils";
import { FormData } from "@/utils/net/form-data";
import { HttpResponse } from "@/utils/net/http-response";
import { CurseForgeDependencyType } from "@/platforms/curseforge/curseforge-dependency-type";
import { CurseForgeVersionInitMetadata } from "@/platforms/curseforge/curseforge-version";
import { CURSEFORGE_UPLOAD_API_URL, CurseForgeUploadApiClient } from "@/platforms/curseforge/curseforge-upload-api-client";

const FILES = Object.freeze([
    "fabric.mod.json",
    "mods.toml",
    "quilt.mod.json",
]) as string[];

const DB = Object.freeze({
    versionTypes: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/curseforge/version-types.json"), "utf8")
    )),

    versions: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/curseforge/versions.json"), "utf8")
    )),

    projects: Object.freeze([
        {
            id: 1,
            slug: "mod",

            // 1.19, Fabric, Java 17
            game_versions: [9186, 7499, 8326],
        },

        {
            id: 2,
            slug: "plugin",

            // 1.19+Bukkit
            game_versions: [9190],
        },

        {
            id: 4,
            slug: "resource-pack",

            // 1.19
            game_versions: [9186],
        },

        {
            id: 5,
            slug: "addon",

            // 1.19+Addon
            game_versions: [9189],
        },
    ]),

    files: Object.freeze([
        {
            id: 1,
            name: "Mod v1.0.0",
            project_id: 1,
            url: "https://www.curseforge.com/api/v1/mods/1/files/1/download",
            version_id: 1,
        },
        {
            id: 2,
            name: "mods.toml",
            project_id: 1,
            url: "https://www.curseforge.com/api/v1/mods/1/files/2/download",
            version_id: 1,
        },
        {
            id: 3,
            name: "quilt.mod.json",
            project_id: 1,
            url: "https://www.curseforge.com/api/v1/mods/1/files/3/download",
            version_id: 1,
        },

        {
            id: 4,
            name: "Plugin v1.0.0",
            project_id: 2,
            url: "https://www.curseforge.com/api/v1/mods/2/files/4/download",
            version_id: 4,
        },

        {
            id: 5,
            name: "Resource Pack v1.0.0",
            project_id: 4,
            url: "https://www.curseforge.com/api/v1/mods/4/files/5/download",
            version_id: 5,
        },

        {
            id: 6,
            name: "Addon v1.0.0",
            project_id: 5,
            url: "https://www.curseforge.com/api/v1/mods/5/files/6/download",
            version_id: 6,
        },
    ]),
});

const CURSEFORGE_FETCH = createFakeFetch({
    baseUrl: CURSEFORGE_UPLOAD_API_URL,
    requiredHeaders: ["X-Api-Token"],

    GET: {
        "^\\/game\\/version-types": () => DB.versionTypes,

        "^\\/game\\/versions": () => DB.versions,
    },

    POST: {
        "^\\/projects\\/(\\d+)\\/upload-file": ([id], { body }) => {
            const project = DB.projects.find(x => x.id === +id);
            if (!project) {
                return HttpResponse.json({ errorCode: 404, errorMessage: `Project not found: '${id}'` }, { status: 404 });
            }

            const formData = body as FormData;
            const fileName = formData.get("file")?.["name"] as string;
            const metadata = JSON.parse(formData.get("metadata") as string) as CurseForgeVersionInitMetadata;
            const dependencies = metadata.relations?.projects?.map(x => x.slug) || [];
            const unknownDependency = dependencies.find(x => !DB.projects.find(y => x === y.slug));
            const unknownGameVersion = metadata.gameVersions?.find(x => !project.game_versions.includes(x));

            if (metadata.relations && !dependencies.length || metadata.parentFileID && dependencies.length) {
                return HttpResponse.json({ errorCode: 400, errorMessage: "We don't know how to parse an empty array, so just like fuck you, lmao" }, { status: 400 });
            }

            if (!!metadata.gameVersions?.length === !!metadata.parentFileID) {
                return HttpResponse.json({ errorCode: 400, errorMessage: "At least one game version is required" }, { status: 400 });
            }

            if (unknownGameVersion) {
                return HttpResponse.json({ errorCode: 1009, errorMessage: `Invalid game version: '${unknownGameVersion}'` }, { status: 400 });
            }

            if (unknownDependency) {
                return HttpResponse.json({ errorCode: 1018, errorMessage: `Invalid slug in project relations: '${unknownDependency}'` }, { status: 400 });
            }

            const uploadedFile = DB.files.find(x => x.project_id === project.id && [fileName, metadata.displayName].includes(x.name));
            expect(uploadedFile).toBeDefined();

            return HttpResponse.json(uploadedFile, { status: 200 });
        },
    },
});

beforeEach(() => {
    const fakeFiles = FILES.reduce((a, b) => ({ ...a, [b]: "" }), {});

    mockFs(fakeFiles);
});

afterEach(() => {
    mockFs.restore();
});

describe("CurseForgeUploadApiClient", () => {
    describe("getGameVersionTypes", () => {
        test("returns game version types", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const versionTypes = await api.getGameVersionTypes();

            expect(versionTypes?.length).toBeGreaterThan(0);
            for (const versionType of versionTypes) {
                expect(versionType).toHaveProperty("id");
                expect(versionType).toHaveProperty("name");
                expect(versionType).toHaveProperty("slug");
            }
        });

        test("returned game version types contain one representing Bukkit plugins", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const versionTypes = await api.getGameVersionTypes();

            expect(versionTypes).toContainEqual({
                id: 1,
                slug: "bukkit",
                name: "Bukkit",
            });
        });
    });

    describe("getGameVersions", () => {
        test("returns game versions", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const versions = await api.getGameVersions();

            expect(versions?.length).toBeGreaterThan(0);
            for (const version of versions) {
                expect(version).toHaveProperty("id");
                expect(version).toHaveProperty("gameVersionTypeID");
                expect(version).toHaveProperty("name");
                expect(version).toHaveProperty("slug");
            }
        });
    });

    describe("getGameVersionMap", () => {
        test("returns game version map", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const map = await api.getGameVersionMap();

            expect(map.environments?.length).toBeGreaterThan(0);
            expect(map.game_versions?.length).toBeGreaterThan(0);
            expect(map.game_versions_for_addons?.length).toBeGreaterThan(0);
            expect(map.game_versions_for_plugins?.length).toBeGreaterThan(0);
            expect(map.java_versions?.length).toBeGreaterThan(0);
            expect(map.loaders?.length).toBeGreaterThan(0);
        });
    });

    describe("createVersion", () => {
        test("creates a new mod version", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const expectedVersionId = 1;
            const projectId = 1;
            const name = "Mod v1.0.0";
            const fileCount = 1;

            const version = await api.createVersion({
                project_id: projectId,
                files: FILES.slice(0, fileCount),
                name,
                game_versions: ["1.19"],
                loaders: ["fabric"],
                java_versions: ["Java 17"],
            });

            expect(version).toEqual({
                id: expectedVersionId,
                project_id: projectId,
                name,
                files: DB.files.filter(x => x.project_id === projectId).slice(0, fileCount),
            });
        });

        test("creates a new plugin version", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const expectedVersionId = 4;
            const projectId = 2;
            const name = "Plugin v1.0.0";
            const fileCount = 1;

            const version = await api.createVersion({
                project_id: projectId,
                files: FILES.slice(0, fileCount),
                name,
                game_versions: ["1.19"],
                loaders: ["fabric"],
                java_versions: ["Java 17"],
            });

            expect(version).toEqual({
                id: expectedVersionId,
                project_id: projectId,
                name,
                files: DB.files.filter(x => x.project_id === projectId).slice(0, fileCount),
            });
        });

        test("creates a new resource pack version", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const expectedVersionId = 5;
            const projectId = 4;
            const name = "Resource Pack v1.0.0";
            const fileCount = 1;

            const version = await api.createVersion({
                project_id: projectId,
                files: FILES.slice(0, fileCount),
                name,
                game_versions: ["1.19"],
                loaders: ["fabric"],
                java_versions: ["Java 17"],
            });

            expect(version).toEqual({
                id: expectedVersionId,
                project_id: projectId,
                name,
                files: DB.files.filter(x => x.project_id === projectId).slice(0, fileCount),
            });
        });

        test("creates a new addon version", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const expectedVersionId = 6;
            const projectId = 5;
            const name = "Addon v1.0.0";
            const fileCount = 1;

            const version = await api.createVersion({
                project_id: projectId,
                files: FILES.slice(0, fileCount),
                name,
                game_versions: ["1.19"],
                loaders: ["fabric"],
                java_versions: ["Java 17"],
            });

            expect(version).toEqual({
                id: expectedVersionId,
                project_id: projectId,
                name,
                files: DB.files.filter(x => x.project_id === projectId).slice(0, fileCount),
            });
        });

        test("creates a new version with multiple files", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const expectedVersionId = 1;
            const projectId = 1;
            const name = "Mod v1.0.0";
            const fileCount = 3;

            const version = await api.createVersion({
                project_id: projectId,
                files: FILES.slice(0, fileCount),
                name,
                game_versions: ["1.19"],
                loaders: ["fabric"],
                java_versions: ["Java 17"],
            });

            expect(version).toEqual({
                id: expectedVersionId,
                project_id: projectId,
                name,
                files: DB.files.filter(x => x.project_id === projectId).slice(0, fileCount),
            });
        });

        test("creates a new version with dependencies", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const expectedVersionId = 1;
            const projectId = 1;
            const name = "Mod v1.0.0";
            const fileCount = 3;

            const version = await api.createVersion({
                project_id: projectId,
                files: FILES.slice(0, fileCount),
                name,
                game_versions: ["1.19"],
                loaders: ["fabric"],
                java_versions: ["Java 17"],
                dependencies: [
                    { slug: "addon", type: CurseForgeDependencyType.OPTIONAL_DEPENDENCY },
                    { slug: "resource-pack", type: CurseForgeDependencyType.REQUIRED_DEPENDENCY },
                    { slug: "plugin", type: CurseForgeDependencyType.EMBEDDED_LIBRARY },
                ],
            });

            expect(version).toEqual({
                id: expectedVersionId,
                project_id: projectId,
                name,
                files: DB.files.filter(x => x.project_id === projectId).slice(0, fileCount),
            });
        });

        test("creates a new version while filtering out invalid dependencies", async () => {
            const api = new CurseForgeUploadApiClient({ fetch: CURSEFORGE_FETCH, token: "token" });

            const expectedVersionId = 1;
            const projectId = 1;
            const name = "Mod v1.0.0";
            const fileCount = 3;

            const version = await api.createVersion({
                project_id: projectId,
                files: FILES.slice(0, fileCount),
                name,
                game_versions: ["1.19"],
                loaders: ["fabric"],
                java_versions: ["Java 17"],
                dependencies: [
                    { slug: "addon", type: CurseForgeDependencyType.OPTIONAL_DEPENDENCY },
                    { slug: "addon-1", type: CurseForgeDependencyType.OPTIONAL_DEPENDENCY },
                    { slug: "resource-pack", type: CurseForgeDependencyType.REQUIRED_DEPENDENCY },
                    { slug: "plugin", type: CurseForgeDependencyType.EMBEDDED_LIBRARY },
                    { slug: "plugin-1", type: CurseForgeDependencyType.EMBEDDED_LIBRARY },
                ],
            });

            expect(version).toEqual({
                id: expectedVersionId,
                project_id: projectId,
                name,
                files: DB.files.filter(x => x.project_id === projectId).slice(0, fileCount),
            });
        });
    });
});
