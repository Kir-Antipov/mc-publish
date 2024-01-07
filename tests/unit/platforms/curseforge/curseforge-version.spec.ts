import { VersionType } from "@/utils/versioning/version-type";
import { FileInfo } from "@/utils/io/file-info";
import { CurseForgeDependencyType } from "@/platforms/curseforge/curseforge-dependency-type";
import { packCurseForgeVersionInit, CurseForgeVersionInit } from "@/platforms/curseforge/curseforge-version";

describe("packCurseForgeVersionInit", () => {
    test("returns correct form data when parent file ID is provided", () => {
        const version: CurseForgeVersionInit = Object.freeze({
            project_id: 0,
            changelog: "Initial release",
            changelog_type: "markdown",
            name: "Version 1.0",
            version_type: VersionType.RELEASE,
            dependencies: [{ slug: "mod-id", type: CurseForgeDependencyType.REQUIRED_DEPENDENCY }],
        });
        const gameVersions = [1, 2, 3];
        const file = "path/to/file";
        const parentFileId = 123;

        const result = packCurseForgeVersionInit(version, gameVersions, file, parentFileId);

        expect(result.file).toBeInstanceOf(FileInfo);
        expect(result.metadata).toEqual({
            changelog: version.changelog,
            changelogType: version.changelog_type,
            displayName: result.file.name,
            parentFileID: parentFileId,
            gameVersions: undefined,
            releaseType: version.version_type,
            relations: undefined,
        });
    });

    test("returns correct form data when parent file ID is not provided", () => {
        const version: CurseForgeVersionInit = Object.freeze({
            project_id: 0,
            changelog: "Initial release",
            changelog_type: "markdown",
            name: "Version 1.0",
            version_type: VersionType.RELEASE,
            dependencies: [{ slug: "mod-id", type: CurseForgeDependencyType.REQUIRED_DEPENDENCY }],
        });
        const gameVersions = [1, 2, 3];
        const file = "path/to/file";

        const result = packCurseForgeVersionInit(version, gameVersions, file);

        expect(result.file).toBeInstanceOf(FileInfo);
        expect(result.metadata).toEqual({
            changelog: version.changelog,
            changelogType: version.changelog_type,
            displayName: version.name,
            parentFileID: undefined,
            gameVersions,
            releaseType: version.version_type,
            relations: { projects: version.dependencies },
        });
    });
});
