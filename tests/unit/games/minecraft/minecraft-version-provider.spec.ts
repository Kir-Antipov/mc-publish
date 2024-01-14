import { MINECRAFT_VERSION_PROVIDER } from "@/games/minecraft/minecraft-version-provider";

describe("MINECRAFT_VERSION_PROVIDER", () => {
    test("is callable", () => {
        expect(typeof MINECRAFT_VERSION_PROVIDER).toBe("function");
    });
});
