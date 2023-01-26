import { VersionType } from "@/utils/versioning/version-type";

describe("VersionType", () => {
    describe("parseFromFileName", () => {
        test("version type is correctly parsed from the filename", () => {
            expect(VersionType.parseFromFileName("sodium-fabric-mc1.17.1-0.3.2+build.7")).toStrictEqual(VersionType.RELEASE);
            expect(VersionType.parseFromFileName("fabric-api-0.40.1+1.18_experimental")).toStrictEqual(VersionType.RELEASE);
            expect(VersionType.parseFromFileName("TechReborn-5.0.8-beta+build.111")).toStrictEqual(VersionType.BETA);
            expect(VersionType.parseFromFileName("TechReborn-1.17-5.0.1-beta+build.29")).toStrictEqual(VersionType.BETA);
            expect(VersionType.parseFromFileName("Terra-forge-5.3.3-BETA+ec3b0e5d")).toStrictEqual(VersionType.BETA);
            expect(VersionType.parseFromFileName("Terra-forge-5.3.3-alpha+ec3b0e5d")).toStrictEqual(VersionType.ALPHA);
            expect(VersionType.parseFromFileName("modmenu-2.0.12")).toStrictEqual(VersionType.RELEASE);
            expect(VersionType.parseFromFileName("enhancedblockentities-0.5+1.17")).toStrictEqual(VersionType.RELEASE);
            expect(VersionType.parseFromFileName("sync-mc1.17.x-1.2")).toStrictEqual(VersionType.RELEASE);
        });
    });

    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of VersionType.values()) {
                expect(VersionType.parse(VersionType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of VersionType.values()) {
                expect(VersionType.parse(VersionType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of VersionType.values()) {
                expect(VersionType.parse(VersionType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of VersionType.values()) {
                expect(VersionType.parse(VersionType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
