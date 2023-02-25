import { DependencyType } from "@/dependencies/dependency-type";
import { PlatformType } from "@/platforms/platform-type";
import { parseVersionRange } from "@/utils/versioning/version-range";
import { createDependency, formatDependency, isDependency, parseDependency } from "@/dependencies/dependency";

describe("isDependency", () => {
    test("returns true for Dependency-like objects", () => {
        expect(isDependency(parseDependency("id"))).toBe(true);
    });

    test("returns false for non-Dependency-like objects", () => {
        expect(isDependency({})).toBe(false);
    });

    test("returns false for null and undefined", () => {
        expect(isDependency(null)).toBe(false);
        expect(isDependency(undefined)).toBe(false);
    });
});

describe("parseDependency", () => {
    test("parses a fully-formed dependency string", () => {
        const dependency = parseDependency("id@1.0.0-2.0.0-alpha.1(optional){modrinth:modrinth-slug}{curseforge:curseforge-slug}#(ignore:curseforge,github)");

        expect(dependency).toBeDefined();
        expect(dependency.id).toBe("id");
        expect(dependency.versions).toEqual(["1.0.0-2.0.0-alpha.1"]);
        expect(dependency.type).toBe(DependencyType.OPTIONAL);
        expect(dependency.getProjectId(PlatformType.MODRINTH)).toBe("modrinth-slug");
        expect(dependency.getProjectId(PlatformType.CURSEFORGE)).toBe("curseforge-slug");
        expect(dependency.getProjectId(PlatformType.GITHUB)).toBe("id");
        expect(dependency.isIgnored(PlatformType.MODRINTH)).toBe(false);
        expect(dependency.isIgnored(PlatformType.CURSEFORGE)).toBe(true);
        expect(dependency.isIgnored(PlatformType.GITHUB)).toBe(true);
    });

    test("parses a dependency string with omitted 'ignore' part", () => {
        const dependency = parseDependency("id@1.0.0-2.0.0-alpha.1(optional){modrinth:modrinth-slug}{curseforge:curseforge-slug}");

        expect(dependency).toBeDefined();
        expect(dependency.id).toBe("id");
        expect(dependency.versions).toEqual(["1.0.0-2.0.0-alpha.1"]);
        expect(dependency.type).toBe(DependencyType.OPTIONAL);
        expect(dependency.getProjectId(PlatformType.MODRINTH)).toBe("modrinth-slug");
        expect(dependency.getProjectId(PlatformType.CURSEFORGE)).toBe("curseforge-slug");
        expect(dependency.getProjectId(PlatformType.GITHUB)).toBe("id");
        expect(dependency.isIgnored(PlatformType.MODRINTH)).toBe(false);
        expect(dependency.isIgnored(PlatformType.CURSEFORGE)).toBe(false);
        expect(dependency.isIgnored(PlatformType.GITHUB)).toBe(false);
    });

    test("parses a dependency string with omitted 'aliases' part", () => {
        const dependency = parseDependency("id@1.0.0-2.0.0-alpha.1(optional)#(ignore:curseforge,github)");

        expect(dependency).toBeDefined();
        expect(dependency.id).toBe("id");
        expect(dependency.versions).toEqual(["1.0.0-2.0.0-alpha.1"]);
        expect(dependency.type).toBe(DependencyType.OPTIONAL);
        expect(dependency.getProjectId(PlatformType.MODRINTH)).toBe("id");
        expect(dependency.getProjectId(PlatformType.CURSEFORGE)).toBe("id");
        expect(dependency.getProjectId(PlatformType.GITHUB)).toBe("id");
        expect(dependency.isIgnored(PlatformType.MODRINTH)).toBe(false);
        expect(dependency.isIgnored(PlatformType.CURSEFORGE)).toBe(true);
        expect(dependency.isIgnored(PlatformType.GITHUB)).toBe(true);
    });

    test("parses a dependency string with omitted 'type' part", () => {
        const dependency = parseDependency("id@1.0.0-2.0.0-alpha.1{modrinth:modrinth-slug}{curseforge:curseforge-slug}#(ignore:curseforge,github)");

        expect(dependency).toBeDefined();
        expect(dependency.id).toBe("id");
        expect(dependency.versions).toEqual(["1.0.0-2.0.0-alpha.1"]);
        expect(dependency.type).toBe(DependencyType.REQUIRED);
        expect(dependency.getProjectId(PlatformType.MODRINTH)).toBe("modrinth-slug");
        expect(dependency.getProjectId(PlatformType.CURSEFORGE)).toBe("curseforge-slug");
        expect(dependency.getProjectId(PlatformType.GITHUB)).toBe("id");
        expect(dependency.isIgnored(PlatformType.MODRINTH)).toBe(false);
        expect(dependency.isIgnored(PlatformType.CURSEFORGE)).toBe(true);
        expect(dependency.isIgnored(PlatformType.GITHUB)).toBe(true);
    });

    test("parses a dependency string with omitted 'version' part", () => {
        const dependency = parseDependency("id(optional){modrinth:modrinth-slug}{curseforge:curseforge-slug}#(ignore:curseforge,github)");

        expect(dependency).toBeDefined();
        expect(dependency.id).toBe("id");
        expect(dependency.versions).toEqual(["*"]);
        expect(dependency.type).toBe(DependencyType.OPTIONAL);
        expect(dependency.getProjectId(PlatformType.MODRINTH)).toBe("modrinth-slug");
        expect(dependency.getProjectId(PlatformType.CURSEFORGE)).toBe("curseforge-slug");
        expect(dependency.getProjectId(PlatformType.GITHUB)).toBe("id");
        expect(dependency.isIgnored(PlatformType.MODRINTH)).toBe(false);
        expect(dependency.isIgnored(PlatformType.CURSEFORGE)).toBe(true);
        expect(dependency.isIgnored(PlatformType.GITHUB)).toBe(true);
    });

    test("parses a dependency string that only consists of id", () => {
        const dependency = parseDependency("id");

        expect(dependency).toBeDefined();
        expect(dependency.id).toBe("id");
        expect(dependency.versions).toEqual(["*"]);
        expect(dependency.type).toBe(DependencyType.REQUIRED);
        expect(dependency.getProjectId(PlatformType.MODRINTH)).toBe("id");
        expect(dependency.getProjectId(PlatformType.CURSEFORGE)).toBe("id");
        expect(dependency.getProjectId(PlatformType.GITHUB)).toBe("id");
        expect(dependency.isIgnored(PlatformType.MODRINTH)).toBe(false);
        expect(dependency.isIgnored(PlatformType.CURSEFORGE)).toBe(false);
        expect(dependency.isIgnored(PlatformType.GITHUB)).toBe(false);
    });

    test("parses a dependency string that consists of id and version", () => {
        const dependency = parseDependency("id@1.0.0");

        expect(dependency).toBeDefined();
        expect(dependency.id).toBe("id");
        expect(dependency.versions).toEqual(["1.0.0"]);
        expect(dependency.type).toBe(DependencyType.REQUIRED);
        expect(dependency.getProjectId(PlatformType.MODRINTH)).toBe("id");
        expect(dependency.getProjectId(PlatformType.CURSEFORGE)).toBe("id");
        expect(dependency.getProjectId(PlatformType.GITHUB)).toBe("id");
        expect(dependency.isIgnored(PlatformType.MODRINTH)).toBe(false);
        expect(dependency.isIgnored(PlatformType.CURSEFORGE)).toBe(false);
        expect(dependency.isIgnored(PlatformType.GITHUB)).toBe(false);
    });

    test("parses a dependency string that consists of id, version, and type", () => {
        const dependency = parseDependency("id@1.0.0(optional)");

        expect(dependency).toBeDefined();
        expect(dependency.id).toBe("id");
        expect(dependency.versions).toEqual(["1.0.0"]);
        expect(dependency.type).toBe(DependencyType.OPTIONAL);
        expect(dependency.getProjectId(PlatformType.MODRINTH)).toBe("id");
        expect(dependency.getProjectId(PlatformType.CURSEFORGE)).toBe("id");
        expect(dependency.getProjectId(PlatformType.GITHUB)).toBe("id");
        expect(dependency.isIgnored(PlatformType.MODRINTH)).toBe(false);
        expect(dependency.isIgnored(PlatformType.CURSEFORGE)).toBe(false);
        expect(dependency.isIgnored(PlatformType.GITHUB)).toBe(false);
    });

    test("parses a dependency string that consists of id and type", () => {
        const dependency = parseDependency("id(optional)");

        expect(dependency).toBeDefined();
        expect(dependency.id).toBe("id");
        expect(dependency.versions).toEqual(["*"]);
        expect(dependency.type).toBe(DependencyType.OPTIONAL);
        expect(dependency.getProjectId(PlatformType.MODRINTH)).toBe("id");
        expect(dependency.getProjectId(PlatformType.CURSEFORGE)).toBe("id");
        expect(dependency.getProjectId(PlatformType.GITHUB)).toBe("id");
        expect(dependency.isIgnored(PlatformType.MODRINTH)).toBe(false);
        expect(dependency.isIgnored(PlatformType.CURSEFORGE)).toBe(false);
        expect(dependency.isIgnored(PlatformType.GITHUB)).toBe(false);
    });

    test("dependency type parsing is case-insensitive", () => {
        for (const type of DependencyType.values()) {
            expect(parseDependency(`id(${type.toLowerCase()})`)?.type).toBe(type);
            expect(parseDependency(`id(${type.toUpperCase()})`)?.type).toBe(type);
            expect(parseDependency(`id(${DependencyType.friendlyNameOf(type)})`)?.type).toBe(type);
        }
    });

    test("platform type parsing is case-insensitive", () => {
        for (const platform of PlatformType.values()) {
            expect(parseDependency(`id{${platform.toLowerCase()}:another-id}`)?.getProjectId(platform)).toBe("another-id");
            expect(parseDependency(`id{${platform.toUpperCase()}:another-id}`)?.getProjectId(platform)).toBe("another-id");
            expect(parseDependency(`id{${PlatformType.friendlyNameOf(platform)}:another-id}`)?.getProjectId(platform)).toBe("another-id");

            expect(parseDependency(`id#(ignore:${platform.toLowerCase()})`)?.isIgnored(platform)).toBe(true);
            expect(parseDependency(`id#(ignore:${platform.toUpperCase()})`)?.isIgnored(platform)).toBe(true);
            expect(parseDependency(`id#(ignore:${PlatformType.friendlyNameOf(platform)})`)?.isIgnored(platform)).toBe(true);
        }
    });

    test("returns undefined if the input string is null, undefined, or empty", () => {
        expect(parseDependency(undefined)).toBeUndefined();
        expect(parseDependency(null)).toBeUndefined();
        expect(parseDependency("")).toBeUndefined();
    });
});

