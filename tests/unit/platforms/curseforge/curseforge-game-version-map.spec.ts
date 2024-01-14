import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { BUKKIT_GAME_VERSION_TYPE } from "@/platforms/curseforge/curseforge-game-version-type";
import { createCurseForgeGameVersionMap } from "@/platforms/curseforge/curseforge-game-version-map";

describe("createCurseForgeGameVersionMap", () => {
    test("organizes the provided versions into their respective buckets", async () => {
        const [versionsSource, versionTypesSource] = await Promise.all([
            readFile(resolve(__dirname, "../../../content/curseforge/versions.json"), "utf8"),
            readFile(resolve(__dirname, "../../../content/curseforge/version-types.json"), "utf8"),
        ]);
        const versions = JSON.parse(versionsSource);
        const versionTypes = [...JSON.parse(versionTypesSource), BUKKIT_GAME_VERSION_TYPE];

        const map = createCurseForgeGameVersionMap(versions, versionTypes);

        expect(map.environments.map(x => x.slug)).toContain("client");
        expect(map.game_versions.map(x => x.slug)).toContain("1-16-5");
        expect(map.game_versions_for_addons.map(x => x.slug)).toContain("1-19");
        expect(map.game_versions_for_plugins.map(x => x.slug)).toContain("1-18");
        expect(map.java_versions.map(x => x.slug)).toContain("java-17");
        expect(map.loaders.map(x => x.slug)).toContain("fabric");
    });
});
