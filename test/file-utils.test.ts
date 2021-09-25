import { describe, test, expect } from "@jest/globals";
import { getFiles, parseVersionFromFilename, parseVersionTypeFromFilename } from "../src/utils/file-utils";

describe("getFiles", () => {
    test("all files matching the given pattern are returned", async () => {
        expect(await getFiles("(README|LICENSE|FOO).md")).toHaveLength(2);
    });

    test("files matching the primary pattern are returned first", async () => {
        const files = await getFiles({ primary: "README.md", secondary: "(README|LICENSE|FOO).md" });
        expect(files).toHaveLength(2);
        expect(files[0]).toHaveProperty("name", "README.md");

        const inversedFiles = await getFiles({ primary: "LICENSE.md", secondary: "(README|LICENSE|FOO).md" });
        expect(inversedFiles).toHaveLength(2);
        expect(inversedFiles[0]).toHaveProperty("name", "LICENSE.md");
    });
});

describe("parseVersionFromFilename", () => {
    test("file version is correctly extracted from the filename", () => {
        expect(parseVersionFromFilename("sodium-fabric-mc1.17.1-0.3.2+build.7.jar")).toStrictEqual("mc1.17.1-0.3.2+build.7");
        expect(parseVersionFromFilename("build/libs/sodium-fabric-mc1.17.1-0.3.2+build.7.jar")).toStrictEqual("mc1.17.1-0.3.2+build.7");
        expect(parseVersionFromFilename("fabric-api-0.40.1+1.18_experimental.jar")).toStrictEqual("0.40.1+1.18_experimental");
        expect(parseVersionFromFilename("TechReborn-5.0.8-beta+build.111.jar")).toStrictEqual("5.0.8-beta+build.111");
        expect(parseVersionFromFilename("TechReborn-1.17-5.0.1-beta+build.29.jar")).toStrictEqual("1.17-5.0.1-beta+build.29");
        expect(parseVersionFromFilename("Terra-forge-5.3.3-BETA+ec3b0e5d.jar")).toStrictEqual("5.3.3-BETA+ec3b0e5d");
        expect(parseVersionFromFilename("modmenu-2.0.12.jar")).toStrictEqual("2.0.12");
        expect(parseVersionFromFilename("enhancedblockentities-0.5+1.17.jar")).toStrictEqual("0.5+1.17");
        expect(parseVersionFromFilename("sync-mc1.17.x-1.2.jar")).toStrictEqual("mc1.17.x-1.2");
    });
});

describe("parseVersionTypeFromFilename", () => {
    test("version type is correctly extracted from the filename", () => {
        expect(parseVersionTypeFromFilename("sodium-fabric-mc1.17.1-0.3.2+build.7.jar")).toStrictEqual("release");
        expect(parseVersionTypeFromFilename("build/libs/sodium-fabric-mc1.17.1-0.3.2+build.7.jar")).toStrictEqual("release");
        expect(parseVersionTypeFromFilename("fabric-api-0.40.1+1.18_experimental.jar")).toStrictEqual("release");
        expect(parseVersionTypeFromFilename("TechReborn-5.0.8-beta+build.111.jar")).toStrictEqual("beta");
        expect(parseVersionTypeFromFilename("TechReborn-1.17-5.0.1-beta+build.29.jar")).toStrictEqual("beta");
        expect(parseVersionTypeFromFilename("Terra-forge-5.3.3-BETA+ec3b0e5d.jar")).toStrictEqual("beta");
        expect(parseVersionTypeFromFilename("Terra-forge-5.3.3-alpha+ec3b0e5d.jar")).toStrictEqual("alpha");
        expect(parseVersionTypeFromFilename("modmenu-2.0.12.jar")).toStrictEqual("release");
        expect(parseVersionTypeFromFilename("enhancedblockentities-0.5+1.17.jar")).toStrictEqual("release");
        expect(parseVersionTypeFromFilename("sync-mc1.17.x-1.2.jar")).toStrictEqual("release");
    });
});
