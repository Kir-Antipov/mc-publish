import { describe, test, expect } from "@jest/globals";
import { getProject, getVersions } from "../../../../src/utils/modrinth";

const timeout = 15000;

describe("getProject", () => {
    test("returned versions have expected ids", async () => {
        const projects = {
            "sodium": "AANobbMI",
            "fabric-api": "P7dR8mSH",
            "sync-fabric": "OrJTMhHF",
            "nether-chest": "okOUGirG",
            "ebe": "OVuFYfre",
        };

        for (const [slug, id] of Object.entries(projects)) {
            const project = await getProject(slug);
            expect(project).toHaveProperty("id", id);
        }
    }, timeout);

    test("the method returns null if project with the given slug does not exist", async () => {
        const nonExistentProjects = [
            "Na-11",
            "api-fabric",
            "sync-forge",
            "ever-chest",
            "beb",
            "i-swear-to-god-if-someone-registers-these-mods"
        ];

        for (const slug of nonExistentProjects) {
            const project = await getProject(slug);
            expect(project).toBeNull();
        }
    }, timeout);
});

describe("getVersions", () => {
    test("returns unfiltered versions if no parameters were passed", async () => {
        const versions = await getVersions("terra");
        expect(versions.find(x => x.featured)).toBeTruthy();
        expect(versions.find(x => !x.featured)).toBeTruthy();
        expect(versions.find(x => x.loaders.includes("fabric"))).toBeTruthy();
        expect(versions.find(x => x.loaders.includes("forge"))).toBeTruthy();
        expect(versions.find(x => x.game_versions.includes("1.18.2"))).toBeTruthy();
        expect(versions.find(x => x.game_versions.includes("1.16.5"))).toBeTruthy();
    }, timeout);

    test("returns only featured versions with featured === true", async () => {
        const versions = await getVersions("terra", null!, null!, true);
        expect(versions.every(x => x.featured)).toBe(true);
    }, timeout);

    test("returns only unfeatured versions with featured === false", async () => {
        const versions = await getVersions("terra", null!, null!, false);
        expect(versions.every(x => !x.featured)).toBe(true);
    }, timeout);

    test("returns only versions that support given modloaders", async () => {
        const fabricVersions = await getVersions("terra", ["fabric"]);
        expect(fabricVersions.every(x => x.loaders.includes("fabric"))).toBe(true);

        const forgeVersions = await getVersions("terra", ["forge"]);
        expect(forgeVersions.every(x => x.loaders.includes("forge"))).toBe(true);
    }, timeout);

    test("returns only versions that support given mc versions", async () => {
        const versions_1_18_2 = await getVersions("terra", null!, ["1.18.2"]);
        expect(versions_1_18_2.every(x => x.game_versions.includes("1.18.2"))).toBe(true);

        const versions_1_16_5 = await getVersions("terra", null!, ["1.16.5"]);
        expect(versions_1_16_5.every(x => x.game_versions.includes("1.16.5"))).toBe(true);
    }, timeout);
});
