import { GameVersion } from "@/games/game-version";
import { CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER, CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER, CurseForgeGameVersion, findCurseForgeGameVersionIdsByNames, formatCurseForgeGameVersion, formatCurseForgeGameVersionSnapshot } from "@/platforms/curseforge/curseforge-game-version";

describe("CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER", () => {
    test("returns true when both versions are the same and do not contain '-Snapshot'", () => {
        const a = "1.17";
        const b = "1.17";

        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(a, b)).toBe(true);
        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(b, a)).toBe(true);
    });

    test("returns true when both versions are the same and contain '-Snapshot'", () => {
        const a = "1.17-Snapshot";
        const b = "1.17-Snapshot";

        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(a, b)).toBe(true);
        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(b, a)).toBe(true);
    });

    test("returns true when one version contains '-Snapshot' and the other does not", () => {
        const a = "1.17";
        const b = "1.17-Snapshot";

        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(a, b)).toBe(true);
        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(b, a)).toBe(true);
    });

    test("returns false when the versions are different", () => {
        const a = "1.17";
        const b = "1.18";

        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(a, b)).toBe(false);
        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(b, a)).toBe(false);
    });

    test("returns false when one version is empty", () => {
        const a = "";
        const b = "1.17-Snapshot";

        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(a, b)).toBe(false);
        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(b, a)).toBe(false);
    });

    test("returns false when one version is null", () => {
        const a = null;
        const b = "1.17-Snapshot";

        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(a, b)).toBe(false);
        expect(CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER(b, a)).toBe(false);
    });
});

describe("CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER", () => {
    test("returns true when both versions are the same", () => {
        const a = "1.17";
        const b = "1.17";

        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(a, b)).toBe(true);
        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(b, a)).toBe(true);
    });

    test("returns true when versions are embedded in strings", () => {
        const a = "CB 1.4.6-R0.1";
        const b = "1.4.6";

        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(a, b)).toBe(true);
        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(b, a)).toBe(true);
    });

    test("returns false when different versions are embedded in strings", () => {
        const a = "CB 1.4.6-R0.1";
        const b = "1.3.2";

        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(a, b)).toBe(false);
        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(b, a)).toBe(false);
    });

    test("returns false when the versions are different", () => {
        const a = "1.17";
        const b = "1.18";

        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(a, b)).toBe(false);
        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(b, a)).toBe(false);
    });

    test("returns false when one version is empty", () => {
        const a = "";
        const b = "1.17";

        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(a, b)).toBe(false);
        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(b, a)).toBe(false);
    });

    test("returns false when one version is null", () => {
        const a = null;
        const b = "1.17";

        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(a, b)).toBe(false);
        expect(CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER(b, a)).toBe(false);
    });
});

describe("findCurseForgeGameVersionIdsByNames", () => {
    const versions = Object.freeze([
        { id: 1, name: "1.17" },
        { id: 2, name: "1.17.1" },
        { id: 3, name: "1.18-Snapshot" },
        { id: 4, name: "CB 1.4.6-R0.1" },
    ]) as unknown[] as CurseForgeGameVersion[];

    test("returns the correct IDs when using the default comparer", () => {
        const names = ["1.17", "1.17.1"];
        const ids = [1, 2];

        const result = findCurseForgeGameVersionIdsByNames(versions, names);

        expect(result).toEqual(ids);
    });

    test("returns the correct IDs when using a custom comparer", () => {
        const names = ["1.18"];
        const ids = [3];

        const result = findCurseForgeGameVersionIdsByNames(versions, names, CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER);

        expect(result).toEqual(ids);
    });

    test("returns the correct IDs when using a fallback comparer", () => {
        const names = ["1.18", "1.17.1", "1.4.6"];
        const ids = [3, 2, 4];

        const result = findCurseForgeGameVersionIdsByNames(versions, names, CURSEFORGE_GAME_VERSION_SNAPSHOT_NAME_COMPARER, CURSEFORGE_GAME_VERSION_PLUGIN_NAME_COMPARER);

        expect(result).toEqual(ids);
    });

    test("returns an empty array when no names match", () => {
        const names = ["1.0", "2.0"];
        const ids = [];

        const result = findCurseForgeGameVersionIdsByNames(versions, names);

        expect(result).toEqual(ids);
    });
});

describe("formatCurseForgeGameVersion", () => {
    test("formats the game version correctly when the patch version is present", () => {
        const gameVersion = {
            version: {
                major: 1,
                minor: 17,
                patch: 1,
            },
        } as GameVersion;

        const expected = "1.17.1";

        const result = formatCurseForgeGameVersion(gameVersion);

        expect(result).toEqual(expected);
    });

    test("formats the game version correctly when the patch version is zero", () => {
        const gameVersion = {
            version: {
                major: 1,
                minor: 17,
                patch: 0,
            },
        } as GameVersion;

        const expected = "1.17";

        const result = formatCurseForgeGameVersion(gameVersion);

        expect(result).toEqual(expected);
    });
});

describe("formatCurseForgeGameVersionSnapshot", () => {
    test("formats the game version correctly when it's not a snapshot", () => {
        const gameVersion = {
            version: {
                major: 1,
                minor: 17,
                patch: 1,
            },
            isSnapshot: false,
        } as GameVersion;

        const expected = "1.17.1";

        const result = formatCurseForgeGameVersionSnapshot(gameVersion);

        expect(result).toEqual(expected);
    });

    test("formats the game version correctly when it's a snapshot", () => {
        const gameVersion = {
            version: {
                major: 1,
                minor: 18,
            },
            isSnapshot: true,
        } as GameVersion;

        const expected = "1.18-Snapshot";

        const result = formatCurseForgeGameVersionSnapshot(gameVersion);

        expect(result).toEqual(expected);
    });

    test("formats the game version correctly when the patch version is zero and it's not a snapshot", () => {
        const gameVersion = {
            version: {
                major: 1,
                minor: 17,
                patch: 0,
            },
            isSnapshot: false,
        } as GameVersion;

        const expected = "1.17";

        const result = formatCurseForgeGameVersionSnapshot(gameVersion);

        expect(result).toEqual(expected);
    });
});
