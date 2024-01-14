import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mockFs from "mock-fs";
import { createFakeFetch } from "../../../utils/fetch-utils";
import { HttpResponse } from "@/utils/net/http-response";
import { GitHubRelease, GitHubReleaseInit, GitHubReleasePatch } from "@/platforms/github/github-release";
import { GITHUB_API_URL, GitHubApiClient } from "@/platforms/github/github-api-client";

const DB = Object.freeze({
    releases: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/github/releases.json"), "utf8")
    )) as GitHubRelease[],
});

const GITHUB_FETCH = createFakeFetch({
    baseUrl: GITHUB_API_URL,
    requiredHeaders: ["Accept", "X-GitHub-Api-Version", "Authorization"],

    GET: {
        "^\\/repos\\/([\\w-]+)\\/([\\w-]+)\\/releases\\/([\\d-]+)": ([owner, repo, id]) => {
            const repoPath = `/${owner}/${repo}/`;
            const release = DB.releases.find(x => x.id === +id && x.url.includes(repoPath));
            return release || HttpResponse.text("Not found", { status: 404 });
        },

        "^\\/repos\\/([\\w-]+)\\/([\\w-]+)\\/releases\\/tags\\/([^/]+)": ([owner, repo, tag]) => {
            const repoPath = `/${owner}/${repo}/`;
            const release = DB.releases.find(x => x.tag_name === tag && x.url.includes(repoPath));

            return release || HttpResponse.text("Not found", { status: 404 });
        },
    },

    POST: {
        "^\\/repos\\/([\\w-]+)\\/([\\w-]+)\\/releases": ([owner, repo], { body }) => {
            const repoPath = `/${owner}/${repo}/`;
            const release = JSON.parse(body as string) as GitHubReleaseInit;
            const futureRelease = DB.releases.find(x => x.tag_name === release.tag_name && x.url.includes(repoPath));

            if (!futureRelease) {
                return HttpResponse.text("Invalid request", { status: 400 });
            }

            const expectedProperties = {
                tag_name: release.tag_name,
                body: release.body,
                draft: release.draft,
                name: release.name,
                prerelease: release.prerelease,
                target_commitish: release.target_commitish,
            };

            for (const [key, value] of Object.entries(expectedProperties)) {
                if (futureRelease[key] !== value) {
                    throw new Error(`Unexpected attempt to publish a release: '${body}'`);
                }
            }

            return futureRelease;
        },

        "\\/repos\\/([\\w-]+)\\/([\\w-]+)\\/releases\\/([\\d-]+)\\/assets\\?.*name=([^&]+)": ([owner, repo, id, name]) => {
            name = decodeURIComponent(name);
            const repoPath = `/${owner}/${repo}/`;
            const release = DB.releases.find(x => x.id === +id && x.url.includes(repoPath));

            if (!release) {
                return HttpResponse.text("Invalid request", { status: 400 });
            }

            const asset = release.assets.find(x => x.name === name);
            if (!asset) {
                throw new Error(`Unexpected attempt to upload an asset: '${name}'`);
            }

            return asset;
        },
    },

    PATCH: {
        "^\\/repos\\/([\\w-]+)\\/([\\w-]+)\\/releases\\/([\\d-]+)": ([owner, repo, id], { body }) => {
            const repoPath = `/${owner}/${repo}/`;
            const release = JSON.parse(body as string) as GitHubReleasePatch;
            const updatedRelease = DB.releases.find(x => x.id === +id && x.url.includes(repoPath));

            if (!updatedRelease) {
                return HttpResponse.text("Invalid request", { status: 400 });
            }

            const expectedProperties = {
                tag_name: release.tag_name,
                body: release.body,
                draft: release.draft,
                name: release.name,
                prerelease: release.prerelease,
                target_commitish: release.target_commitish,
            };

            for (const [key, value] of Object.entries(expectedProperties)) {
                if (value !== undefined && updatedRelease[key] !== value) {
                    throw new Error(`Unexpected attempt to publish a release: '${body}'`);
                }
            }

            return updatedRelease;
        },
    },

    DELETE: {
        "^\\/repos\\/([\\w-]+)\\/([\\w-]+)\\/releases\\/assets\\/([\\d-]+)": ([owner, repo, id]) => {
            const repoPath = `/${owner}/${repo}/`;
            const asset = DB.releases.filter(x => x.url.includes(repoPath)).flatMap(x => x.assets).find(x => x.id === +id);

            return asset ? HttpResponse.text("Success", { status: 204 }) : HttpResponse.text("Not found", { status: 404 });
        },
    },
});

