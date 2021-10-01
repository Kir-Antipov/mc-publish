import { describe, test, expect } from "@jest/globals";
import MinecraftVersionResolver from "../src/utils/minecraft-version-resolver";

describe("MinecraftVersionResolver.byName", () => {
    test("every predefined MinecraftVersionResolver can be resolved", () => {
        for (const [key, value] of Object.entries(MinecraftVersionResolver).filter(([_, x]) => x instanceof MinecraftVersionResolver)) {
            expect(MinecraftVersionResolver.byName(key)).toStrictEqual(value);
        }
    });

    test("null is returned if MinecraftVersionResolver with the given name doesn't exist", () => {
        expect(MinecraftVersionResolver.byName("non-existing-resolver")).toBeNull();
    });

    test("name of MinecraftVersionResolver is case insensitive", () => {
        expect(MinecraftVersionResolver.byName("latest")).toStrictEqual(MinecraftVersionResolver.latest);
        expect(MinecraftVersionResolver.byName("Latest")).toStrictEqual(MinecraftVersionResolver.latest);
        expect(MinecraftVersionResolver.byName("LATEST")).toStrictEqual(MinecraftVersionResolver.latest);
        expect(MinecraftVersionResolver.byName("LatesT")).toStrictEqual(MinecraftVersionResolver.latest);
    });
});

describe("MinecraftVersionResolver.exact", () => {
    test("the exact version is returned", async () => {
        const _1_17 = (await MinecraftVersionResolver.exact.resolve("1.17")).map(x => x.id);
        expect(_1_17).toHaveLength(1);
        expect(_1_17).toContain("1.17");

        const _1_17_1 = (await MinecraftVersionResolver.exact.resolve("1.17.1")).map(x => x.id);
        expect(_1_17_1).toHaveLength(1);
        expect(_1_17_1).toContain("1.17.1");
    });

    test("empty array is returned if no versions were found", async () => {
        expect(await MinecraftVersionResolver.exact.resolve("42.0")).toHaveLength(0);
    });
});

describe("MinecraftVersionResolver.latest", () => {
    test("the latest version of the given minor is returned", async () => {
        const versions = (await MinecraftVersionResolver.latest.resolve("1.17")).map(x => x.id);
        expect(versions).toHaveLength(1);
        expect(versions).toContain("1.17.1");
    });

    test("empty array is returned if no versions were found", async () => {
        expect(await MinecraftVersionResolver.latest.resolve("42.0")).toHaveLength(0);
    });
});

describe("MinecraftVersionResolver.all", () => {
    test("all versions of the given minor are returned", async () => {
        const versions = (await MinecraftVersionResolver.all.resolve("1.17")).map(x => x.id);
        expect(versions).toHaveLength(31);
        expect(versions).toContain("1.17");
        expect(versions).toContain("1.17.1");
        expect(versions).toContain("1.17.1-rc2");
        expect(versions).toContain("1.17.1-rc1");
        expect(versions).toContain("1.17.1-pre3");
        expect(versions).toContain("1.17.1-pre2");
        expect(versions).toContain("1.17.1-pre1");
        expect(versions).toContain("21w03a");
    });

    test("all versions of the given minor starting with the given build are returned", async () => {
        const versions = (await MinecraftVersionResolver.all.resolve("1.17.1")).map(x => x.id);
        expect(versions).toHaveLength(6);
        expect(versions).toContain("1.17.1");
        expect(versions).toContain("1.17.1-rc2");
        expect(versions).toContain("1.17.1-rc1");
        expect(versions).toContain("1.17.1-pre3");
        expect(versions).toContain("1.17.1-pre2");
        expect(versions).toContain("1.17.1-pre1");
    });

    test("empty array is returned if no versions were found", async () => {
        expect(await MinecraftVersionResolver.all.resolve("42.0")).toHaveLength(0);
    });
});

describe("MinecraftVersionResolver.releases", () => {
    test("all releases of the given minor are returned", async () => {
        const versions = (await MinecraftVersionResolver.releases.resolve("1.17")).map(x => x.id);
        expect(versions).toHaveLength(2);
        expect(versions).toContain("1.17");
        expect(versions).toContain("1.17.1");
    });

    test("all releases of the given minor starting with the given build are returned", async () => {
        const versions = (await MinecraftVersionResolver.releases.resolve("1.16.1")).map(x => x.id);
        expect(versions).toHaveLength(5);
        expect(versions).toContain("1.16.1");
        expect(versions).toContain("1.16.2");
        expect(versions).toContain("1.16.3");
        expect(versions).toContain("1.16.4");
        expect(versions).toContain("1.16.5");
    });

    test("an empty array is returned if no versions were found", async () => {
        expect(await MinecraftVersionResolver.releases.resolve("42.0")).toHaveLength(0);
    });
});

describe("MinecraftVersionResolver.releasesIfAny", () => {
    test("all releases of the given minor are returned", async () => {
        const versions = (await MinecraftVersionResolver.releasesIfAny.resolve("1.17")).map(x => x.id);
        expect(versions).toHaveLength(2);
        expect(versions).toContain("1.17");
        expect(versions).toContain("1.17.1");
    });

    test("empty array is returned if no versions were found", async () => {
        expect(await MinecraftVersionResolver.releasesIfAny.resolve("42.0")).toHaveLength(0);
    });
});
