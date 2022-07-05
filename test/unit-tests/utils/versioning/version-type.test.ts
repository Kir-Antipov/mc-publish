import { describe, test, expect } from "@jest/globals";
import VersionType from "../../../../src/utils/versioning/version-type";

describe("VersionType", () => {
    describe("fromName", () => {
        test("version type is correctly extracted from the filename", () => {
            expect(VersionType.fromName("sodium-fabric-mc1.17.1-0.3.2+build.7")).toStrictEqual("release");
            expect(VersionType.fromName("fabric-api-0.40.1+1.18_experimental")).toStrictEqual("release");
            expect(VersionType.fromName("TechReborn-5.0.8-beta+build.111")).toStrictEqual("beta");
            expect(VersionType.fromName("TechReborn-1.17-5.0.1-beta+build.29")).toStrictEqual("beta");
            expect(VersionType.fromName("Terra-forge-5.3.3-BETA+ec3b0e5d")).toStrictEqual("beta");
            expect(VersionType.fromName("Terra-forge-5.3.3-alpha+ec3b0e5d")).toStrictEqual("alpha");
            expect(VersionType.fromName("modmenu-2.0.12")).toStrictEqual("release");
            expect(VersionType.fromName("enhancedblockentities-0.5+1.17")).toStrictEqual("release");
            expect(VersionType.fromName("sync-mc1.17.x-1.2")).toStrictEqual("release");
        });
    });
});
