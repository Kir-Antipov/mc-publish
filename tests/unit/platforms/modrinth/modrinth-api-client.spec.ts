import mockFs from "mock-fs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createFakeFetch } from "../../../utils/fetch-utils";
import { FormData } from "@/utils/net/form-data";
import { HttpResponse } from "@/utils/net/http-response";
import { ModrinthGameVersion } from "@/platforms/modrinth/modrinth-game-version";
import { ModrinthLoader } from "@/platforms/modrinth/modrinth-loader";
import { ModrinthUnfeatureMode } from "@/platforms/modrinth/modrinth-unfeature-mode";
import { ModrinthVersion, ModrinthVersionInit, ModrinthVersionPatch } from "@/platforms/modrinth/modrinth-version";
import { ModrinthProject, ModrinthProjectPatch } from "@/platforms/modrinth/modrinth-project";
import { MODRINTH_API_URL, ModrinthApiClient } from "@/platforms/modrinth/modrinth-api-client";

const DB = Object.freeze({
    loaders: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/modrinth/loader.json"), "utf8")
    )) as ModrinthLoader[],

    gameVersions: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/modrinth/game_version.json"), "utf8")
    )) as ModrinthGameVersion[],

    projects: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/modrinth/projects.json"), "utf8")
    )) as ModrinthProject[],

    versions: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/modrinth/versions.json"), "utf8")
    )) as ModrinthVersion[],
});

