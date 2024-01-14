import { packGitHubReleasePatch, packGitHubReleaseInit } from "@/platforms/github/github-release";

describe("packGitHubReleasePatch", () => {
    test("packs release patch", () => {
        const release = {
            owner: "owner",
            repo: "repo",
            id: 1,
            tag_name: "v1.0.0",
            name: "Release 1.0.0",
            body: "Release notes",
            draft: false,
            prerelease: false,
            assets: [],
        };

        const expected = {
            tag_name: "v1.0.0",
            name: "Release 1.0.0",
            body: "Release notes",
            draft: false,
            prerelease: false,
        };

        expect(packGitHubReleasePatch(release)).toEqual(expected);
    });
});

describe("packGitHubReleaseInit", () => {
    test("packs release data", () => {
        const release = {
            owner: "owner",
            repo: "repo",
            tag_name: "v1.0.0",
            name: "Release 1.0.0",
            body: "Release notes",
            draft: false,
            prerelease: false,
            assets: [],
        };

        const expected = {
            tag_name: "v1.0.0",
            name: "Release 1.0.0",
            body: "Release notes",
            draft: false,
            prerelease: false,
        };

        expect(packGitHubReleaseInit(release)).toEqual(expected);
    });
});
