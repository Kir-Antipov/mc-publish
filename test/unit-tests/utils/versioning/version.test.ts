import { describe, test, expect } from "@jest/globals";
import * as semver from "semver";
import Version from "../../../../src/utils/versioning/version";
import {MavenRange} from "../../../../src/utils/versioning/maven-range";

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
    describe("matches", () => {
        test("maven and semver versions are correctly matched", () => {
            expect(Version.matches("1.5.2", "[1.0,2.0)")).toBe(true);
            expect(Version.matches("2.5.2", "[1.0,2.0)")).toBe(false);
            expect(Version.matches("1.5.2", "[1.0,2.0],[3.0,4.0]")).toBe(true);
            expect(Version.matches("1.5.2", ">=1.5.2 <1.6.0")).toBe(true);
            expect(Version.matches("1.5.2", ">=1.5.2 <1.5.3")).toBe(true);
            expect(Version.matches("1.5.3", ">=1.5.2 <1.5.3")).toBe(false);
        });
    });
});

describe("MavenRange", () => {
    describe("toString", () => {
        test("maven ranges are correctly converted to string", () => {
            expect(MavenRange.toString("[1.0,2.0)")).toBe("[1.0.0,2.0.0)");
            expect(MavenRange.toString("[1.0,2.0]")).toBe("[1.0.0,2.0.0]");
            expect(MavenRange.toString("[1.0,2.0[")).toBe("[1.0.0,2.0.0)");
            expect(MavenRange.toString("[1.0,2.0],[3.0,4.0]")).toBe("[1.0.0,2.0.0],[3.0.0,4.0.0]");
            expect(MavenRange.toString("[1.0,2.0],[3.0,4.0)")).toBe("[1.0.0,2.0.0],[3.0.0,4.0.0)");
        });
    });
    describe("toSemver", () => {
        test("maven ranges are correctly converted to semver ranges", () => {
            expect(MavenRange.toSemver("[1.0,2.0)")).toBe(">=1.0.0 <2.0.0");
            expect(semver.validRange(MavenRange.toSemver("[1.0,2.0)"))).not.toBeNull();
            expect(MavenRange.toSemver("[1.0,2.0]")).toBe(">=1.0.0 <=2.0.0");
            expect(semver.validRange(MavenRange.toSemver("[1.0,2.0]"))).not.toBeNull();
            expect(MavenRange.toSemver("[1.0,2.0],[3.0,4.0]")).toBe(">=1.0.0 <=2.0.0 || >=3.0.0 <=4.0.0");
            expect(semver.validRange(MavenRange.toSemver("[1.0,2.0],[3.0,4.0]"))).not.toBeNull();
        });
    });
});

