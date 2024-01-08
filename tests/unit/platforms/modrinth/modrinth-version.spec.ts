import { FileInfo } from "@/utils/io/file-info";
import { VersionType } from "@/utils/versioning/version-type";
import { ModrinthVersionInit, packModrinthVersionInit } from "@/platforms/modrinth/modrinth-version";
import { ModrinthDependencyType } from "@/platforms/modrinth";

describe("packModrinthVersionInit", () => {
    test("packs a ModrinthVersionInit object and resolves default values", () => {
        const version = {
            project_id: "QQQQQQQQ",
            version_number: "1.0.0",
        } as ModrinthVersionInit;

        const expected = {
            data: {
                project_id: "QQQQQQQQ",
                version_number: "1.0.0",
                name: "1.0.0",
                version_type: VersionType.RELEASE,
                featured: true,
                dependencies: [],
                game_versions: [],
                loaders: [],
                primary_file: undefined,
                file_parts: [],
            },
        };

        expect(packModrinthVersionInit(version)).toEqual(expected);
    });

    test("packs a ModrinthVersionInit object", () => {
        const version = {
            project_id: "QQQQQQQQ",
            version_number: "1.0.0",
            name: "Version 1.0.0",
            version_type: VersionType.ALPHA,
            featured: false,
            dependencies: [{ project_id: "fabric-api", dependency_type: ModrinthDependencyType.REQUIRED }],
            game_versions: ["1.16", "1.17"],
            loaders: ["loader1", "loader2"],
            files: ["file1", "file2"],
        } as ModrinthVersionInit;

        const expected = {
            data: {
                project_id: "QQQQQQQQ",
                version_number: "1.0.0",
                name: "Version 1.0.0",
                version_type: VersionType.ALPHA,
                featured: false,
                dependencies: [{ project_id: "fabric-api", dependency_type: ModrinthDependencyType.REQUIRED }],
                game_versions: ["1.16", "1.17"],
                loaders: ["loader1", "loader2"],
                primary_file: "_0",
                file_parts: ["_0", "_1"],
            },

            _0: FileInfo.of("file1"),
            _1: FileInfo.of("file2"),
        };

        expect(packModrinthVersionInit(version)).toEqual(expected);
    });
});