const MODRINTH_FETCH = createFakeFetch({
    baseUrl: MODRINTH_API_URL,
    requiredHeaders: ["Authorization"],

    GET: {
        "^\\/tag\\/loader": () => DB.loaders,

        "^\\/tag\\/game_version": () => DB.gameVersions,

        "^\\/project\\/([^/]+)(\\/check)?$": ([idOrSlug, isCheck]) => {
            const project = DB.projects.find(x => x.id === idOrSlug || x.slug === idOrSlug);
            if (!project) {
                return HttpResponse.text("Not found", { status: 404 });
            }

            return isCheck ? { id: project.id } : project;
        },

        "^\\/projects\\?ids=(.+)": ([ids]) => {
            const idOrSlugs = JSON.parse(decodeURIComponent(ids)) as string[];
            const projects = DB.projects.filter(x => idOrSlugs.includes(x.id) || idOrSlugs.includes(x.slug));
            return projects;
        },

        "^\\/version\\/([^/]+)$": ([id]) => {
            const version = DB.versions.find(x => x.id === id);
            return version || HttpResponse.text("Not found", { status: 404 });
        },

        "^\\/versions\\?ids=(.+)": ([ids]) => {
            const versionIds = JSON.parse(decodeURIComponent(ids)) as string[];
            const versions = DB.versions.filter(x => versionIds.includes(x.id));
            return versions;
        },

        "^\\/project\\/([^/]+)\\/version(\\?.+)?": ([idOrSlug, params]) => {
            const project = DB.projects.find(x => x.id === idOrSlug || x.slug === idOrSlug);
            if (!project) {
                return HttpResponse.text("Not found", { status: 404 });
            }

            const urlParams = new URLSearchParams(decodeURIComponent(params));
            const loaders = JSON.parse(urlParams.get("loaders")) as string[];
            const gameVersions = JSON.parse(urlParams.get("game_versions")) as string[];
            const featured = JSON.parse(urlParams.get("featured")) as boolean;
            const topFeatured = !DB.versions.some(x => x.project_id === project.id && x.featured);

            const versions = DB.versions
                .filter(x => x.project_id === project.id)
                .filter(x => loaders === null || x.loaders.some(y => loaders.includes(y)))
                .filter(x => gameVersions === null || x.game_versions.some(y => gameVersions.includes(y)))
                .filter((x, i) => featured === null || x.featured === featured || topFeatured && i < 10);

            return versions;
        },
    },

    POST: {
        "^\\/version$": (_, { body }) => {
            const formData = body as FormData;
            const data = JSON.parse(formData.get("data") as string) as ModrinthVersionInit;
            const project = DB.projects.find(x => x.id === data.project_id);
            if (!project) {
                return HttpResponse.text("Not found", { status: 404 });
            }

            const primaryFilePart = data["primary_file"] as string;
            const fileParts = data["file_parts"] as string[];
            const primaryFileName = formData.get(primaryFilePart)?.["name"] as string;
            const fileNames = fileParts.map(x => formData.get(x)?.["name"] as string);

            const version = DB.versions.find(x => x.project_id === data.project_id && x.name === data.name);
            expect(version).toBeDefined();

            expect(version.name).toBe(data.name);
            expect(version.version_number).toBe(data.version_number);
            expect(version.project_id).toBe(data.project_id);
            expect(version.changelog).toBe(data.changelog);
            expect(version.dependencies).toEqual(data.dependencies);
            expect(version.game_versions).toEqual(data.game_versions);
            expect(version.version_type).toBe(data.version_type);
            expect(version.loaders).toEqual(data.loaders);
            expect(version.featured).toBe(data.featured);
            expect(version.status).toBe(data.status);
            expect(version.requested_status).toBe(data.requested_status);

            expect(version.files.map(x => x.filename)).toEqual(fileNames);
            expect((version.files.find(x => x.primary) || version.files[0]).filename).toBe(primaryFileName);

            return version;
        },
    },

    PATCH: {
        "^\\/project\\/([^/]+)$": ([idOrSlug], { body }) => {
            const project = DB.projects.find(x => x.id === idOrSlug || x.slug === idOrSlug);
            if (!project) {
                return HttpResponse.text("Not found", { status: 404 });
            }

            const patch = JSON.parse(body as string) as ModrinthProjectPatch;

            expect(patch.id).toBe(idOrSlug);
            expect(patch.slug).toBe(project.slug);
            expect(patch.title).toBe(project.title);
            expect(patch.description).toBe(project.description);
            expect(patch.categories).toEqual(project.categories);
            expect(patch.client_side).toBe(project.client_side);
            expect(patch.server_side).toBe(project.server_side);
            expect(patch.body).toBe(project.body);
            expect(patch.additional_categories).toEqual(project.additional_categories);
            expect(patch.issues_url).toBe(project.issues_url);
            expect(patch.source_url).toBe(project.source_url);
            expect(patch.wiki_url).toBe(project.wiki_url);
            expect(patch.discord_url).toBe(project.discord_url);
            expect(patch.donation_urls).toEqual(project.donation_urls);
            expect(patch.status).toBe(project.status);
            expect(patch.license_id).toBe(project.license.id);
            expect(patch.license_url).toBe(project.license.url);

            return HttpResponse.text("Success", { status: 204 });
        },

        "^\\/version\\/([^/]+)$": ([id], { body }) => {
            const version = DB.versions.find(x => x.id === id);
            if (!version) {
                return HttpResponse.text("Not found", { status: 404 });
            }

            const patch = JSON.parse(body as string) as ModrinthVersionPatch;

            expect(patch.id).toBe(id);
            if (Object.keys(patch).length > 2 || patch.featured === undefined) {
                expect(patch.name).toBe(version.name);
                expect(patch.version_number).toBe(version.version_number);
                expect(patch.changelog).toBe(version.changelog);
                expect(patch.dependencies).toEqual(version.dependencies);
                expect(patch.game_versions).toEqual(version.game_versions);
                expect(patch.version_type).toBe(version.version_type);
                expect(patch.loaders).toEqual(version.loaders);
                expect(patch.featured).toBe(version.featured);
                expect(patch.status).toBe(version.status);
                expect(patch.requested_status).toBe(version.requested_status);
                expect(patch.primary_file).toEqual(version.files.filter(x => x.primary).map(x => ["sha1", x.hashes.sha1])[0]);
            }

            return HttpResponse.text("Success", { status: 204 });
        },
    },

    DELETE: {
        "^\\/project\\/([^/]+)$": ([idOrSlug]) => {
            const project = DB.projects.find(x => x.id === idOrSlug || x.slug === idOrSlug);
            return project ? HttpResponse.text("Success", { status: 204 }) : HttpResponse.text("Not found", { status: 404 });
        },

        "^\\/version\\/([^/]+)$": ([id]) => {
            const version = DB.versions.find(x => x.id === id);
            return version ? HttpResponse.text("Success", { status: 204 }) : HttpResponse.text("Not found", { status: 404 });
        },
    },
});

