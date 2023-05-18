import { DependencyType } from "@/dependencies/dependency-type";
import { RawQuiltMetadata } from "@/loaders/quilt/raw-quilt-metadata";
import { getQuiltDependencies, normalizeQuiltDependency } from "@/loaders/quilt/quilt-dependency";

describe("getQuiltDependencies", () => {
    test("returns an array of dependencies specified in the given metadata", () => {
        const metadata = {
            quilt_loader: {
                depends: [
                    {
                        id: "depends-id",
                        versions: "1.0.0",
                    },
                    {
                        id: "suggests-id",
                        versions: "3.0.0",
                        optional: true,
                    },
                ],
                breaks: [
                    {
                        id: "breaks-id",
                        versions: ["4.0.0", "5.0.0"],
                    },
                    {
                        id: "conflicts-id-1",
                        versions: "6.0.0",
                        unless: "fixes-conflicts-id-1",
                    },
                    {
                        id: "conflicts-id-2",
                        versions: "7.0.0",
                        unless: "fixes-conflicts-id-2",
                    },
                ],
            },
        } as RawQuiltMetadata;

        const dependencies = getQuiltDependencies(metadata);

        expect(dependencies).toEqual([
            { id: "depends-id", versions: "1.0.0" },
            { id: "suggests-id", versions: "3.0.0", optional: true },
            { id: "breaks-id", versions: ["4.0.0", "5.0.0"], breaking: true },
            { id: "conflicts-id-1", versions: "6.0.0", breaking: true, unless: "fixes-conflicts-id-1" },
            { id: "conflicts-id-2", versions: "7.0.0", breaking: true, unless: "fixes-conflicts-id-2" },
        ]);
    });

    test("returns an empty array if no dependencies were specified", () => {
        expect(getQuiltDependencies({} as RawQuiltMetadata)).toEqual([]);
    });

    test("returns an empty array if metadata was null or undefined", () => {
        expect(getQuiltDependencies(null)).toEqual([]);
        expect(getQuiltDependencies(undefined)).toEqual([]);
    });
});

describe("normalizeQuiltDependency", () => {
    test("converts Quilt dependency to a more abstract Dependency object", () => {
        const quiltDependency = { id: "suggested:suggests-id", versions: "2.0.0", optional: true };

        const dependency = normalizeQuiltDependency(quiltDependency);

        expect(dependency).toMatchObject({ id: "suggests-id", versions: ["2.0.0"], type: DependencyType.OPTIONAL });
    });

    test("returns undefined if dependency was null or undefined", () => {
        expect(normalizeQuiltDependency(null)).toBeUndefined();
        expect(normalizeQuiltDependency(undefined)).toBeUndefined();
    });
});
