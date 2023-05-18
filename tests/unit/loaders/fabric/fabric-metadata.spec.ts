import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { DependencyType } from "@/dependencies/dependency-type";
import { PlatformType } from "@/platforms/platform-type";
import { RawFabricMetadata } from "@/loaders/fabric/raw-fabric-metadata";
import { FabricMetadata } from "@/loaders/fabric/fabric-metadata";

const RAW_METADATA: RawFabricMetadata = Object.freeze(JSON.parse(
    readFileSync(resolvePath(__dirname, "../../../content/fabric/fabric.mod.json"), "utf8")
));

describe("FabricMetadata", () => {
    describe("from", () => {
        test("constructs new FabricMetadata instance using given raw metadata", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            expect(metadata).toBeInstanceOf(FabricMetadata);
            expect(metadata.raw).toBe(RAW_METADATA);
        });
    });

    describe("id", () => {
        test("returns id of the mod", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            expect(metadata.id).toBe("example-mod");
        });
    });

    describe("name", () => {
        test("returns name of the mod", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            expect(metadata.name).toBe("Example Mod");
        });
    });

    describe("version", () => {
        test("returns version of the mod", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            expect(metadata.version).toBe("0.1.0");
        });
    });

    describe("loaders", () => {
        test("returns 'fabric' by default", () => {
            const metadata = FabricMetadata.from({} as RawFabricMetadata);

            expect(metadata.loaders).toEqual(["fabric"]);
        });

        test("returns the same value as the 'loaders' field in the custom payload", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            expect(metadata.loaders).toEqual(["fabric", "quilt"]);
        });
    });

    describe("gameName", () => {
        test("always returns 'minecraft'", () => {
            expect(FabricMetadata.from({} as RawFabricMetadata).gameName).toBe("minecraft");
            expect(FabricMetadata.from(RAW_METADATA).gameName).toBe("minecraft");
        });
    });

    describe("gameVersions", () => {
        test("returns an empty array if no dependencies were specified", () => {
            const metadata = FabricMetadata.from({} as RawFabricMetadata);

            expect(metadata.gameVersions).toEqual([]);
        });

        test("returns the same value as the 'minecraft' dependency", () => {
            const metadata = FabricMetadata.from({ recommends: { minecraft: "1.16.5" } } as unknown as RawFabricMetadata);

            expect(metadata.gameVersions).toEqual(["1.16.5"]);
        });

        test("returns the same values as the 'minecraft' dependency", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            expect(metadata.gameVersions).toEqual(["1.17", "1.17.1"]);
        });
    });

    describe("dependencies", () => {
        test("returns an empty array if no dependencies were specified", () => {
            const metadata = FabricMetadata.from({} as RawFabricMetadata);

            expect(metadata.dependencies).toEqual([]);
        });

        test("returns dependencies if they were specified", () => {
            const metadata = FabricMetadata.from({ breaks: RAW_METADATA.breaks } as RawFabricMetadata);

            const dependencies = metadata.dependencies;

            expect(dependencies).toHaveLength(1);
            expect(dependencies[0]).toMatchObject({ id: "breaking-mod", versions: ["*"], type: DependencyType.INCOMPATIBLE });
        });

        test("special well-known dependency 'fabric' has custom 'fabric-api' alias", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            const fabric = dependencies.find(x => x.id === "fabric");
            for (const platform of PlatformType.values()) {
                expect(fabric?.getProjectId(platform)).toBe("fabric-api");
            }
        });

        test("regular dependencies have no aliases", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;
            const regularDependencies = ["included-mod", "suggested-mod", "conflicting-mod", "breaking-mod"].map(id => dependencies.find(x => x.id === id));

            for (const dependency of regularDependencies) {
                for (const platform of PlatformType.values()) {
                    expect(dependency?.getProjectId(platform)).toBe(dependency.id);
                }
            }
        });

        test("special dependencies ('fabricloader', 'minecraft', 'java') are ignored by default", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            expect(dependencies.find(x => x.id === "fabricloader")?.isIgnored()).toBe(true);
            expect(dependencies.find(x => x.id === "minecraft")?.isIgnored()).toBe(true);
            expect(dependencies.find(x => x.id === "java")?.isIgnored()).toBe(true);
        });

        test("regular dependencies are not ignored by default", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            expect(dependencies.find(x => x.id === "fabric")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "included-mod")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "suggested-mod")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "conflicting-mod")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "breaking-mod")?.isIgnored()).toBe(false);
        });

        test("returns dependencies merged with the 'dependencies' declaration from the custom payload", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            expect(dependencies).toHaveLength(9);
            expect(dependencies.find(x => x.id === "fabricloader")).toMatchObject({ versions: [">=0.11.3"], type: DependencyType.REQUIRED });
            expect(dependencies.find(x => x.id === "fabric")).toMatchObject({ versions: [">=0.40.0"], type: DependencyType.REQUIRED });
            expect(dependencies.find(x => x.id === "minecraft")).toMatchObject({ versions: ["1.17", "1.17.1"], type: DependencyType.REQUIRED });
            expect(dependencies.find(x => x.id === "java")).toMatchObject({ versions: [">=16"], type: DependencyType.REQUIRED });
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
        });
    });

    describe("raw", () => {
        test("returns the raw metadata oject this instance was created from", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            expect(metadata.raw).toBe(RAW_METADATA);
        });
    });

    describe("customPayload", () => {
        test("returns an empty object by default", () => {
            const metadata = FabricMetadata.from({} as RawFabricMetadata);

            expect(metadata.customPayload).toEqual({});
        });

        test("return the custom payload if it was specified", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            expect(metadata.customPayload?.loaders).toEqual(["fabric", "quilt"]);
        });
    });

    describe("getProjectId", () => {
        test("returns the mod id by default", () => {
            const metadata = FabricMetadata.from({ id: "example-mod" } as RawFabricMetadata);

            for (const platform of PlatformType.values()) {
                expect(metadata.getProjectId(platform)).toBe("example-mod");
            }
        });

        test("returns the same value as one specified in the custom payload", () => {
            const metadata = FabricMetadata.from(RAW_METADATA);

            expect(metadata.getProjectId(PlatformType.MODRINTH)).toBe("AANobbMI");
            expect(metadata.getProjectId(PlatformType.CURSEFORGE)).toBe("394468");
            expect(metadata.getProjectId(PlatformType.GITHUB)).toBe("mc1.18-0.4.0-alpha5");
        });
    });
});
