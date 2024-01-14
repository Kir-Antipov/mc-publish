import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mockFs from "mock-fs";
import { createCombinedFetch, createFakeFetch } from "../../../utils/fetch-utils";
import { PlatformType } from "@/platforms/platform-type";
import { SecureString } from "@/utils/security/secure-string";
import { FileInfo } from "@/utils/io/file-info";
import { FormData } from "@/utils/net/form-data";
import { VersionType } from "@/utils/versioning/version-type";
import { JavaVersion } from "@/utils/java/java-version";
import { parseDependency } from "@/dependencies/dependency";
import { CURSEFORGE_ETERNAL_API_URL } from "@/platforms/curseforge/curseforge-eternal-api-client";
import { CURSEFORGE_UPLOAD_API_URL } from "@/platforms/curseforge/curseforge-upload-api-client";
import { CurseForgeVersionInitMetadata } from "@/platforms/curseforge/curseforge-version";
import { CurseForgeDependencyType } from "@/platforms/curseforge/curseforge-dependency-type";
import { CurseForgeUploader } from "@/platforms/curseforge/curseforge-uploader";

const DB = Object.freeze({
    versionTypes: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/curseforge/version-types.json"), "utf8")
    )),

    versions: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/curseforge/versions.json"), "utf8")
    )),
});

const CURSEFORGE_ETERNAL_FETCH = createFakeFetch({
    baseUrl: CURSEFORGE_ETERNAL_API_URL,
    requiredHeaders: ["X-Api-Key"],

    GET: {
        "^\\/mods\\/search\\?gameId=432&slug=foo$": () => ({
            data: [{
                id: 1,
                slug: "foo",
                links: { websiteUrl: "https://www.curseforge.com/minecraft/mc-mods/foo" },
            }],
        }),

        "^\\/mods\\/306612$": () => ({
            data: {
                id: 306612,
                slug: "fabric-api",
                links: { websiteUrl: "https://www.curseforge.com/minecraft/mc-mods/fabric-api" },
            },
        }),
    },
});

const CURSEFORGE_UPLOAD_FETCH = createFakeFetch({
    baseUrl: CURSEFORGE_UPLOAD_API_URL,
    requiredHeaders: ["X-Api-Token"],

    GET: {
        "^\\/game\\/version-types": () => DB.versionTypes,

        "^\\/game\\/versions": () => DB.versions,
    },

    POST: {
        "^\\/projects\\/1\\/upload-file$": (_, { body }) => {
            const formData = body as FormData;
            const metadata = JSON.parse(formData.get("metadata") as string) as CurseForgeVersionInitMetadata;

            expect(metadata.changelog).toBe("Changelog");
            expect(metadata.changelogType).toBe("markdown");
            expect(metadata.displayName).toBe("Version v1.0.0");
            expect(metadata.releaseType).toBe(VersionType.ALPHA);
            expect(metadata.parentFileID).toBeUndefined();
            expect(metadata.gameVersions).toEqual([9008, 7499, 8326]);
            expect(metadata.relations).toEqual({
                projects: [{
                    slug: "fabric-api",
                    type: CurseForgeDependencyType.REQUIRED_DEPENDENCY,
                }],
            });

            expect(formData.get("file")).toHaveProperty("name", "file.txt");

            return {
                id: 42,
                files: [{
                    id: 42,
                    name: "file.txt",
                    url: "https://www.curseforge.com/api/v1/mods/1/files/42/download",
                }],
            };
        },
    },
});

const CURSEFORGE_FETCH = createCombinedFetch(
    CURSEFORGE_ETERNAL_FETCH,
    CURSEFORGE_UPLOAD_FETCH,
);

beforeEach(() => {
    mockFs({
        "file.txt": "",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("CurseForgeUploader", () => {
    describe("platform", () => {
        test("returns `PlatformType.CURSEFORGE`", () => {
            const uploader = new CurseForgeUploader({ });

            expect(uploader.platform).toBe(PlatformType.CURSEFORGE);
        });
    });

    describe("upload", () => {
        test("fulfills the specified upload request", async () => {
            const uploader = new CurseForgeUploader({ fetch: CURSEFORGE_FETCH });

            const report = await uploader.upload({
                token: SecureString.from("token"),
                id: "foo",
                name: "Version v1.0.0",
                version: "1.0.0",
                versionType: VersionType.ALPHA,
                changelog: "Changelog",
                files: [FileInfo.of("file.txt")],
                dependencies: [parseDependency("fabric@0.75.0(required){curseforge:306612}")],
                gameVersions: ["1.18.2"],
                loaders: ["fabric", "unknown"],
                java: [JavaVersion.of(17)],
            });

            expect(report).toEqual({
                id: 1,
                version: 42,
                url: "https://www.curseforge.com/minecraft/mc-mods/foo/files/42",
                files: [{
                    id: 42,
                    name: "Version v1.0.0",
                    url: "https://www.curseforge.com/api/v1/mods/1/files/42/download",
                }],
            });
        });
    });
});
