import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseVersion } from "@/utils/versioning/version";
import { VersionType } from "@/utils/versioning/version-type";
import { MinecraftVersionType } from "@/games/minecraft/minecraft-version-type";
import { MinecraftVersion, MinecraftVersionManifest, getMinecraftVersionManifestEntries } from "@/games/minecraft/minecraft-version";

describe("MinecraftVersion", () => {
    describe("constructors", () => {
        test("constructs a new MinecraftVersion instance", () => {
            const id = "1.17";
            const version = parseVersion(id);
            const type = MinecraftVersionType.RELEASE;
            const url = "https://piston-meta.mojang.com/v1/packages/0d9ace8a2ecfd1f4c782786f4b985a499240ff12/1.17.json";
            const date = new Date("2021-06-08T11:00:40+00:00");
            const minecraftVersion = new MinecraftVersion(id, version, type, url, date);

            expect(minecraftVersion.id).toBe(id);
            expect(minecraftVersion.version).toBe(version);
            expect(minecraftVersion.type).toBe(VersionType.RELEASE);
            expect(minecraftVersion.url).toBe(url);
            expect(minecraftVersion.releaseDate).toBe(date);
            expect(minecraftVersion.isAlpha).toBe(false);
            expect(minecraftVersion.isBeta).toBe(false);
            expect(minecraftVersion.isSnapshot).toBe(false);
            expect(minecraftVersion.isRelease).toBe(true);
            expect(minecraftVersion.isOldAlpha).toBe(false);
            expect(minecraftVersion.isOldBeta).toBe(false);
        });
    });

    describe("isRelease", () => {
        test("returns true for releases", () => {
            const minecraftVersion = new MinecraftVersion("1.17", parseVersion("1.17"), MinecraftVersionType.RELEASE, "", new Date());
            expect(minecraftVersion.isRelease).toBe(true);
        });

        test("returns false for snapshots", () => {
            const minecraftVersion = new MinecraftVersion("1.17-rc1", parseVersion("1.17-rc.1"), MinecraftVersionType.SNAPSHOT, "", new Date());
            expect(minecraftVersion.isRelease).toBe(false);
        });
    });

    describe("isSnapshot", () => {
        test("returns true for snapshots", () => {
            const minecraftVersion = new MinecraftVersion("1.17-rc1", parseVersion("1.17-rc.1"), MinecraftVersionType.SNAPSHOT, "", new Date());
            expect(minecraftVersion.isSnapshot).toBe(true);
        });

        test("returns false for releases", () => {
            const minecraftVersion = new MinecraftVersion("1.17", parseVersion("1.17"), MinecraftVersionType.RELEASE, "", new Date());
            expect(minecraftVersion.isSnapshot).toBe(false);
        });
    });

    describe("isOldAlpha", () => {
        test("returns true for old alpha versions", () => {
            const minecraftVersion = new MinecraftVersion("a1.0.4", parseVersion("1.0.0-alpha.0.4"), MinecraftVersionType.OLD_ALPHA, "", new Date());
            expect(minecraftVersion.isOldAlpha).toBe(true);
        });

        test("returns false for modern versions", () => {
            const minecraftVersion = new MinecraftVersion("1.17", parseVersion("1.17"), MinecraftVersionType.RELEASE, "", new Date());
            expect(minecraftVersion.isOldAlpha).toBe(false);
        });
    });

    describe("isOldBeta", () => {
        test("returns true for old beta versions", () => {
            const minecraftVersion = new MinecraftVersion("b1.5_01", parseVersion("1.0.0-beta.5.1"), MinecraftVersionType.OLD_BETA, "", new Date());
            expect(minecraftVersion.isOldBeta).toBe(true);
        });

        test("returns false for modern versions", () => {
            const minecraftVersion = new MinecraftVersion("1.17", parseVersion("1.17"), MinecraftVersionType.RELEASE, "", new Date());
            expect(minecraftVersion.isOldBeta).toBe(false);
        });
    });

    describe("toString", () => {
        test("returns the version identifier", () => {
            const minecraftVersion = new MinecraftVersion("1.17-rc1", parseVersion("1.17-rc.1"), MinecraftVersionType.SNAPSHOT, "", new Date());
            expect(minecraftVersion.toString()).toBe("1.17-rc1");
        });
    });
});

describe("getMinecraftVersionManifestEntries", () => {
    const manifest : MinecraftVersionManifest = JSON.parse(
        readFileSync(resolve(__dirname, "../../../content/mojang/version_manifest_v2.json"), "utf8")
    );

    test("returns correct number of entries", () => {
        const entries = getMinecraftVersionManifestEntries(manifest);

        expect(entries.length).toBe(manifest.versions.length);
    });

    test("entries have correct releaseDate property", () => {
        const entries = getMinecraftVersionManifestEntries(manifest);

        for (const entry of entries) {
            expect(entry.releaseDate).toEqual(new Date(entry.releaseTime));
        }
    });

    test("entries are sorted by releaseDate in descending order", () => {
        const entries = getMinecraftVersionManifestEntries(manifest);

        for (let i = 0; i < entries.length - 1; i++) {
            expect(entries[i].releaseDate.valueOf()).toBeGreaterThanOrEqual(entries[i + 1].releaseDate.valueOf());
        }
    });
});
