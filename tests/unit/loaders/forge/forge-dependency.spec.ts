import { DependencyType } from "@/dependencies/dependency-type";
import { RawForgeMetadata } from "@/loaders/forge/raw-forge-metadata";
import { getForgeDependencies, normalizeForgeDependency } from "@/loaders/forge/forge-dependency";

describe("getForgeDependencies", () => {
    test("returns an array of dependencies specified in the given metadata", () => {
        const metadata = {
            dependencies: {
                "example-mod": [
                    {
                        modId: "depends-id",
                        versionRange: "[1.0.0,)",
                        mandatory: true,
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
                    mandatory: false,
                    incompatible: true,
                }],
            },
        } as unknown as RawForgeMetadata;

        const dependencies = getForgeDependencies(metadata);

        expect(dependencies).toEqual([
            { modId: "breaks-id", versionRange: "[4.0.0,5.0.0]", mandatory: false, incompatible: true },
            { modId: "suggests-id", versionRange: "[2.0.0,)", mandatory: false },
            { modId: "depends-id", versionRange: "[1.0.0,)", mandatory: true },
        ]);
    });

    test("returns an empty array if no dependencies were specified", () => {
        expect(getForgeDependencies({} as RawForgeMetadata)).toEqual([]);
    });

    test("returns an empty array if metadata was null or undefined", () => {
        expect(getForgeDependencies(null)).toEqual([]);
        expect(getForgeDependencies(undefined)).toEqual([]);
    });
});

describe("normalizeForgeDependency", () => {
    test("converts Forge dependency to a more abstract Dependency object", () => {
        const forgeDependency = { modId: "suggests-id", mandatory: false, versionRange: "[2.0.0,)" };

        const dependency = normalizeForgeDependency(forgeDependency);

        expect(dependency).toMatchObject({ id: "suggests-id", versions: ["[2.0.0,)"], type: DependencyType.OPTIONAL });
    });

    test("returns undefined if dependency was null or undefined", () => {
        expect(normalizeForgeDependency(null)).toBeUndefined();
        expect(normalizeForgeDependency(undefined)).toBeUndefined();
    });
});
