import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { parse as parseToml } from "toml";
import { DependencyType } from "@/dependencies/dependency-type";
import { PlatformType } from "@/platforms/platform-type";
import { RawForgeMetadata } from "@/loaders/forge/raw-forge-metadata";
import { ForgeMetadata } from "@/loaders/forge/forge-metadata";

const RAW_METADATA: RawForgeMetadata = Object.freeze(parseToml(
    readFileSync(resolvePath(__dirname, "../../../content/forge/mods.toml"), "utf8")
));

describe("ForgeMetadata", () => {
    describe("from", () => {
        test("constructs new ForgeMetadata instance using given raw metadata", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            expect(metadata).toBeInstanceOf(ForgeMetadata);
            expect(metadata.raw).toBe(RAW_METADATA);
        });
    });

    describe("id", () => {
        test("returns id of the mod", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            expect(metadata.id).toBe("example-mod");
        });
    });

    describe("name", () => {
        test("returns name of the mod", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            expect(metadata.name).toBe("Example Mod");
        });
    });

    describe("version", () => {
        test("returns version of the mod", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            expect(metadata.version).toBe("0.1.0");
        });
    });

    describe("loaders", () => {
        test("returns 'forge' by default", () => {
            const rawWithoutLoadersField = {
                ...RAW_METADATA,
                "mc-publish": {
                    ...RAW_METADATA["mc-publish"],
                    loaders: undefined,
                },
            };

            const metadata = ForgeMetadata.from(rawWithoutLoadersField);

            expect(metadata.loaders).toEqual(["forge"]);
        });

        test("returns the same value as the 'loaders' field in the custom payload", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            expect(metadata.loaders).toEqual(["forge", "forge2"]);
        });
    });

    describe("gameName", () => {
        test("always returns 'minecraft'", () => {
            expect(ForgeMetadata.from({} as RawForgeMetadata).gameName).toBe("minecraft");
            expect(ForgeMetadata.from(RAW_METADATA).gameName).toBe("minecraft");
        });
    });

    describe("gameVersions", () => {
        test("returns an empty array if no dependencies were specified", () => {
            const metadata = ForgeMetadata.from({} as RawForgeMetadata);

            expect(metadata.gameVersions).toEqual([]);
        });

        test("returns the same value as the 'minecraft' dependency", () => {
            const metadata = ForgeMetadata.from({ dependencies: { "example-mod": [{ modId: "minecraft", versionRange: "[1.16.5,)" }] } } as unknown as RawForgeMetadata);

            expect(metadata.gameVersions).toEqual(["[1.16.5,)"]);
        });

        test("returns the same values as the 'minecraft' dependency", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            expect(metadata.gameVersions).toEqual(["[1.17, 1.18)"]);
        });
    });

    describe("dependencies", () => {
        test("returns an empty array if no dependencies were specified", () => {
            const metadata = ForgeMetadata.from({} as RawForgeMetadata);

            expect(metadata.dependencies).toEqual([]);
        });

        test("returns dependencies if they were specified", () => {
            const metadata = ForgeMetadata.from({ dependencies: { "example-mod": [{ modId: "breaking-mod", versionRange: "*", incompatible: true }] } } as unknown as RawForgeMetadata);

            const dependencies = metadata.dependencies;

            expect(dependencies).toHaveLength(1);
            expect(dependencies[0]).toMatchObject({ id: "breaking-mod", versions: ["*"], type: DependencyType.INCOMPATIBLE });
        });

        test("regular dependencies have no aliases", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;
            const regularDependencies = ["included-mod", "conflicting-mod", "breaking-mod"].map(id => dependencies.find(x => x.id === id));

            for (const dependency of regularDependencies) {
                for (const platform of PlatformType.values()) {
                    expect(dependency?.getProjectId(platform)).toBe(dependency.id);
                }
            }
        });

        test("special dependencies ('forge', 'minecraft', 'java') are ignored by default", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            expect(dependencies.find(x => x.id === "forge")?.isIgnored()).toBe(true);
            expect(dependencies.find(x => x.id === "minecraft")?.isIgnored()).toBe(true);
            expect(dependencies.find(x => x.id === "java")?.isIgnored()).toBe(true);
        });

        test("regular dependencies are not ignored by default", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            expect(dependencies.find(x => x.id === "included-mod")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "suggested-mod")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "conflicting-mod")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "breaking-mod")?.isIgnored()).toBe(false);
        });

        test("returns dependencies merged with the 'dependencies' declaration from the custom payload", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            expect(dependencies).toHaveLength(8);
            expect(dependencies.find(x => x.id === "forge")).toMatchObject({ versions: ["[34,)"], type: DependencyType.REQUIRED });
            expect(dependencies.find(x => x.id === "minecraft")).toMatchObject({ versions: ["[1.17, 1.18)"], type: DependencyType.REQUIRED });
            expect(dependencies.find(x => x.id === "java")).toMatchObject({ versions: ["[16,)"], type: DependencyType.REQUIRED });
            expect(dependencies.find(x => x.id === "recommended-mod")).toMatchObject({ versions: ["0.2.0"], type: DependencyType.RECOMMENDED });
            expect(dependencies.find(x => x.id === "included-mod")).toMatchObject({ versions: ["*"], type: DependencyType.EMBEDDED });
            expect(dependencies.find(x => x.id === "suggested-mod")).toMatchObject({ versions: ["*"], type: DependencyType.OPTIONAL });
            expect(dependencies.find(x => x.id === "conflicting-mod")).toMatchObject({ versions: ["<0.40.0"], type: DependencyType.CONFLICTING });
            expect(dependencies.find(x => x.id === "breaking-mod")).toMatchObject({ versions: ["*"], type: DependencyType.INCOMPATIBLE });

            const merged = dependencies.find(x => x.id === "recommended-mod");
            expect(merged.getProjectId(PlatformType.MODRINTH)).toBe("AAAA");
            expect(merged.getProjectId(PlatformType.CURSEFORGE)).toBe("42");
            expect(merged.getProjectId(PlatformType.GITHUB)).toBe("v0.2.0");
            expect(merged.isIgnored()).toBe(true);

            const withMetadata = dependencies.find(x => x.id === "suggested-mod");
            expect(withMetadata.getProjectId(PlatformType.MODRINTH)).toBe("BBBB");
            expect(withMetadata.getProjectId(PlatformType.CURSEFORGE)).toBe("43");
            expect(withMetadata.getProjectId(PlatformType.GITHUB)).toBe("v0.3.0");
            expect(withMetadata.isIgnored()).toBe(false);
            expect(withMetadata.isIgnored(PlatformType.CURSEFORGE)).toBe(true);
        });
    });

    describe("mod", () => {
        test("returns the main mod entry in the metadata", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            expect(metadata.mod?.modId).toBe("example-mod");
        });

        test("returns an empty mod entry if no mods were specified in the metadata", () => {
            const metadata = ForgeMetadata.from({} as RawForgeMetadata);

            expect(metadata.mod).toEqual({});
        });
    });

    describe("raw", () => {
        test("returns the raw metadata oject this instance was created from", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            expect(metadata.raw).toBe(RAW_METADATA);
        });
    });

    describe("customPayload", () => {
        test("returns an empty object by default", () => {
            const metadata = ForgeMetadata.from({} as RawForgeMetadata);

            expect(metadata.customPayload).toEqual({});
        });

        test("return the custom payload if it was specified", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            expect(metadata.customPayload?.loaders).toEqual(["forge", "forge2"]);
        });
    });

    describe("getProjectId", () => {
        test("returns the mod id by default", () => {
            const metadata = ForgeMetadata.from({ mods: [{ modId: "example-mod" }] } as RawForgeMetadata);

            for (const platform of PlatformType.values()) {
                expect(metadata.getProjectId(platform)).toBe("example-mod");
            }
        });

        test("returns the same value as one specified in the custom payload", () => {
            const metadata = ForgeMetadata.from(RAW_METADATA);

            expect(metadata.getProjectId(PlatformType.MODRINTH)).toBe("AANobbMI");
            expect(metadata.getProjectId(PlatformType.CURSEFORGE)).toBe("394468");
            expect(metadata.getProjectId(PlatformType.GITHUB)).toBe("mc1.18-0.4.0-alpha5");
        });
    });
});
