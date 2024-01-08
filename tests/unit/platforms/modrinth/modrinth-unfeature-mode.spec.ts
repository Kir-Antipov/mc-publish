import { UnfeaturableModrinthVersion } from "@/platforms/modrinth/modrinth-version";
import { ModrinthUnfeatureMode } from "@/platforms/modrinth/modrinth-unfeature-mode";

describe("ModrinthUnfeatureMode", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of ModrinthUnfeatureMode.values()) {
                expect(ModrinthUnfeatureMode.parse(ModrinthUnfeatureMode.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of ModrinthUnfeatureMode.values()) {
                expect(ModrinthUnfeatureMode.parse(ModrinthUnfeatureMode.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of ModrinthUnfeatureMode.values()) {
                expect(ModrinthUnfeatureMode.parse(ModrinthUnfeatureMode.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of ModrinthUnfeatureMode.values()) {
                expect(ModrinthUnfeatureMode.parse(ModrinthUnfeatureMode.format(value).toUpperCase())).toBe(value);
            }
        });
    });

    describe("isNone", () => {
        test("returns true if the mode is NONE", () => {
            expect(ModrinthUnfeatureMode.isNone(ModrinthUnfeatureMode.NONE)).toBe(true);
        });

        test("returns true if the mode is not NONE", () => {
            const modes = [...ModrinthUnfeatureMode.values()].filter(x => x !== ModrinthUnfeatureMode.NONE);

            for (const mode of modes) {
                expect(ModrinthUnfeatureMode.isNone(mode)).toBe(false);
            }
        });
    });

    describe("isSubset", () => {
        test("returns true if the mode represents a subset mode", () => {
            expect(ModrinthUnfeatureMode.isSubset(ModrinthUnfeatureMode.LOADER_SUBSET)).toBe(true);
            expect(ModrinthUnfeatureMode.isSubset(ModrinthUnfeatureMode.GAME_VERSION_SUBSET)).toBe(true);
            expect(ModrinthUnfeatureMode.isSubset(ModrinthUnfeatureMode.VERSION_TYPE_SUBSET)).toBe(true);
            expect(ModrinthUnfeatureMode.isSubset(ModrinthUnfeatureMode.SUBSET)).toBe(true);
        });

        test("returns false if the mode doesn't represent a subset mode", () => {
            const modes = [...ModrinthUnfeatureMode.values()]
                .filter(x => x !== ModrinthUnfeatureMode.LOADER_SUBSET)
                .filter(x => x !== ModrinthUnfeatureMode.GAME_VERSION_SUBSET)
                .filter(x => x !== ModrinthUnfeatureMode.VERSION_TYPE_SUBSET)
                .filter(x => x !== ModrinthUnfeatureMode.SUBSET);

            for (const mode of modes) {
                expect(ModrinthUnfeatureMode.isSubset(mode)).toBe(false);
            }
        });
    });

    describe("isIntersection", () => {
        test("returns true if the mode represents an intersection mode", () => {
            expect(ModrinthUnfeatureMode.isIntersection(ModrinthUnfeatureMode.LOADER_INTERSECTION)).toBe(true);
            expect(ModrinthUnfeatureMode.isIntersection(ModrinthUnfeatureMode.GAME_VERSION_INTERSECTION)).toBe(true);
            expect(ModrinthUnfeatureMode.isIntersection(ModrinthUnfeatureMode.GAME_VERSION_INTERSECTION)).toBe(true);
            expect(ModrinthUnfeatureMode.isIntersection(ModrinthUnfeatureMode.INTERSECTION)).toBe(true);
        });

        test("returns false if the mode doesn't represent an intersection mode", () => {
            const modes = [...ModrinthUnfeatureMode.values()]
                .filter(x => x !== ModrinthUnfeatureMode.LOADER_INTERSECTION)
                .filter(x => x !== ModrinthUnfeatureMode.GAME_VERSION_INTERSECTION)
                .filter(x => x !== ModrinthUnfeatureMode.VERSION_TYPE_INTERSECTION)
                .filter(x => x !== ModrinthUnfeatureMode.INTERSECTION);

            for (const mode of modes) {
                expect(ModrinthUnfeatureMode.isIntersection(mode)).toBe(false);
            }
        });
    });

    describe("isAny", () => {
        test("returns true if the mode represents an any mode", () => {
            expect(ModrinthUnfeatureMode.isAny(ModrinthUnfeatureMode.NONE)).toBe(true);
            expect(ModrinthUnfeatureMode.isAny(ModrinthUnfeatureMode.LOADER_ANY)).toBe(true);
            expect(ModrinthUnfeatureMode.isAny(ModrinthUnfeatureMode.GAME_VERSION_ANY)).toBe(true);
            expect(ModrinthUnfeatureMode.isAny(ModrinthUnfeatureMode.VERSION_TYPE_ANY)).toBe(true);
            expect(ModrinthUnfeatureMode.isAny(ModrinthUnfeatureMode.ANY)).toBe(true);
        });

        test("returns false if the mode doesn't represent an any mode", () => {
            const modes = [...ModrinthUnfeatureMode.values()]
                .filter(x => x !== ModrinthUnfeatureMode.NONE)
                .filter(x => x !== ModrinthUnfeatureMode.LOADER_ANY)
                .filter(x => x !== ModrinthUnfeatureMode.GAME_VERSION_ANY)
                .filter(x => x !== ModrinthUnfeatureMode.VERSION_TYPE_ANY)
                .filter(x => x !== ModrinthUnfeatureMode.ANY);

            for (const mode of modes) {
                expect(ModrinthUnfeatureMode.isAny(mode)).toBe(false);
            }
        });
    });

    describe("getGameVersionMode", () => {
        test("returns a game version-related mode", () => {
            expect(ModrinthUnfeatureMode.getGameVersionMode(ModrinthUnfeatureMode.NONE)).toBe(ModrinthUnfeatureMode.GAME_VERSION_ANY);
            expect(ModrinthUnfeatureMode.getGameVersionMode(ModrinthUnfeatureMode.GAME_VERSION_ANY)).toBe(ModrinthUnfeatureMode.GAME_VERSION_ANY);
            expect(ModrinthUnfeatureMode.getGameVersionMode(ModrinthUnfeatureMode.GAME_VERSION_INTERSECTION)).toBe(ModrinthUnfeatureMode.GAME_VERSION_INTERSECTION);
            expect(ModrinthUnfeatureMode.getGameVersionMode(ModrinthUnfeatureMode.GAME_VERSION_SUBSET)).toBe(ModrinthUnfeatureMode.GAME_VERSION_SUBSET);
            expect(ModrinthUnfeatureMode.getGameVersionMode(ModrinthUnfeatureMode.GAME_VERSION_SUBSET | ModrinthUnfeatureMode.LOADER_INTERSECTION)).toBe(ModrinthUnfeatureMode.GAME_VERSION_SUBSET);
            expect(ModrinthUnfeatureMode.getGameVersionMode(ModrinthUnfeatureMode.GAME_VERSION_SUBSET | ModrinthUnfeatureMode.LOADER_INTERSECTION | ModrinthUnfeatureMode.VERSION_TYPE_ANY)).toBe(ModrinthUnfeatureMode.GAME_VERSION_SUBSET);
        });
    });

    describe("getVersionTypeMode", () => {
        test("returns a version type-related mode", () => {
            expect(ModrinthUnfeatureMode.getVersionTypeMode(ModrinthUnfeatureMode.NONE)).toBe(ModrinthUnfeatureMode.VERSION_TYPE_ANY);
            expect(ModrinthUnfeatureMode.getVersionTypeMode(ModrinthUnfeatureMode.VERSION_TYPE_ANY)).toBe(ModrinthUnfeatureMode.VERSION_TYPE_ANY);
            expect(ModrinthUnfeatureMode.getVersionTypeMode(ModrinthUnfeatureMode.VERSION_TYPE_INTERSECTION)).toBe(ModrinthUnfeatureMode.VERSION_TYPE_INTERSECTION);
            expect(ModrinthUnfeatureMode.getVersionTypeMode(ModrinthUnfeatureMode.VERSION_TYPE_SUBSET)).toBe(ModrinthUnfeatureMode.VERSION_TYPE_SUBSET);
            expect(ModrinthUnfeatureMode.getVersionTypeMode(ModrinthUnfeatureMode.VERSION_TYPE_SUBSET | ModrinthUnfeatureMode.LOADER_INTERSECTION)).toBe(ModrinthUnfeatureMode.VERSION_TYPE_SUBSET);
            expect(ModrinthUnfeatureMode.getVersionTypeMode(ModrinthUnfeatureMode.VERSION_TYPE_SUBSET | ModrinthUnfeatureMode.LOADER_INTERSECTION | ModrinthUnfeatureMode.GAME_VERSION_ANY)).toBe(ModrinthUnfeatureMode.VERSION_TYPE_SUBSET);
        });
    });

    describe("getLoaderMode", () => {
        test("returns a loader-related mode", () => {
            expect(ModrinthUnfeatureMode.getLoaderMode(ModrinthUnfeatureMode.NONE)).toBe(ModrinthUnfeatureMode.LOADER_ANY);
            expect(ModrinthUnfeatureMode.getLoaderMode(ModrinthUnfeatureMode.LOADER_ANY)).toBe(ModrinthUnfeatureMode.LOADER_ANY);
            expect(ModrinthUnfeatureMode.getLoaderMode(ModrinthUnfeatureMode.LOADER_INTERSECTION)).toBe(ModrinthUnfeatureMode.LOADER_INTERSECTION);
            expect(ModrinthUnfeatureMode.getLoaderMode(ModrinthUnfeatureMode.LOADER_SUBSET)).toBe(ModrinthUnfeatureMode.LOADER_SUBSET);
            expect(ModrinthUnfeatureMode.getLoaderMode(ModrinthUnfeatureMode.LOADER_SUBSET | ModrinthUnfeatureMode.GAME_VERSION_INTERSECTION)).toBe(ModrinthUnfeatureMode.LOADER_SUBSET);
            expect(ModrinthUnfeatureMode.getLoaderMode(ModrinthUnfeatureMode.LOADER_SUBSET | ModrinthUnfeatureMode.GAME_VERSION_INTERSECTION | ModrinthUnfeatureMode.VERSION_TYPE_ANY)).toBe(ModrinthUnfeatureMode.LOADER_SUBSET);
        });
    });

    describe("shouldUnfeature", () => {
        test("returns false if the previous version equals to the current one", () => {
            const previous = { id: "A" } as UnfeaturableModrinthVersion;
            const current = { id: "A" } as UnfeaturableModrinthVersion;
            const mode = ModrinthUnfeatureMode.ANY;

            expect(ModrinthUnfeatureMode.shouldUnfeature(previous, current, mode)).toBe(false);
        });

        test("always returns true (ANY)", () => {
            const previous = { id: "A", loaders: ["fabric"], game_versions: ["1.18.1"] } as UnfeaturableModrinthVersion;
            const current = { id: "B", loaders: ["neoforge", "quilt"], game_versions: ["1.18", "1.18.2"] } as UnfeaturableModrinthVersion;
            const mode = ModrinthUnfeatureMode.ANY;

            expect(ModrinthUnfeatureMode.shouldUnfeature(previous, current, mode)).toBe(true);
        });

        test("returns true if the previous version is a subset of the current one (SUBSET)", () => {
            const previous = { id: "A", loaders: ["fabric"], game_versions: ["1.18.1"] } as UnfeaturableModrinthVersion;
            const current = { id: "B", loaders: ["neoforge", "fabric", "quilt"], game_versions: ["1.18", "1.18.1", "1.18.2"] } as UnfeaturableModrinthVersion;
            const mode = ModrinthUnfeatureMode.SUBSET;

            expect(ModrinthUnfeatureMode.shouldUnfeature(previous, current, mode)).toBe(true);
        });

        test("returns false if the previous version is not a subset of the current one (SUBSET)", () => {
            const previous = { id: "A", loaders: ["fabric"], game_versions: ["1.18.1"] } as UnfeaturableModrinthVersion;
            const current = { id: "B", loaders: ["neoforge", "quilt"], game_versions: ["1.18", "1.18.1", "1.18.2"] } as UnfeaturableModrinthVersion;
            const mode = ModrinthUnfeatureMode.SUBSET;

            expect(ModrinthUnfeatureMode.shouldUnfeature(previous, current, mode)).toBe(false);
        });

        test("returns true if the previous version intersects with the current one (INTERSECTION)", () => {
            const previous = { id: "A", loaders: ["neoforge", "fabric", "quilt"], game_versions: ["1.18.1"] } as UnfeaturableModrinthVersion;
            const current = { id: "B", loaders: ["fabric"], game_versions: ["1.18", "1.18.1", "1.18.2"] } as UnfeaturableModrinthVersion;
            const mode = ModrinthUnfeatureMode.INTERSECTION;

            expect(ModrinthUnfeatureMode.shouldUnfeature(previous, current, mode)).toBe(true);
        });

        test("returns false if the previous version doesn't intersect with the current one (INTERSECTION)", () => {
            const previous = { id: "A", loaders: ["fabric"], game_versions: ["1.18.1"] } as UnfeaturableModrinthVersion;
            const current = { id: "B", loaders: ["neoforge", "quilt"], game_versions: ["1.18", "1.18.2"] } as UnfeaturableModrinthVersion;
            const mode = ModrinthUnfeatureMode.INTERSECTION;

            expect(ModrinthUnfeatureMode.shouldUnfeature(previous, current, mode)).toBe(false);
        });
    });
});