beforeEach(() => {
    const fileNames = DB.versions.flatMap(x => x.files).map(x => x.filename);
    const fakeFiles = fileNames.reduce((a, b) => ({ ...a, [b]: "" }), {});

    mockFs(fakeFiles);
});

afterEach(() => {
    mockFs.restore();
});

describe("ModrinthApiClient", () => {
    describe("getLoaders", () => {
        test("returns loaders", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const loaders = await api.getLoaders();

            expect(loaders).toBeDefined();
            expect(loaders.map(x => x.name)).toContain("fabric");
        });
    });

    describe("getGameVersions", () => {
        test("returns game versions", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const gameVersions = await api.getGameVersions();

            expect(gameVersions).toBeDefined();
            expect(gameVersions.map(x => x.version)).toContain("1.18.2");
        });
    });

    describe("getProject", () => {
        test("returns a project by its id", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const project = await api.getProject("gvQqBUqZ");

            expect(project).toBeDefined();
            expect(project.slug).toBe("lithium");
        });

        test("returns a project by its slug", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const project = await api.getProject("lithium");

            expect(project).toBeDefined();
            expect(project.id).toBe("gvQqBUqZ");
        });

        test("returns undefined if a project with the given id doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const project = await api.getProject("QQQQQQQQ");

            expect(project).toBeUndefined();
        });

        test("returns undefined if a project with the given slug doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const project = await api.getProject("not-a-real-slug");

            expect(project).toBeUndefined();
        });
    });

    describe("getProjectId", () => {
        test("returns a project's id by its id (yay, technology!)", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const id = await api.getProjectId("gvQqBUqZ");

            expect(id).toBe("gvQqBUqZ");
        });

        test("returns a project's id by its slug", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const id = await api.getProjectId("lithium");

            expect(id).toBe("gvQqBUqZ");
        });

        test("returns undefined if a project with the given id doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const id = await api.getProjectId("QQQQQQQQ");

            expect(id).toBeUndefined();
        });

        test("returns undefined if a project with the given slug doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const id = await api.getProject("not-a-real-slug");

            expect(id).toBeUndefined();
        });
    });

    describe("getProjects", () => {
        test("returns projects by their ids", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const projects = await api.getProjects(["P7dR8mSH", "AANobbMI", "gvQqBUqZ"]);

            expect(projects).toBeDefined();
            expect(projects.map(x => x.slug)).toEqual(["fabric-api", "sodium", "lithium"]);
        });

        test("returns projects by their slugs", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const projects = await api.getProjects(["fabric-api", "sodium", "lithium"]);

            expect(projects).toBeDefined();
            expect(projects.map(x => x.id)).toEqual(["P7dR8mSH", "AANobbMI", "gvQqBUqZ"]);
        });

        test("returns projects by their ids and/or slugs", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const projects = await api.getProjects(["fabric-api", "AANobbMI", "lithium"]);

            expect(projects).toBeDefined();
            expect(projects.map(x => x.id)).toEqual(["P7dR8mSH", "AANobbMI", "gvQqBUqZ"]);
            expect(projects.map(x => x.slug)).toEqual(["fabric-api", "sodium", "lithium"]);
        });

        test("returns an empty array if no ids and/or slugs were provided", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const projects = await api.getProjects([]);

            expect(projects).toEqual([]);
        });

        test("returns an empty array if projects with the given ids don't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const projects = await api.getProjects(["AAAAAAAA", "BBBBBBBB", "QQQQQQQQ"]);

            expect(projects).toEqual([]);
        });

        test("returns an empty array if projects with the given slugs don't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const projects = await api.getProjects(["not-a-real-slug", "not-a-real-slug-2", "not-a-real-slug-3"]);

            expect(projects).toEqual([]);
        });
    });

    describe("updateProject", () => {
        test("returns true if the project with the specified id has been successfully updated", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });
            const project = DB.projects.find(x => x.id === "gvQqBUqZ");
            const patch = {
                ...project,
                id: project.id,
                license_id: project.license.id,
                license_url: project.license.url,
            } as ModrinthProjectPatch;

            const success = await api.updateProject(patch);

            expect(success).toBe(true);
        });

        test("returns true if the project with the specified slug has been successfully updated", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });
            const project = DB.projects.find(x => x.id === "gvQqBUqZ");
            const patch = {
                ...project,
                id: project.slug,
                license_id: project.license.id,
                license_url: project.license.url,
            } as ModrinthProjectPatch;

            const success = await api.updateProject(patch);

            expect(success).toBe(true);
        });

        test("returns false if the project with the specified id doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const success = await api.updateProject({ id: "QQQQQQQQ" });

            expect(success).toBe(false);
        });

        test("returns false if the project with the specified slug doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const success = await api.updateProject({ id: "not-a-real-slug" });

            expect(success).toBe(false);
        });
    });

    describe("deleteProject", () => {
        test("returns true if the project with the specified id has been deleted", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const success = await api.deleteProject("gvQqBUqZ");

            expect(success).toBe(true);
        });

        test("returns true if the project with the specified slug has been deleted", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const success = await api.deleteProject("lithium");

            expect(success).toBe(true);
        });

        test("returns false if the project with the specified id doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const success = await api.deleteProject("QQQQQQQQ");

            expect(success).toBe(false);
        });

        test("returns false if the project with the specified slug doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const success = await api.deleteProject("not-a-real-slug");

            expect(success).toBe(false);
        });
    });

    describe("getVersion", () => {
        test("returns a version by its id", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const version = await api.getVersion("nMhjKWVE");

            expect(version).toBeDefined();
            expect(version.id).toBe("nMhjKWVE");
        });

        test("returns undefined if a version with the given id doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const version = await api.getVersion("QQQQQQQQ");

            expect(version).toBeUndefined();
        });
    });

    describe("getVersions", () => {
        test("returns versions by their ids", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const versions = await api.getVersions(["nMhjKWVE", "WzQmxYRa", "qdzL5Hkg"]);

            expect(versions).toBeDefined();
            expect(versions.map(x => x.id)).toEqual(["nMhjKWVE", "WzQmxYRa", "qdzL5Hkg"]);
        });

        test("returns an empty array if no ids were provided", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const versions = await api.getVersions([]);

            expect(versions).toEqual([]);
        });

        test("returns an empty array if versions with the given ids don't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const versions = await api.getVersions(["AAAAAAAA", "BBBBBBBB", "QQQQQQQQ"]);

            expect(versions).toEqual([]);
        });
    });

    describe("createVersion", () => {
        test("creates a new version", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });
            const version = DB.versions.find(x => x.id === "nMhjKWVE");
            const init = {
                name: version.name,
                version_number: version.version_number,
                project_id: version.project_id,
                changelog: version.changelog,
                dependencies: version.dependencies,
                game_versions: version.game_versions,
                version_type: version.version_type,
                loaders: version.loaders,
                featured: version.featured,
                status: version.status,
                requested_status: version.requested_status,
                files: version.files.map(x => x.filename),
            } as ModrinthVersionInit;

            const createdVersion = await api.createVersion(init);

            expect(createdVersion).toEqual(version);
        });

        test("returns undefined if a project with the specified id doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const version = await api.createVersion({
                project_id: "QQQQQQQQ",
                name: "v1.0.0",
                version_number: "1.0.0",
            });

            expect(version).toBeUndefined();
        });
    });

    describe("updateVersion", () => {
        test("returns true if the version with the specified id has been successfully updated", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });
            const version = DB.versions.find(x => x.id === "nMhjKWVE");
            const patch = {
                ...version,
                id: version.id,
                primary_file: version.files.filter(x => x.primary).map(x => ["sha1", x.hashes.sha1] as ["sha1", string])[0],
            } as ModrinthVersionPatch;

            const success = await api.updateVersion(patch);

            expect(success).toBe(true);
        });

        test("returns false if a version with the specified id doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const success = await api.updateVersion({ id: "QQQQQQQQ" });

            expect(success).toBe(false);
        });
    });

    describe("deleteVersion", () => {
        test("returns true if the version with the specified id has been deleted", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const success = await api.deleteVersion("nMhjKWVE");

            expect(success).toBe(true);
        });

        test("returns false if the version with the specified id doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const success = await api.deleteVersion("QQQQQQQQ");

            expect(success).toBe(false);
        });
    });

    describe("getProjectVersions", () => {
        test("returns versions by their project's id", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const versions = await api.getProjectVersions("gvQqBUqZ");

            expect(versions).toBeDefined();
            expect(versions.map(x => x.id)).toContain("nMhjKWVE");
        });

        test("returns versions by their project's slug", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const versions = await api.getProjectVersions("lithium");

            expect(versions).toBeDefined();
            expect(versions.map(x => x.id)).toContain("nMhjKWVE");
        });

        test("returns an empty array if a project with the specified id doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const versions = await api.getProjectVersions("QQQQQQQQ");

            expect(versions).toEqual([]);
        });

        test("returns an empty array if a project with the specified slug doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const versions = await api.getProjectVersions("not-a-real-slug");

            expect(versions).toEqual([]);
        });

        test("returns versions filtered by specified parameters", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const versions = await api.getProjectVersions("lithium", {
                loaders: ["quilt"],
                game_versions: ["1.20.4"],
                featured: true,
            });

            expect(versions).toBeDefined();
            expect(versions.every(x => x.loaders.includes("quilt"))).toBe(true);
            expect(versions.every(x => x.game_versions.includes("1.20.4"))).toBe(true);
        });

        test("returns an empty array if no version matches the specified parameters", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const versions = await api.getProjectVersions("lithium", {
                loaders: ["forge"],
                game_versions: ["2.0"],
            });

            expect(versions).toEqual([]);
        });
    });

    describe("unfeaturePreviousProjectVersions", () => {
        test("unfeatures versions by their project's id", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const map = await api.unfeaturePreviousProjectVersions({ project_id: "gvQqBUqZ" }, ModrinthUnfeatureMode.ANY);
            const versions = Object.entries(map).filter(([unfeatured]) => unfeatured).map(([_, version]) => version);

            expect(versions).toHaveLength(10);
        });

        test("unfeatures versions by their project's slug", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const map = await api.unfeaturePreviousProjectVersions({ project_id: "lithium" }, ModrinthUnfeatureMode.ANY);
            const versions = Object.entries(map).filter(([unfeatured]) => unfeatured).map(([_, version]) => version);

            expect(versions).toHaveLength(10);
        });

        test("returns an empty record if a project with the specified id doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const map = await api.unfeaturePreviousProjectVersions({ project_id: "QQQQQQQQ" }, ModrinthUnfeatureMode.ANY);

            expect(map).toEqual({});
        });

        test("returns an empty record if a project with the specified slug doesn't exist", async () => {
            const api = new ModrinthApiClient({ fetch: MODRINTH_FETCH, token: "token" });

            const map = await api.unfeaturePreviousProjectVersions({ project_id: "not-a-real-slug" }, ModrinthUnfeatureMode.ANY);

            expect(map).toEqual({});
        });
    });
});
