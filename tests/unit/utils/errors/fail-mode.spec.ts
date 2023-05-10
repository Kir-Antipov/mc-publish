import { FailMode } from "@/utils/errors/fail-mode";

describe("FailMode", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of FailMode.values()) {
                expect(FailMode.parse(FailMode.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of FailMode.values()) {
                expect(FailMode.parse(FailMode.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of FailMode.values()) {
                expect(FailMode.parse(FailMode.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of FailMode.values()) {
                expect(FailMode.parse(FailMode.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
