import { PlatformType } from "@/platforms/platform-type";

describe("PlatformType", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of PlatformType.values()) {
                expect(PlatformType.parse(PlatformType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of PlatformType.values()) {
                expect(PlatformType.parse(PlatformType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of PlatformType.values()) {
                expect(PlatformType.parse(PlatformType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of PlatformType.values()) {
                expect(PlatformType.parse(PlatformType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