describe("cerateDependency", () => {
    test("parses dependency strings", () => {
        expect(createDependency("id")).toBeDefined();
        expect(createDependency("id@1.0.0")).toBeDefined();
        expect(createDependency("id@1.0.0(optional)")).toBeDefined();
        expect(createDependency("id(optional)")).toBeDefined();
        expect(createDependency("id@1.0.0-2.0.0-alpha.1(optional){modrinth:modrinth-slug}{curseforge:curseforge-slug}#(ignore:curseforge,github)")).toBeDefined();
        expect(createDependency("id@1.0.0-2.0.0-alpha.1(optional){modrinth:modrinth-slug}{curseforge:curseforge-slug}")).toBeDefined();
        expect(createDependency("id@1.0.0-2.0.0-alpha.1(optional)#(ignore:curseforge,github)")).toBeDefined();
        expect(createDependency("id@1.0.0-2.0.0-alpha.1{modrinth:modrinth-slug}{curseforge:curseforge-slug}#(ignore:curseforge,github)")).toBeDefined();
        expect(createDependency("id(optional){modrinth:modrinth-slug}{curseforge:curseforge-slug}#(ignore:curseforge,github)")).toBeDefined();
    });

    test("converts DependencyInfo-like objects to Dependency objects", () => {
        expect(createDependency({ id: "id" })?.id).toBe("id");
        expect(createDependency({ id: "id", type: DependencyType.EMBEDDED })?.type).toBe(DependencyType.EMBEDDED);
        expect(createDependency({ id: "id", versions: "1.0.0" })?.versions).toEqual(["1.0.0"]);
        expect(createDependency({ id: "id", versions: ["1.0.0", "2.0.0"] })?.versions).toEqual(["1.0.0", "2.0.0"]);
        expect(createDependency({ id: "id", versions: parseVersionRange("1.0.0") })?.versions).toEqual(["1.0.0"]);
        expect(createDependency({ id: "id", ignore: true })?.isIgnored()).toBe(true);
        expect(createDependency({ id: "id", ignoredPlatforms: [PlatformType.CURSEFORGE] })?.isIgnored(PlatformType.CURSEFORGE)).toBe(true);
        expect(createDependency({ id: "id", aliases: [[PlatformType.CURSEFORGE, "curseforge-slug"]] })?.getProjectId(PlatformType.CURSEFORGE)).toBe("curseforge-slug");
    });

    test("returns Dependency-like objects as is", () => {
        const dependency = parseDependency("id");

        expect(createDependency(dependency)).toBe(dependency);
    });

    test("returns undefined if the input is null, undefined, or an empty string", () => {
        expect(createDependency(null)).toBeUndefined();
        expect(createDependency(undefined)).toBeUndefined();
        expect(createDependency("")).toBeUndefined();
    });
});