beforeEach(() => {
    const fileNames = DB.releases.flatMap(x => x.assets).map(x => x.name);
    const fakeFiles = fileNames.reduce((a, b) => ({ ...a, [b]: "" }), {});

    mockFs(fakeFiles);
});

afterEach(() => {
    mockFs.restore();
});

describe("GitHubApiClient", () => {
    describe("getRelease", () => {
        test("returns a release by its id", async () => {
            const api = new GitHubApiClient({ fetch: GITHUB_FETCH, token: "token" });
            const expectedRelease = DB.releases.find(x => x.id === 135474639);

            const release = await api.getRelease({ owner: "Kir-Antipov", repo: "packed-inventory", id: expectedRelease.id });

            expect(release).toBeDefined();
            expect(release).toEqual(expectedRelease);
        });

        test("returns undefined if release with the specified id doesn't exist", async () => {
            const api = new GitHubApiClient({ fetch: GITHUB_FETCH, token: "token" });

            const release = await api.getRelease({ owner: "Kir-Antipov", repo: "packed-inventory", id: -42 });

            expect(release).toBeUndefined();
        });

        test("returns a release by its tagname", async () => {
            const api = new GitHubApiClient({ fetch: GITHUB_FETCH, token: "token" });
            const expectedRelease = DB.releases.find(x => x.id === 135474639);

            const release = await api.getRelease({ owner: "Kir-Antipov", repo: "packed-inventory", tag_name: expectedRelease.tag_name });

            expect(release).toBeDefined();
            expect(release).toEqual(expectedRelease);
        });


        test("returns undefined if release with the specified tagname doesn't exist", async () => {
            const api = new GitHubApiClient({ fetch: GITHUB_FETCH, token: "token" });

            const release = await api.getRelease({ owner: "Kir-Antipov", repo: "packed-inventory", tag_name: "foo" });

            expect(release).toBeUndefined();
        });
    });

    describe("createRelease", () => {
        test("creates a new release", async () => {
            const api = new GitHubApiClient({ fetch: GITHUB_FETCH, token: "token" });
            const expectedRelease = DB.releases.find(x => x.id === 135474639);

            const release = await api.createRelease({
                owner: "Kir-Antipov",
                repo: "packed-inventory",
                tag_name: expectedRelease.tag_name,
                body: expectedRelease.body,
                draft: expectedRelease.draft,
                name: expectedRelease.name,
                prerelease: expectedRelease.prerelease,
                target_commitish: expectedRelease.target_commitish,
                assets: expectedRelease.assets.map(x => x.name),
            });

            expect(release).toBeDefined();
            expect(release).toEqual(expectedRelease);
        });
    });

    describe("updateRelease", () => {
        test("updates a release", async () => {
            const api = new GitHubApiClient({ fetch: GITHUB_FETCH, token: "token" });
            const expectedRelease = DB.releases.find(x => x.id === 135474639);

            const release = await api.updateRelease({
                id: expectedRelease.id,
                owner: "Kir-Antipov",
                repo: "packed-inventory",
                tag_name: expectedRelease.tag_name,
                body: expectedRelease.body,
                draft: expectedRelease.draft,
                name: expectedRelease.name,
                prerelease: expectedRelease.prerelease,
                target_commitish: expectedRelease.target_commitish,
                assets: expectedRelease.assets.map(x => x.name),
            });

            expect(release).toBeDefined();
            expect(release).toEqual(expectedRelease);
        });
    });

    describe("updateReleaseAssets", () => {
        test("updates release assets", async () => {
            const api = new GitHubApiClient({ fetch: GITHUB_FETCH, token: "token" });
            const expectedRelease = DB.releases.find(x => x.id === 135474639);

            const assets = await api.updateReleaseAssets({
                id: expectedRelease.id,
                owner: "Kir-Antipov",
                repo: "packed-inventory",
                assets: expectedRelease.assets.map(x => x.name),
            });

            expect(assets).toBeDefined();
            expect(assets).toEqual(expectedRelease.assets);
        });
    });

    describe("deleteReleaseAsset", () => {
        test("returns true if the specified asset was successfully deleted", async () => {
            const api = new GitHubApiClient({ fetch: GITHUB_FETCH, token: "token" });

            const success = await api.deleteReleaseAsset({ owner: "Kir-Antipov", repo: "packed-inventory", id: 143275772 });

            expect(success).toBe(true);
        });

        test("returns false if the specified asset doesn't exist", async () => {
            const api = new GitHubApiClient({ fetch: GITHUB_FETCH, token: "token" });

            const success = await api.deleteReleaseAsset({ owner: "Kir-Antipov", repo: "packed-inventory", id: -42 });

            expect(success).toBe(false);
        });
    });
});
