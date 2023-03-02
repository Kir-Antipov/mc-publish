import { DependencyType } from "@/dependencies/dependency-type";
import { RawFabricMetadata } from "@/loaders/fabric/raw-fabric-metadata";
import { FabricDependencyType } from "@/loaders/fabric/fabric-dependency-type";
import { getFabricDependencies, normalizeFabricDependency, toFabricDependencyArray } from "@/loaders/fabric/fabric-dependency";

describe("getFabricDependencies", () => {
    test("returns an array of dependencies specified in the given metadata", () => {
        const metadata = {
            schemaVersion: 1,
            id: "example-mod",
            version: "1.0.0",

            depends: { "depends-id": "1.0.0" },
            recommends: { "recommends-id": "2.0.0" },
            suggests: { "suggests-id": "3.0.0" },
            breaks: { "breaks-id": ["4.0.0", "5.0.0"] },
            conflicts: {
                "conflicts-id-1": "6.0.0",
                "conflicts-id-2": "7.0.0",
            },
        } as RawFabricMetadata;

        const dependencies = getFabricDependencies(metadata);

        expect(dependencies).toEqual([
            { id: "depends-id", version: "1.0.0", type: FabricDependencyType.DEPENDS },
            { id: "recommends-id", version: "2.0.0", type: FabricDependencyType.RECOMMENDS },
            { id: "suggests-id", version: "3.0.0", type: FabricDependencyType.SUGGESTS },
            { id: "breaks-id", version: ["4.0.0", "5.0.0"], type: FabricDependencyType.BREAKS },
            { id: "conflicts-id-1", version: "6.0.0", type: FabricDependencyType.CONFLICTS },
            { id: "conflicts-id-2", version: "7.0.0", type: FabricDependencyType.CONFLICTS },
        ]);
    });

    test("returns an empty array if no dependencies were specified", () => {
        expect(getFabricDependencies({} as RawFabricMetadata)).toEqual([]);
    });

    test("returns an empty array if metadata was null or undefined", () => {
        expect(getFabricDependencies(null)).toEqual([]);
        expect(getFabricDependencies(undefined)).toEqual([]);
    });
});

describe("toFabricDependencyArray", () => {
    test("converts a dependency list to an array", () => {
        const conflicting = {
            "conflicts-id-1": "6.0.0",
            "conflicts-id-2": ["7.0.0", "8.0.0"],
        };

        const dependencies = toFabricDependencyArray(conflicting, FabricDependencyType.CONFLICTS);

        expect(dependencies).toEqual([
            { id: "conflicts-id-1", version: "6.0.0", type: FabricDependencyType.CONFLICTS },
            { id: "conflicts-id-2", version: ["7.0.0", "8.0.0"], type: FabricDependencyType.CONFLICTS },
        ]);
    });

    test("returns an empty array if no dependencies were specified", () => {
        expect(toFabricDependencyArray({}, FabricDependencyType.DEPENDS)).toEqual([]);
    });

    test("returns an empty array if dependency list was null or undefined", () => {
        expect(toFabricDependencyArray(null, FabricDependencyType.DEPENDS)).toEqual([]);
        expect(toFabricDependencyArray(undefined, FabricDependencyType.DEPENDS)).toEqual([]);
    });
});

describe("normalizeFabricDependency", () => {
    test("converts Fabric dependency to a more abstract Dependency object", () => {
        const fabricDependency = { id: "recommends-id", version: "2.0.0", type: FabricDependencyType.RECOMMENDS };

        const dependency = normalizeFabricDependency(fabricDependency);

        expect(dependency).toMatchObject({ id: "recommends-id", versions: ["2.0.0"], type: DependencyType.RECOMMENDED });
    });

    test("returns undefined if dependency was null or undefined", () => {
        expect(normalizeFabricDependency(null)).toBeUndefined();
        expect(normalizeFabricDependency(undefined)).toBeUndefined();
    });
});
