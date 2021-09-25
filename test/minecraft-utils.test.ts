import { describe, test, expect } from "@jest/globals";
import { getVersionById, findVersionByName, isSnapshot, parseVersionNameFromFileVersion, getVersions, getLatestRelease, getCompatibleBuilds } from "../src/utils/minecraft-utils";
import Version from "../src/utils/version";

describe("getVersionById", () => {
    test("returned versions have the same id as the given one", async () => {
        const existingVersionIds = ["20w45a", "1.14.4-pre4", "3D Shareware v1.34", "20w14infinite", "1.14.2 Pre-Release 4", "1.7.10", "1.12.2"];
        for (const versionId of existingVersionIds) {
            expect(await getVersionById(versionId)).toHaveProperty("id", versionId);
        }
    });

    test("the method returns null if version with the given id does not exist", async () => {
        const nonExistingVersionIds = ["", "0.0.0", "1.16.6", "18w100c", "1.7.10-rc1"];
        for (const versionId of nonExistingVersionIds) {
            expect(await getVersionById(versionId)).toBeNull();
        }
    });

    test("returned versions have expected names", async () => {
        const versions = {
            "21w37a": "1.18",
            "1.17.1": "1.17.1",
            "1.17.1-pre3": "1.17.1",
            "1.14.2 Pre-Release 4": "1.14.2",
            "1.7.10": "1.7.10",
        };

        for (const [id, name] of Object.entries(versions)) {
            expect (await getVersionById(id)).toHaveProperty("name", name);
        }
    });
});

describe("findVersionByName", () => {
    test("if the given name is an identifier, id of the found version should match it", async () => {
        const ids = ["21w37a", "1.17.1-pre3", "1.16.5", "3D Shareware v1.34", "20w14infinite", "1.14.2 Pre-Release 4"];
        for (const id of ids) {
            expect(await findVersionByName(id)).toHaveProperty("id", id);
        }
    });

    test("if version with the given name does not exist, the most similar is returned", async () => {
        const versions = {
            "1.17.1-Snapshot": "1.17.1-rc2",
            "1.17.1-rc3": "1.17.1-rc2",
            "1.17.1 (snapshot)": "1.17.1-rc2",
            "1.15.2 Pre-Release": "1.15.2-pre2",
        };

        for (const [name, id] of Object.entries(versions)) {
            expect(await findVersionByName(name)).toHaveProperty("id", id);
        }
    });
});

describe("isSnapshot", () => {
    test("the method returns true if provided version is a snapshot; otherwise, false", () => {
        const versions = {
            "1.7.10": false,
            "1.7.10-pre4": true,
            "1.6.3-rc1": true,
            "21w37a": true,
            "1.14.2 Pre-Release 3": true,
            "1.6.1": false,
            "1.6": true,
            "1.5": true,
            "14w34c": true,
            "1.RV-Pre1": true,
            "20w14infinite": true,
            "1.12.2": false,
            "1.17-Snapshot": true,
        };

        for (const [name, snapshot] of Object.entries(versions)) {
            expect(isSnapshot(name)).toStrictEqual(snapshot);
        }
    });
});

describe("parseVersionNameFromFileVersion", () => {
    test("Sodium-like versions are parsed correctly", () => {
        expect(parseVersionNameFromFileVersion("mc1.17.1-0.3.2+build.7")).toStrictEqual("1.17.1");
        expect(parseVersionNameFromFileVersion("mc1.16.3-0.1.0")).toStrictEqual("1.16.3");
        expect(parseVersionNameFromFileVersion("mc1.17.x-1.2")).toStrictEqual("1.17");
        expect(parseVersionNameFromFileVersion("mc1.16.*-1.2")).toStrictEqual("1.16");
    });

    test("Fabric-like versions are parsed correctly", () => {
        expect(parseVersionNameFromFileVersion("0.40.1+1.18_experimental")).toStrictEqual("1.18");
        expect(parseVersionNameFromFileVersion("0.5+1.17")).toStrictEqual("1.17");
        expect(parseVersionNameFromFileVersion("1.17.1+1.19")).toStrictEqual("1.19");
        expect(parseVersionNameFromFileVersion("1.19+1.17.1")).toStrictEqual("1.17.1");
    });

    test("weird formats that contain obvious Minecraft version are parsed correctly", () => {
        expect(parseVersionNameFromFileVersion("1.17-5.0.1-beta+build.29")).toStrictEqual("1.17");
    });

    test("null is returned if version string does not contain obvious Minecraft version", () => {
        expect(parseVersionNameFromFileVersion("5.0.8-beta+build.111")).toBeNull();
        expect(parseVersionNameFromFileVersion("5.3.3-BETA+ec3b0e5d")).toBeNull();
        expect(parseVersionNameFromFileVersion("2.0.12")).toBeNull();
        expect(parseVersionNameFromFileVersion("1.17")).toBeNull();
    });
});

describe("getLatestRelease", () => {
    test("the latest release is returned", async () => {
        const latestRelease = (await getVersions()).filter(x => x.isRelease).sort((a, b) => b.releaseTime.getTime() - a.releaseTime.getTime())[0];
        expect(await getLatestRelease()).toHaveProperty("id", latestRelease.id);
    });
});

describe("getCompatibleBuilds", () => {
    test("empty array is returned if no versions were found", async () => {
        expect(await getCompatibleBuilds("42.0.0")).toHaveLength(0);
    });

    test("all versions of the given minor are returned", async () => {
        const builds = (await getCompatibleBuilds("1.16")).map(x => x.id);
        expect(builds).toHaveLength(54);
        expect(builds).toContain("1.16");
        expect(builds).toContain("1.16.1");
        expect(builds).toContain("1.16.2");
        expect(builds).toContain("1.16.3");
        expect(builds).toContain("1.16.4");
        expect(builds).toContain("1.16.5");
        expect(builds).toContain("20w06a");
        expect(builds).toContain("20w14infinite");
        expect(builds).not.toContain("1.17");
        expect(builds).not.toContain("1.15");
    });

    test("all versions of the given minor starting with the given build are returned", async () => {
        const builds = (await getCompatibleBuilds(new Version(1, 17, 1))).map(x => x.id);
        expect(builds).toHaveLength(6);
        expect(builds).toContain("1.17.1");
        expect(builds).toContain("1.17.1-pre1");
        expect(builds).toContain("1.17.1-pre2");
        expect(builds).toContain("1.17.1-pre3");
        expect(builds).toContain("1.17.1-rc1");
        expect(builds).toContain("1.17.1-rc2");
        expect(builds).not.toContain("1.18");
        expect(builds).not.toContain("1.17");
    });
});
