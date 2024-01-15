import { DependencyType } from "@/dependencies/dependency-type";
import { RawNeoForgeMetadata } from "@/loaders/neoforge/raw-neoforge-metadata";
import { NeoForgeDependencyType } from "@/loaders/neoforge/neoforge-dependency-type";
import { getNeoForgeDependencies, normalizeNeoForgeDependency } from "@/loaders/neoforge/neoforge-dependency";

describe("getNeoForgeDependencies", () => {
    test("returns an array of dependencies specified in the given metadata", () => {
        const metadata = {
            dependencies: {
                "example-mod": [
                    {
                        modId: "depends-id",
                        versionRange: "[1.0.0,)",
                    },
                    {
                        modId: "suggests-id",
                        versionRange: "[2.0.0,)",
                        mandatory: false,
                    },
                ],

                "example-mod-2": [{
                    modId: "breaks-id",
                    versionRange: "[4.0.0,5.0.0]",
                    type: NeoForgeDependencyType.INCOMPATIBLE,
                }],
            },
        } as unknown as RawNeoForgeMetadata;

        const dependencies = getNeoForgeDependencies(metadata);

        expect(dependencies).toEqual([
            { modId: "breaks-id", versionRange: "[4.0.0,5.0.0]", type: NeoForgeDependencyType.INCOMPATIBLE },
            { modId: "suggests-id", versionRange: "[2.0.0,)", mandatory: false },
            { modId: "depends-id", versionRange: "[1.0.0,)" },
        ]);
    });

    test("returns an empty array if no dependencies were specified", () => {
        expect(getNeoForgeDependencies({} as RawNeoForgeMetadata)).toEqual([]);
    });

    test("returns an empty array if metadata was null or undefined", () => {
        expect(getNeoForgeDependencies(null)).toEqual([]);
        expect(getNeoForgeDependencies(undefined)).toEqual([]);
    });
});

describe("normalizeNeoForgeDependency", () => {
    test("converts NeoForge dependency to a more abstract Dependency object", () => {
        const neoforgeDependency = { modId: "suggests-id", type: NeoForgeDependencyType.OPTIONAL, versionRange: "[2.0.0,)" };

        const dependency = normalizeNeoForgeDependency(neoforgeDependency);

        expect(dependency).toMatchObject({ id: "suggests-id", versions: ["[2.0.0,)"], type: DependencyType.OPTIONAL });
    });

    test("returns undefined if dependency was null or undefined", () => {
        expect(normalizeNeoForgeDependency(null)).toBeUndefined();
        expect(normalizeNeoForgeDependency(undefined)).toBeUndefined();
    });
});
