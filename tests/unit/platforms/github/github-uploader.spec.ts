import mockFs from "mock-fs";
import { createFakeFetch } from "../../../utils/fetch-utils";
import { PlatformType } from "@/platforms/platform-type";
import { SecureString } from "@/utils/security/secure-string";
import { VersionType } from "@/utils/versioning/version-type";
import { FileInfo } from "@/utils/io/file-info";
import { HttpResponse } from "@/utils/net/http-response";
import { GitHubContext } from "@/platforms/github/github-context";
import { GitHubReleaseInit } from "@/platforms/github/github-release";
import { GITHUB_API_URL } from "@/platforms/github/github-api-client";
import { GitHubUploader } from "@/platforms/github/github-uploader";

const GITHUB_FETCH = createFakeFetch({
    baseUrl: GITHUB_API_URL,
    requiredHeaders: ["Authorization"],

    GET: {
        "^\\/repos\\/owner\\/repo\\/releases\\/tags\\/v1\\.0\\.0$": () => HttpResponse.json({}, { status: 404 }),

        "^\\/repos\\/owner\\/repo\\/releases\\/1$": () => ({
            id: 1,
            tag_name: "v1.0.0",
            html_url: "https://github.com/owner/repo/releases/tag/v1.0.0",
            upload_url: "https://uploads.github.com/repos/owner/repo/releases/1/assets",
            assets: [{
                id: 42,
                name: "file.txt",
                browser_download_url: "https://github.com/owner/repo/releases/download/v1.0.0/file.txt",
            }],
        }),
    },

    POST: {
        "^\\/repos\\/owner\\/repo\\/releases$": (_, { body }) => {
            const init = JSON.parse(body as string) as GitHubReleaseInit;

            expect(init.tag_name).toBe("v1.0.0");
            expect(init.target_commitish).toBe("master");
            expect(init.name).toBe("Version v1.0.0");
            expect(init.body).toBe("Changelog");
            expect(init.draft).toBe(true);
            expect(init.prerelease).toBe(true);
            expect(init.discussion_category_name).toBe("Discussion");
            expect(init.generate_release_notes).toBe(true);

            return { id: 1, ...init };
        },

        "^https:\\/\\/uploads\\.github.com\\/repos\\/owner\\/repo\\/releases\\/1\\/assets\\?name=file\\.txt$": () => ({
            id: 42,
            name: "file.txt",
            browser_download_url: "https://github.com/owner/repo/releases/download/v1.0.0/file.txt",
        }),
    },

    DELETE: {
        "^\\/repos\\/owner\\/repo\\/releases\\/assets\\/42$": () => HttpResponse.json({}, { status: 204 }),
    },
});

const CONTEXT = new GitHubContext({
    GITHUB_REPOSITORY: "owner/repo",
});

beforeEach(() => {
    mockFs({
        "file.txt": "",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("GitHubUploader", () => {
    describe("platform", () => {
        test("returns `PlatformType.GITHUB`", () => {
            const uploader = new GitHubUploader({ githubContext: CONTEXT });

            expect(uploader.platform).toBe(PlatformType.GITHUB);
        });
    });

    describe("upload", () => {
        test("fulfills the specified upload request", async () => {
            const uploader = new GitHubUploader({ githubContext: CONTEXT, fetch: GITHUB_FETCH });

            const report = await uploader.upload({
                token: SecureString.from("token"),
                name: "Version v1.0.0",
                version: "v1.0.0",
                versionType: VersionType.ALPHA,
                commitish: "master",
                changelog: "Changelog",
                discussion: "Discussion",
                draft: true,
                generateChangelog: true,
                files: [FileInfo.of("file.txt")],
            });

            expect(report).toEqual({
                repo: "owner/repo",
                tag: "v1.0.0",
                url: "https://github.com/owner/repo/releases/tag/v1.0.0",
                files: [{
                    id: 42,
                    name: "file.txt",
                    url: "https://github.com/owner/repo/releases/download/v1.0.0/file.txt",
                }],
            });
        });
    });
});
