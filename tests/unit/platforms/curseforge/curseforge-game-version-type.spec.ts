import { BUKKIT_GAME_VERSION_TYPE } from "@/platforms/curseforge/curseforge-game-version-type";

describe("BUKKIT_GAME_VERSION_TYPE", () => {
    test("is a valid version type that represents Bukkit", () => {
        expect(BUKKIT_GAME_VERSION_TYPE).toEqual({
            id: 1,
            name: "Bukkit",
            slug: "bukkit",
        });
    });
});
