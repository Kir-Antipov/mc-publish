import { LoaderType } from "@/loaders/loader-type";

describe("LoaderType", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of LoaderType.values()) {
                expect(LoaderType.parse(LoaderType.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of LoaderType.values()) {
                expect(LoaderType.parse(LoaderType.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of LoaderType.values()) {
                expect(LoaderType.parse(LoaderType.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of LoaderType.values()) {
                expect(LoaderType.parse(LoaderType.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
