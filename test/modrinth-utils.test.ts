import { jest, describe, test, expect } from "@jest/globals";
import { getProject } from "../src/utils/modrinth-utils";

describe("getProject", () => {
    test("returned versions have expected ids", async () => {
        jest.setTimeout(15000);
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
    });

    test("the method returns null if project with the given slug does not exist", async () => {
        jest.setTimeout(15000);
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
    });
});
