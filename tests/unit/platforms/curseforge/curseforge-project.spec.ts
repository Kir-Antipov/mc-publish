import { isCurseForgeProjectId } from "@/platforms/curseforge/curseforge-project";

describe("isCurseForgeProjectId", () => {
    test("returns true when input is a number", () => {
        expect(isCurseForgeProjectId(123456)).toBe(true);
    });

    test("returns true when input is a string containing an integer", () => {
        expect(isCurseForgeProjectId("123456")).toBe(true);
    });

    test("returns false when input is a string containing non-integer characters", () => {
        expect(isCurseForgeProjectId("123abc")).toBe(false);
    });

    test("returns false when input is a string containing floating point number", () => {
        expect(isCurseForgeProjectId("123.456")).toBe(false);
    });

    test("returns false when input is an empty string", () => {
        expect(isCurseForgeProjectId("")).toBe(false);
    });

    test("returns false when input is null", () => {
        expect(isCurseForgeProjectId(null)).toBe(false);
    });

    test("returns false when input is undefined", () => {
        expect(isCurseForgeProjectId(undefined)).toBe(false);
    });
});