describe("formatDependency", () => {
    test("formats fine-tuned dependencies as fully qualified dependency strings", () => {
        const dependencies = [
            "id@1.0.0-2.0.0-alpha.1(optional){curseforge:curseforge-slug}{modrinth:modrinth-slug}#(ignore:curseforge,github)",
            "id@1.0.0(embedded){modrinth:modrinth-slug}#(ignore:curseforge)",
            "id@1.0.0 || 2.0.0-alpha.1(conflicting){curseforge:curseforge-slug}#(ignore:github)",
        ];

        for (const dependency of dependencies) {
            expect(formatDependency(parseDependency(dependency))).toBe(dependency);
        }
    });

    test("formats dependencies and omits unused 'ignore' section", () => {
        const dependencies = [
            "id@1.0.0-2.0.0-alpha.1(optional){curseforge:curseforge-slug}{modrinth:modrinth-slug}",
            "id@1.0.0(embedded){modrinth:modrinth-slug}",
            "id@1.0.0 || 2.0.0-alpha.1(conflicting){curseforge:curseforge-slug}",
        ];

        for (const dependency of dependencies) {
            expect(formatDependency(parseDependency(dependency))).toBe(dependency);
        }
    });

    test("formats dependencies and omits unused 'aliases' section", () => {
        const dependencies = [
            "id@1.0.0-2.0.0-alpha.1(optional)#(ignore:curseforge,github)",
            "id@1.0.0(embedded)#(ignore:curseforge)",
            "id@1.0.0 || 2.0.0-alpha.1(conflicting)#(ignore:github)",
        ];

        for (const dependency of dependencies) {
            expect(formatDependency(parseDependency(dependency))).toBe(dependency);
        }
    });

    test("formats dependencies and omits unused 'version' section", () => {
        const dependencies = [
            "id(optional){curseforge:curseforge-slug}{modrinth:modrinth-slug}#(ignore:curseforge,github)",
            "id(embedded){modrinth:modrinth-slug}#(ignore:curseforge)",
            "id(conflicting){curseforge:curseforge-slug}#(ignore:github)",
        ];

        for (const dependency of dependencies) {
            expect(formatDependency(parseDependency(dependency))).toBe(dependency);
        }
    });

    test("returns an empty string for invalid dependencies", () => {
        expect(formatDependency(null)).toBe("");
        expect(formatDependency(undefined)).toBe("");
    });
});
