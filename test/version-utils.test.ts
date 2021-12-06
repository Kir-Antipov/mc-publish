import { describe, test, expect } from "@jest/globals";
import { parseVersionFromName, parseVersionTypeFromName } from "../src/utils/version-utils";

describe("parseVersionFromName", () => {
    test("file version is correctly extracted from the filename", () => {
        expect(parseVersionFromName("sodium-fabric-mc1.17.1-0.3.2+build.7")).toStrictEqual("mc1.17.1-0.3.2+build.7");
        expect(parseVersionFromName("fabric-api-0.40.1+1.18_experimental")).toStrictEqual("0.40.1+1.18_experimental");
        expect(parseVersionFromName("TechReborn-5.0.8-beta+build.111")).toStrictEqual("5.0.8-beta+build.111");
        expect(parseVersionFromName("TechReborn-1.17-5.0.1-beta+build.29")).toStrictEqual("1.17-5.0.1-beta+build.29");
        expect(parseVersionFromName("Terra-forge-5.3.3-BETA+ec3b0e5d")).toStrictEqual("5.3.3-BETA+ec3b0e5d");
        expect(parseVersionFromName("modmenu-2.0.12")).toStrictEqual("2.0.12");
        expect(parseVersionFromName("enhancedblockentities-0.5+1.17")).toStrictEqual("0.5+1.17");
        expect(parseVersionFromName("sync-mc1.17.x-1.2")).toStrictEqual("mc1.17.x-1.2");
    });
});

describe("parseVersionTypeFromName", () => {
    test("version type is correctly extracted from the filename", () => {
        expect(parseVersionTypeFromName("sodium-fabric-mc1.17.1-0.3.2+build.7")).toStrictEqual("release");
        expect(parseVersionTypeFromName("fabric-api-0.40.1+1.18_experimental")).toStrictEqual("release");
        expect(parseVersionTypeFromName("TechReborn-5.0.8-beta+build.111")).toStrictEqual("beta");
        expect(parseVersionTypeFromName("TechReborn-1.17-5.0.1-beta+build.29")).toStrictEqual("beta");
        expect(parseVersionTypeFromName("Terra-forge-5.3.3-BETA+ec3b0e5d")).toStrictEqual("beta");
        expect(parseVersionTypeFromName("Terra-forge-5.3.3-alpha+ec3b0e5d")).toStrictEqual("alpha");
        expect(parseVersionTypeFromName("modmenu-2.0.12")).toStrictEqual("release");
        expect(parseVersionTypeFromName("enhancedblockentities-0.5+1.17")).toStrictEqual("release");
        expect(parseVersionTypeFromName("sync-mc1.17.x-1.2")).toStrictEqual("release");
    });
});
