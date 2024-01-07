import { getInvalidProjectSlug, isCurseForgeError, isInvalidGameVersionIdCurseForgeError, isInvalidProjectSlugCurseForgeError } from "@/platforms/curseforge/curseforge-error";

describe("isCurseForgeError", () => {
    test("returns true for valid CurseForgeError", () => {
        const error = {
            errorCode: 1018,
            errorMessage: "Invalid slug in project relations: 'test'",
        };

        expect(isCurseForgeError(error)).toBe(true);
    });

    test("returns false for object without errorCode", () => {
        const error = {
            errorMessage: "Invalid slug in project relations: 'test'",
        };

        expect(isCurseForgeError(error)).toBe(false);
    });

    test("returns false for object without errorMessage", () => {
        const error = {
            errorCode: 1018,
        };

        expect(isCurseForgeError(error)).toBe(false);
    });

    test("returns false for object with incorrectly typed properties", () => {
        const error = {
            errorCode: "1018",
            errorMessage: 12345,
        };

        expect(isCurseForgeError(error)).toBe(false);
    });

    test("returns false for null", () => {
        expect(isCurseForgeError(null)).toBe(false);
    });

    test("returns false for undefined", () => {
        expect(isCurseForgeError(undefined)).toBe(false);
    });
});

describe("isInvalidProjectSlugCurseForgeError", () => {
    test("returns true for a CurseForgeError that represents the 'Invalid slug' error", () => {
        const error = {
            errorCode: 1018,
            errorMessage: "Invalid slug in project relations: 'test'",
        };

        expect(isInvalidProjectSlugCurseForgeError(error)).toBe(true);
    });

    test("returns false for object without errorCode", () => {
        const error = {
            errorMessage: "Invalid slug in project relations: 'test'",
        };

        expect(isInvalidProjectSlugCurseForgeError(error)).toBe(false);
    });

    test("returns false for object without errorMessage", () => {
        const error = {
            errorCode: 1018,
        };

        expect(isInvalidProjectSlugCurseForgeError(error)).toBe(false);
    });

    test("returns false for object with incorrectly typed properties", () => {
        const error = {
            errorCode: "1018",
            errorMessage: 12345,
        };

        expect(isInvalidProjectSlugCurseForgeError(error)).toBe(false);
    });

    test("returns false for null", () => {
        expect(isInvalidProjectSlugCurseForgeError(null)).toBe(false);
    });

    test("returns false for undefined", () => {
        expect(isInvalidProjectSlugCurseForgeError(undefined)).toBe(false);
    });
});

describe("getInvalidProjectSlug", () => {
    test("returns the slug for a CurseForgeError that represents the 'Invalid slug' error", () => {
        const error = {
            errorCode: 1018,
            errorMessage: "Invalid slug in project relations: 'test slug'",
        };

        expect(getInvalidProjectSlug(error)).toBe("test slug");
    });

    test("returns undefined for a valid CurseForgeError with different errorCode", () => {
        const error = {
            errorCode: 1009,
            errorMessage: "Invalid game version id",
        };

        expect(getInvalidProjectSlug(error)).toBeUndefined();
    });

    test("returns undefined for object without errorCode", () => {
        const error = {
            errorMessage: "Invalid game version id",
        };

        expect(getInvalidProjectSlug(error)).toBeUndefined();
    });

    test("returns undefined for object without errorMessage", () => {
        const error = {
            errorCode: 1018,
        };

        expect(getInvalidProjectSlug(error)).toBeUndefined();
    });

    test("returns undefined for object with incorrectly typed properties", () => {
        const error = {
            errorCode: "1018",
            errorMessage: 12345,
        };

        expect(getInvalidProjectSlug(error)).toBeUndefined();
    });

    test("returns undefined for null", () => {
        expect(getInvalidProjectSlug(null)).toBeUndefined();
    });

    test("returns undefined for undefined", () => {
        expect(getInvalidProjectSlug(undefined)).toBeUndefined();
    });
});

describe("isInvalidGameVersionIdCurseForgeError", () => {
    test("returns true for a CurseForgeError that represents the 'Invalid game version ID' error", () => {
        const error = {
            errorCode: 1009,
            errorMessage: "Invalid game version id",
        };

        expect(isInvalidGameVersionIdCurseForgeError(error)).toBe(true);
    });

    test("returns false for a valid CurseForgeError with different errorCode", () => {
        const error = {
            errorCode: 1018,
            errorMessage: "Invalid slug in project relations: 'test'",
        };

        expect(isInvalidGameVersionIdCurseForgeError(error)).toBe(false);
    });

    test("returns false for object without errorCode", () => {
        const error = {
            errorMessage: "Invalid game version id",
        };

        expect(isInvalidGameVersionIdCurseForgeError(error)).toBe(false);
    });

    test("returns false for object without errorMessage", () => {
        const error = {
            errorCode: 1009,
        };

        expect(isInvalidGameVersionIdCurseForgeError(error)).toBe(false);
    });

    test("returns false for object with incorrectly typed properties", () => {
        const error = {
            errorCode: "1009",
            errorMessage: 12345,
        };

        expect(isInvalidGameVersionIdCurseForgeError(error)).toBe(false);
    });

    test("returns false for null", () => {
        expect(isInvalidGameVersionIdCurseForgeError(null)).toBe(false);
    });

    test("returns false for undefined", () => {
        expect(isInvalidGameVersionIdCurseForgeError(undefined)).toBe(false);
    });
});
