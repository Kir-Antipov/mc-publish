import { SoftError, isSoftError } from "@/utils/errors/soft-error";

describe("SoftError", () => {
    describe("constructor", () => {
        test("initializes with isSoft set to false", () => {
            const error = new SoftError(false, "An error occurred.");

            expect(error).toBeInstanceOf(SoftError);
            expect(error.name).toBe("SoftError");
            expect(error.message).toBe("An error occurred.");
            expect(error.isSoft).toBe(false);
        });

        test("initializes with isSoft set to true", () => {
            const error = new SoftError(true, "An error occurred.");

            expect(error).toBeInstanceOf(SoftError);
            expect(error.name).toBe("SoftError");
            expect(error.message).toBe("An error occurred.");
            expect(error.isSoft).toBe(true);
        });
    });
});

describe("isSoftError", () => {
    test("returns true for SoftError with isSoft set to true", () => {
        const error = new SoftError(true, "An error occurred.");

        expect(isSoftError(error)).toBe(true);
    });

    test("returns false for SoftError with isSoft set to false", () => {
        const error = new SoftError(false, "An error occurred.");

        expect(isSoftError(error)).toBe(false);
    });

    test("returns false for non-SoftError errors", () => {
        const error = new Error("An error occurred.");

        expect(isSoftError(error)).toBe(false);
    });

    test("returns false for non-error values", () => {
        expect(isSoftError("string")).toBe(false);
        expect(isSoftError(123)).toBe(false);
        expect(isSoftError({ key: "value" })).toBe(false);
    });
});
