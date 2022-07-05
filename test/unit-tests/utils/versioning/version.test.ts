import { describe, test, expect } from "@jest/globals";
import Version from "../../../../src/utils/versioning/version";

describe("Version", () => {
    describe("fromName", () => {
        test("file version is correctly extracted from the filename", () => {
            expect(Version.fromName("sodium-fabric-mc1.17.1-0.3.2+build.7")).toStrictEqual("mc1.17.1-0.3.2+build.7");
            expect(Version.fromName("fabric-api-0.40.1+1.18_experimental")).toStrictEqual("0.40.1+1.18_experimental");
            expect(Version.fromName("TechReborn-5.0.8-beta+build.111")).toStrictEqual("5.0.8-beta+build.111");
            expect(Version.fromName("TechReborn-1.17-5.0.1-beta+build.29")).toStrictEqual("1.17-5.0.1-beta+build.29");
            expect(Version.fromName("Terra-forge-5.3.3-BETA+ec3b0e5d")).toStrictEqual("5.3.3-BETA+ec3b0e5d");
            expect(Version.fromName("modmenu-2.0.12")).toStrictEqual("2.0.12");
            expect(Version.fromName("enhancedblockentities-0.5+1.17")).toStrictEqual("0.5+1.17");
            expect(Version.fromName("sync-mc1.17.x-1.2")).toStrictEqual("mc1.17.x-1.2");
        });
    });
});
