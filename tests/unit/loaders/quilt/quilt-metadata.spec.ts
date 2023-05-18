import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { DependencyType } from "@/dependencies/dependency-type";
import { PlatformType } from "@/platforms/platform-type";
import { RawQuiltMetadata } from "@/loaders/quilt/raw-quilt-metadata";
import { QuiltMetadata } from "@/loaders/quilt/quilt-metadata";

const RAW_METADATA: RawQuiltMetadata = Object.freeze(JSON.parse(
    readFileSync(resolvePath(__dirname, "../../../content/quilt/quilt.mod.json"), "utf8")
));

describe("QuiltMetadata", () => {
    describe("from", () => {
        test("constructs new QuiltMetadata instance using given raw metadata", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            expect(metadata).toBeInstanceOf(QuiltMetadata);
            expect(metadata.raw).toBe(RAW_METADATA);
        });
    });

    describe("id", () => {
        test("returns id of the mod", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            expect(metadata.id).toBe("example-mod");
        });
    });

    describe("name", () => {
        test("returns name of the mod", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            expect(metadata.name).toBe("Example Mod");
        });
    });

    describe("version", () => {
        test("returns version of the mod", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            expect(metadata.version).toBe("0.1.0");
        });
    });

    describe("loaders", () => {
        test("returns 'quilt' by default", () => {
            const metadata = QuiltMetadata.from({} as RawQuiltMetadata);

            expect(metadata.loaders).toEqual(["quilt"]);
        });

        test("returns the same value as the 'loaders' field in the custom payload", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            expect(metadata.loaders).toEqual(["quilt", "fabric"]);
        });
    });

    describe("gameName", () => {
        test("always returns 'minecraft'", () => {
            expect(QuiltMetadata.from({} as RawQuiltMetadata).gameName).toBe("minecraft");
            expect(QuiltMetadata.from(RAW_METADATA).gameName).toBe("minecraft");
        });
    });

    describe("gameVersions", () => {
        test("returns an empty array if no dependencies were specified", () => {
            const metadata = QuiltMetadata.from({} as RawQuiltMetadata);

            expect(metadata.gameVersions).toEqual([]);
        });

        test("returns the same value as the 'minecraft' dependency", () => {
            const metadata = QuiltMetadata.from({ quilt_loader: { depends: [{ id: "minecraft", versions: "1.16.5" }] } } as RawQuiltMetadata);

            expect(metadata.gameVersions).toEqual(["1.16.5"]);
        });

        test("returns the same values as the 'minecraft' dependency", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            expect(metadata.gameVersions).toEqual(["1.17", "1.17.1"]);
        });
    });

    describe("dependencies", () => {
        test("returns an empty array if no dependencies were specified", () => {
            const metadata = QuiltMetadata.from({} as RawQuiltMetadata);

            expect(metadata.dependencies).toEqual([]);
        });

        test("returns dependencies if they were specified", () => {
            const metadata = QuiltMetadata.from({ quilt_loader: { breaks: RAW_METADATA.quilt_loader.breaks } } as RawQuiltMetadata);

            const dependencies = metadata.dependencies;

            expect(dependencies).toHaveLength(2);
            expect(dependencies[0]).toMatchObject({ id: "breaking-mod", versions: ["*"], type: DependencyType.INCOMPATIBLE });
            expect(dependencies[1]).toMatchObject({ id: "conflicting-mod", versions: ["<0.40.0"], type: DependencyType.CONFLICTING });
        });

        test("special well-known dependency 'quilted_fabric_api' has custom 'qsl' alias", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            const quilt = dependencies.find(x => x.id === "quilted_fabric_api");
            for (const platform of PlatformType.values()) {
                expect(quilt?.getProjectId(platform)).toBe("qsl");
            }
        });

        test("regular dependencies have no aliases", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;
            const regularDependencies = ["included-mod", "conflicting-mod", "breaking-mod"].map(id => dependencies.find(x => x.id === id));

            for (const dependency of regularDependencies) {
                for (const platform of PlatformType.values()) {
                    expect(dependency?.getProjectId(platform)).toBe(dependency.id);
                }
            }
        });

        test("special dependencies ('quilt_loader', 'minecraft', 'java') are ignored by default", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            expect(dependencies.find(x => x.id === "quilt_loader")?.isIgnored()).toBe(true);
            expect(dependencies.find(x => x.id === "minecraft")?.isIgnored()).toBe(true);
            expect(dependencies.find(x => x.id === "java")?.isIgnored()).toBe(true);
        });

        test("regular dependencies are not ignored by default", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            expect(dependencies.find(x => x.id === "quilted_fabric_api")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "included-mod")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "suggested-mod")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "conflicting-mod")?.isIgnored()).toBe(false);
            expect(dependencies.find(x => x.id === "breaking-mod")?.isIgnored()).toBe(false);
        });

        test("returns dependencies merged with the 'dependencies' declaration from the custom payload", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            const dependencies = metadata.dependencies;

            expect(dependencies).toHaveLength(9);
            expect(dependencies.find(x => x.id === "quilt_loader")).toMatchObject({ versions: [">=0.11.3"], type: DependencyType.REQUIRED });
            expect(dependencies.find(x => x.id === "quilted_fabric_api")).toMatchObject({ versions: [">=0.40.0"], type: DependencyType.REQUIRED });
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

            const withMetadata = dependencies.find(x => x.id === "suggested-mod");
            expect(withMetadata.getProjectId(PlatformType.MODRINTH)).toBe("BBBB");
            expect(withMetadata.getProjectId(PlatformType.CURSEFORGE)).toBe("43");
            expect(withMetadata.getProjectId(PlatformType.GITHUB)).toBe("v0.3.0");
            expect(withMetadata.isIgnored()).toBe(false);
            expect(withMetadata.isIgnored(PlatformType.CURSEFORGE)).toBe(true);
        });
    });

    describe("raw", () => {
        test("returns the raw metadata oject this instance was created from", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            expect(metadata.raw).toBe(RAW_METADATA);
        });
    });

    describe("customPayload", () => {
        test("returns an empty object by default", () => {
            const metadata = QuiltMetadata.from({} as RawQuiltMetadata);

            expect(metadata.customPayload).toEqual({});
        });

        test("return the custom payload if it was specified", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            expect(metadata.customPayload?.loaders).toEqual(["quilt", "fabric"]);
        });
    });

    describe("getProjectId", () => {
        test("returns the mod id by default", () => {
            const metadata = QuiltMetadata.from({ quilt_loader: { id: "example-mod" } } as RawQuiltMetadata);

            for (const platform of PlatformType.values()) {
                expect(metadata.getProjectId(platform)).toBe("example-mod");
            }
        });

        test("returns the same value as one specified in the custom payload", () => {
            const metadata = QuiltMetadata.from(RAW_METADATA);

            expect(metadata.getProjectId(PlatformType.MODRINTH)).toBe("AANobbMI");
            expect(metadata.getProjectId(PlatformType.CURSEFORGE)).toBe("394468");
            expect(metadata.getProjectId(PlatformType.GITHUB)).toBe("mc1.18-0.4.0-alpha5");
        });
    });
});
