import { VersionType } from "@/utils/versioning/version-type";
import { MinecraftVersionType } from "@/games/minecraft/minecraft-version-type";

describe("MinecraftVersionType", () => {
    describe("MinecraftVersionType.toVersionType", () => {
        test("returns `VersionType.BETA` for release candidates and pre-releases", () => {
            expect(MinecraftVersionType.toVersionType(MinecraftVersionType.SNAPSHOT, "1.17-pre3")).toBe(VersionType.BETA);
            expect(MinecraftVersionType.toVersionType(MinecraftVersionType.SNAPSHOT, "1.16.5-rc1")).toBe(VersionType.BETA);
            expect(MinecraftVersionType.toVersionType(MinecraftVersionType.SNAPSHOT, "1.14.1 Pre-Release 1")).toBe(VersionType.BETA);
        });

        test("returns `VersionType.ALPHA` for weekly-ish snapshots", () => {
            expect(MinecraftVersionType.toVersionType(MinecraftVersionType.SNAPSHOT, "14w34d")).toBe(VersionType.ALPHA);
            expect(MinecraftVersionType.toVersionType(MinecraftVersionType.SNAPSHOT, "16w32b")).toBe(VersionType.ALPHA);
            expect(MinecraftVersionType.toVersionType(MinecraftVersionType.SNAPSHOT, "20w14infinite")).toBe(VersionType.ALPHA);
            expect(MinecraftVersionType.toVersionType(MinecraftVersionType.SNAPSHOT)).toBe(VersionType.ALPHA);
        });

        test("returns `VersionType.BETA` for `MinecraftVersionType.OLD_BETA`", () => {
            expect(MinecraftVersionType.toVersionType(MinecraftVersionType.OLD_BETA)).toBe(VersionType.BETA);
        });

        test("returns `VersionType.ALPHA` for `MinecraftVersionType.OLD_ALPHA`", () => {
            expect(MinecraftVersionType.toVersionType(MinecraftVersionType.OLD_ALPHA)).toBe(VersionType.ALPHA);
        });

        test("returns `VersionType.RELEASE` for `MinecraftVersionType.RELEASE`", () => {
            expect(MinecraftVersionType.toVersionType(MinecraftVersionType.RELEASE)).toBe(VersionType.RELEASE);
        });
    });

    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of MinecraftVersionType.values()) {
                expect(MinecraftVersionType.parse(MinecraftVersionType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of MinecraftVersionType.values()) {
                expect(MinecraftVersionType.parse(MinecraftVersionType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of MinecraftVersionType.values()) {
                expect(MinecraftVersionType.parse(MinecraftVersionType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of MinecraftVersionType.values()) {
                expect(MinecraftVersionType.parse(MinecraftVersionType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
