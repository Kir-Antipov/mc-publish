import process from "process";
import { describe, test, expect } from "@jest/globals";
import { unifyGameVersion, unifyJava, convertToCurseForgeVersions } from "../../../../src/utils/curseforge";

describe("unifyGameVersion", () => {
    test("versions in the unified format are not changed", async () => {
        const validVersions = ["1.7.10", "1.12", "1.17-Snapshot", "1.17"];
        for (const version of validVersions) {
            expect(await unifyGameVersion(version)).toStrictEqual(version);
        }
    });

    test("snapshot versions are converted to the unified format (\\d+\\.\\d+(\\.\\d+)?-Snapshot)", async () => {
        expect(await unifyGameVersion("21w37a")).toStrictEqual("1.18-Snapshot");
        expect(await unifyGameVersion("1.17.1-pre1")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion("1.17.1-pre2")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion("1.17.1-pre3")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion("1.17.1-rc1")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion("1.17.1-rc2")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion("1.17-rc2")).toStrictEqual("1.17-Snapshot");
        expect(await unifyGameVersion("1.16-snapshot")).toStrictEqual("1.16-Snapshot");
    });

    test("unnecessary punctuation marks and whitespace symbols do not break the function", async () => {
        expect(await unifyGameVersion(" 21w37a ")).toStrictEqual("1.18-Snapshot");
        expect(await unifyGameVersion("1.17.1  pre1")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion(" 1.17.1-pre2 ")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion(" 1.17.1_pre2 ")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion(" 1 17 1 pre3 ")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion("1-17-1-rc1")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion("1.17.1.rc2")).toStrictEqual("1.17.1-Snapshot");
        expect(await unifyGameVersion("1..17--rc2")).toStrictEqual("1.17-Snapshot");
        expect(await unifyGameVersion("\t1-16.snapshot\t")).toStrictEqual("1.16-Snapshot");
    });
});

describe("unifyJava", () => {
    test("versions in the unified format are not changed", () => {
        const validVersions = ["Java 8", "Java 9", "Java 10", "Java 11", "Java 1234"];
        for (const version of validVersions) {
            expect(unifyJava(version)).toStrictEqual(version);
        }
    });

    test("java versions are converted to the unified format (Java \\d+)", () => {
        expect(unifyJava("Java 1.8")).toStrictEqual("Java 8");
        expect(unifyJava("Java 1.9")).toStrictEqual("Java 9");
        expect(unifyJava("Java 1.10")).toStrictEqual("Java 10");
        expect(unifyJava("Java 1.11")).toStrictEqual("Java 11");
        expect(unifyJava("1.1234")).toStrictEqual("Java 1234");
    });

    test("unnecessary punctuation marks and whitespace symbols do not break the function", () => {
        expect(unifyJava("1.8")).toStrictEqual("Java 8");
        expect(unifyJava("9")).toStrictEqual("Java 9");
        expect(unifyJava(" Java 10 ")).toStrictEqual("Java 10");
        expect(unifyJava(" Java 1.11 ")).toStrictEqual("Java 11");
        expect(unifyJava("\t\t\tjava 1 12\n")).toStrictEqual("Java 12");
        expect(unifyJava(" 1.1234 ")).toStrictEqual("Java 1234");
    });
});

describe("convertToCurseForgeVersions", () => {
    // This test can only be executed in the GitHub Actions' environment,
    // because CurseForge is a little bitch.
    if (!process.env.CI) {
        return;
    }

    test("versions are converted to CurseForge ids", async () => {
        const versions = {
            gameVersions: {
                "1.18-Snapshot": 8633,
                "21w37a": 8633,
                "1.18 (snapshot)": 8633,
                "1.18-rc1": 8633,
                "1.17-pre3": 8282,
                "1.17.1": 8516,
            },
            loaders: {
                fabric: 7499,
                forge: 7498,
                quilt: 9153,
                rift: 7500
            },
            java: {
                "Java 8": 4458,
                "Java 1.8": 4458,
                "1.8": 4458,
                "8": 4458,
                "Java 1.7": 4457,
                "java 1.16": 8325,
                "17": 8326,
            }
        };

        const curseForgeVersions = await convertToCurseForgeVersions(Object.keys(versions.gameVersions), Object.keys(versions.loaders), Object.keys(versions.java), process.env.CURSEFORGE_TOKEN as string);
        const expectedIds = new Set([...Object.values<number>(versions.gameVersions), ...Object.values(versions.loaders), ...Object.values(versions.java)]);

        expect(curseForgeVersions).toHaveLength(expectedIds.size);
        for (const expectedId of expectedIds) {
            expect(curseForgeVersions).toContain(expectedId);
        }
    });
});
