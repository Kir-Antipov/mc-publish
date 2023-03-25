import { parseVersion } from "@/utils/versioning/version";
import { GameVersion } from "@/games/game-version";
import { GameVersionFilter } from "@/games/game-version-filter";

describe("GameVersionFilter", () => {
    describe("filter", () => {
        let GAME_VERSIONS = undefined as GameVersion[];

        beforeEach(() => {
            GAME_VERSIONS = [
                { id: "1.0.0-alpha.1", version: parseVersion("1.0.0-alpha.1"), isRelease: false, isSnapshot: true, isAlpha: true, isBeta: false },
                { id: "1.0.0", version: parseVersion("1.0.0"), isRelease: true, isSnapshot: false, isAlpha: false, isBeta: false },
                { id: "1.1.0-beta.2", version: parseVersion("1.1.0-beta.2"), isRelease: false, isSnapshot: true, isAlpha: false, isBeta: true },
                { id: "1.1.0", version: parseVersion("1.1.0"), isRelease: true, isSnapshot: false, isAlpha: false, isBeta: false },
                { id: "1.2.0-beta.2", version: parseVersion("1.2.0-beta.2"), isRelease: false, isSnapshot: true, isAlpha: false, isBeta: true },
                { id: "1.2.0", version: parseVersion("1.2.0"), isRelease: true, isSnapshot: false, isAlpha: false, isBeta: false },
                { id: "1.2.1", version: parseVersion("1.2.1"), isRelease: true, isSnapshot: false, isAlpha: false, isBeta: false },
                { id: "1.2.2", version: parseVersion("1.2.2"), isRelease: true, isSnapshot: false, isAlpha: false, isBeta: false },
                { id: "1.2.3", version: parseVersion("1.2.3"), isRelease: true, isSnapshot: false, isAlpha: false, isBeta: false },
                { id: "2.0.0", version: parseVersion("2.0.0"), isRelease: true, isSnapshot: false, isAlpha: false, isBeta: false },
            ];
        });

        describe("NONE", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.NONE)).not.toBe(GAME_VERSIONS);
            });

            test("an unfiltered array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.NONE)).toEqual(GAME_VERSIONS);
            });
        });

        describe("RELEASES", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.RELEASES)).not.toBe(GAME_VERSIONS);
            });

            test("only releases are returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.RELEASES);

                expect(versions).toHaveLength(7);
                expect(versions.every(x => x.isRelease)).toBe(true);
            });
        });

        describe("ALPHAS", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.ALPHAS)).not.toBe(GAME_VERSIONS);
            });

            test("only alphas are returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.ALPHAS);

                expect(versions).toHaveLength(1);
                expect(versions.every(x => x.isAlpha)).toBe(true);
            });
        });

        describe("BETAS", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.BETAS)).not.toBe(GAME_VERSIONS);
            });

            test("only betas are returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.BETAS);

                expect(versions).toHaveLength(2);
                expect(versions.every(x => x.isBeta)).toBe(true);
            });
        });

        describe("SNAPSHOTS", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.SNAPSHOTS)).not.toBe(GAME_VERSIONS);
            });

            test("only snapshots are returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.SNAPSHOTS);

                expect(versions).toHaveLength(3);
                expect(versions.every(x => x.isSnapshot)).toBe(true);
            });
        });

        describe("MIN_PATCH", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MIN_PATCH)).not.toBe(GAME_VERSIONS);
            });

            test("only versions with the lowest patch value are returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MIN_PATCH);

                expect(versions).toHaveLength(7);
                expect(versions.every(x => x.version.patch === 0)).toBe(true);
            });
        });

        describe("MAX_PATCH", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MAX_PATCH)).not.toBe(GAME_VERSIONS);
            });

            test("only versions with the highest patch value are returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MAX_PATCH);

                expect(versions).toHaveLength(1);
                expect(versions.every(x => x.version.patch === 3)).toBe(true);
            });
        });

        describe("MIN_MINOR", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MIN_MINOR)).not.toBe(GAME_VERSIONS);
            });

            test("only versions with the lowest minor value are returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MIN_MINOR);

                expect(versions).toHaveLength(3);
                expect(versions.every(x => x.version.minor === 0)).toBe(true);
            });
        });

        describe("MAX_MINOR", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MAX_MINOR)).not.toBe(GAME_VERSIONS);
            });

            test("only versions with the highest minor value are returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MAX_MINOR);

                expect(versions).toHaveLength(5);
                expect(versions.every(x => x.version.minor === 2)).toBe(true);
            });
        });

        describe("MIN_MAJOR", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MIN_MAJOR)).not.toBe(GAME_VERSIONS);
            });

            test("only versions with the lowest major value are returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MIN_MAJOR);

                expect(versions).toHaveLength(9);
                expect(versions.every(x => x.version.major === 1)).toBe(true);
            });
        });

        describe("MAX_MAJOR", () => {
            test("a different array is returned", () => {
                expect(GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MAX_MAJOR)).not.toBe(GAME_VERSIONS);
            });

            test("only versions with the highest major value are returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.MAX_MAJOR);

                expect(versions).toHaveLength(1);
                expect(versions.every(x => x.version.major === 2)).toBe(true);
            });
        });

        describe("RELEASES | MIN", () => {
            test("the oldest version is returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.RELEASES | GameVersionFilter.MIN);

                expect(versions).toHaveLength(1);
                expect(versions[0]).toMatchObject({ id: "1.0.0" });
            });
        });

        describe("RELEASES | MAX", () => {
            test("the latest version is returned", () => {
                const versions = GameVersionFilter.filter(GAME_VERSIONS, GameVersionFilter.RELEASES | GameVersionFilter.MAX);

                expect(versions).toHaveLength(1);
                expect(versions[0]).toMatchObject({ id: "2.0.0" });
            });
        });
    });

    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of GameVersionFilter.values()) {
                expect(GameVersionFilter.parse(GameVersionFilter.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of GameVersionFilter.values()) {
                expect(GameVersionFilter.parse(GameVersionFilter.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of GameVersionFilter.values()) {
                expect(GameVersionFilter.parse(GameVersionFilter.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of GameVersionFilter.values()) {
                expect(GameVersionFilter.parse(GameVersionFilter.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
