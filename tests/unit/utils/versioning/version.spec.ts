import { parseVersion } from "@/utils/versioning/version";

describe("parseVersion", () => {
    test("returns undefined when parsing invalid string", () => {
        const version = parseVersion("abc");

        expect(version).toBeUndefined();
    });

    test("parses classic semver format (major.minor.patch)", () => {
        const version = parseVersion("1.2.3");

        expect(version).toMatchObject({ major: 1, minor: 2, patch: 3 });
    });

    test("parses classic semver format with pre-release information", () => {
        const version = parseVersion("1.2.3-alpha.1");

        expect(version).toMatchObject({ major: 1, minor: 2, patch: 3 });
        expect(version.toString()).toBe("1.2.3-alpha.1");
    });

    test("parses version strings with missing patch number (major.minor)", () => {
        const version = parseVersion("1.2");

        expect(version).toMatchObject({ major: 1, minor: 2, patch: 0 });
        expect(version.format()).toBe("1.2.0");
        expect(version.toString()).toBe("1.2");
    });

    test("parses version strings with missing patch number and pre-release information", () => {
        const version = parseVersion("1.2-alpha.1");

        expect(version).toMatchObject({ major: 1, minor: 2, patch: 0 });
        expect(version.format()).toBe("1.2.0-alpha.1");
        expect(version.toString()).toBe("1.2-alpha.1");
    });

    test("file version is correctly extracted from the filename", () => {
        expect(String(parseVersion("sodium-fabric-mc1.17.1-0.3.2+build.7"))).toBe("mc1.17.1-0.3.2+build.7");
        expect(String(parseVersion("fabric-api-0.40.1+1.18_experimental"))).toBe("0.40.1+1.18_experimental");
        expect(String(parseVersion("TechReborn-5.0.8-beta+build.111"))).toBe("5.0.8-beta+build.111");
        expect(String(parseVersion("TechReborn-1.17-5.0.1-beta+build.29"))).toBe("1.17-5.0.1-beta+build.29");
        expect(String(parseVersion("Terra-forge-5.3.3-BETA+ec3b0e5d"))).toBe("5.3.3-BETA+ec3b0e5d");
        expect(String(parseVersion("modmenu-2.0.12"))).toBe("2.0.12");
        expect(String(parseVersion("enhancedblockentities-0.5+1.17"))).toBe("0.5+1.17");
        expect(String(parseVersion("sync-mc1.17.x-1.2"))).toBe("mc1.17.x-1.2");
    });
});

describe("Version", () => {
    test("contains valid major, minor, and patch numbers", () => {
        expect(parseVersion("1.2.3")).toMatchObject({ major: 1, minor: 2, patch: 3 });
        expect(parseVersion("1.2.3-alpha.1")).toMatchObject({ major: 1, minor: 2, patch: 3 });
        expect(parseVersion("1.2")).toMatchObject({ major: 1, minor: 2, patch: 0 });
        expect(parseVersion("1.2-alpha.1")).toMatchObject({ major: 1, minor: 2, patch: 0 });
    });

    test("compares versions correctly", () => {
        const version1 = parseVersion("1.2.3");
        const version2 = parseVersion("2.3.4");

        expect(version1.compare(version2)).toBeLessThan(0);
        expect(version2.compare(version1)).toBeGreaterThan(0);
        expect(version1.compare(version1)).toBe(0);
    });

    test("formats correctly", () => {
        expect(parseVersion("1.0.0").format()).toEqual("1.0.0");
        expect(parseVersion("1.0.0-alpha.1").format()).toEqual("1.0.0-alpha.1");
        expect(parseVersion("1.0").format()).toEqual("1.0.0");
        expect(parseVersion("1.0-alpha.1").format()).toEqual("1.0.0-alpha.1");
    });

    test("toString returns the original string representation", () => {
        expect(parseVersion("1.0.0").toString()).toEqual("1.0.0");
        expect(parseVersion("1.0").toString()).toEqual("1.0");
        expect(parseVersion("1.0.0-alpha.1").toString()).toEqual("1.0.0-alpha.1");
        expect(parseVersion("1.0-alpha.1").toString()).toEqual("1.0-alpha.1");
    });
});
