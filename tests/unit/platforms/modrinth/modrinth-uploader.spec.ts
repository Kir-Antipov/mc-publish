import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import mockFs from "mock-fs";
import { createFakeFetch } from "../../../utils/fetch-utils";
import { SecureString } from "@/utils/security/secure-string";
import { PlatformType } from "@/platforms/platform-type";
import { FileInfo } from "@/utils/io/file-info";
import { HttpResponse } from "@/utils/net/http-response";
import { FormData } from "@/utils/net/form-data";
import { VersionType } from "@/utils/versioning/version-type";
import { parseDependency } from "@/dependencies/dependency";
import { JavaVersion } from "@/utils/java/java-version";
import { ModrinthUnfeatureMode } from "@/platforms/modrinth/modrinth-unfeature-mode";
import { ModrinthVersionInit } from "@/platforms/modrinth/modrinth-version";
import { MODRINTH_API_URL } from "@/platforms/modrinth/modrinth-api-client";
import { ModrinthUploader } from "@/platforms/modrinth/modrinth-uploader";

const DB = Object.freeze({
    loaders: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/modrinth/loader.json"), "utf8")
    )),

    gameVersions: Object.freeze(JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/modrinth/game_version.json"), "utf8")
    )),
});

const MODRINTH_FETCH = createFakeFetch({
    baseUrl: MODRINTH_API_URL,
    requiredHeaders: ["Authorization"],

    GET: {
        "^\\/tag\\/loader": () => DB.loaders,

        "^\\/tag\\/game_version": () => DB.gameVersions,

        "^\\/project\\/foo$": () => ({
            id: "AAAAAAAA",
            slug: "foo",
            project_type: "mod",
        }),

        "^\\/project\\/AAAAAAAA\\/version\\?featured=true": () => HttpResponse.json([]),

        "^\\/project\\/fabric-api\\/check$": () => ({
            id: "P7dR8mSH",
        }),
    },

    POST: {
        "^\\/version$": (_, { body }) => {
            const formData = body as FormData;
            const data = JSON.parse(formData.get("data") as string) as ModrinthVersionInit;

            expect(data.changelog).toBe("Changelog");
            expect(data.featured).toBe(true);
            expect(data.name).toBe("Version v1.0.0");
            expect(data.project_id).toBe("AAAAAAAA");
            expect(data.version_number).toBe("1.0.0");
            expect(data.version_type).toBe(VersionType.ALPHA);
            expect(data["primary_file"]).toBe("_0");
            expect(data["file_parts"]).toEqual(["_0"]);
            expect(data.loaders).toEqual(["fabric"]);
            expect(data.game_versions).toEqual(["1.18.2"]);
            expect(data.dependencies).toContainEqual({ project_id: "P7dR8mSH", dependency_type: "required" });

            expect(formData.get("_0")).toHaveProperty("name", "file.txt");

            return {
                id: "BBBBBBBB",
                ...data,
                files: [{
                    filename: "file.txt",
                    url: "https://cdn.modrinth.com/data/AAAAAAAA/versions/BBBBBBBB/file.txt",
                    hashes: { sha1: "sha1" },
                }],
            };
        },
    },
});

beforeEach(() => {
    mockFs({
        "file.txt": "",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("ModrinthUploader", () => {
    describe("platform", () => {
        test("returns `PlatformType.MODRINTH`", () => {
            const uploader = new ModrinthUploader();

            expect(uploader.platform).toBe(PlatformType.MODRINTH);
        });
    });

    describe("upload", () => {
        test("fulfills the specified upload request", async () => {
            const uploader = new ModrinthUploader({ fetch: MODRINTH_FETCH });

            const report = await uploader.upload({
                token: SecureString.from("token"),
                id: "foo",
                name: "Version v1.0.0",
                version: "1.0.0",
                versionType: VersionType.ALPHA,
                changelog: "Changelog",
                files: [FileInfo.of("file.txt")],
                dependencies: [parseDependency("fabric-api@0.75.0(required)")],
                gameVersions: ["1.18.2"],
                loaders: ["fabric", "unknown"],
                java: [JavaVersion.of(17)],
                unfeatureMode: ModrinthUnfeatureMode.ANY,
            });

            expect(report).toEqual({
                id: "AAAAAAAA",
                version: "BBBBBBBB",
                url: "https://modrinth.com/mod/foo/version/1.0.0",
                files: [{
                    id: "sha1",
                    name: "file.txt",
                    url: "https://cdn.modrinth.com/data/AAAAAAAA/versions/BBBBBBBB/file.txt",
                }],
            });
        });
    });
});
