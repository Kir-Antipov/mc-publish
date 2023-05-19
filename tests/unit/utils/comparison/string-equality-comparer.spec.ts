import {
    ORDINAL_EQUALITY_COMPARER,
    IGNORE_CASE_EQUALITY_COMPARER,
    IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER,
    IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER,
} from "@/utils/comparison/string-equality-comparer";

describe("ORDINAL_EQUALITY_COMPARER", () => {
    test("returns true for identical strings", () => {
        expect(ORDINAL_EQUALITY_COMPARER("Test", "Test")).toBe(true);
    });

    test("returns false for different strings", () => {
        expect(ORDINAL_EQUALITY_COMPARER("Test", "Other")).toBe(false);
    });

    test("returns false for strings differing only by case", () => {
        expect(ORDINAL_EQUALITY_COMPARER("Test", "test")).toBe(false);
    });

    test("returns false when one string is null or undefined", () => {
        expect(ORDINAL_EQUALITY_COMPARER(null, "Test")).toBe(false);
        expect(ORDINAL_EQUALITY_COMPARER("Test", undefined)).toBe(false);
        expect(ORDINAL_EQUALITY_COMPARER(null, undefined)).toBe(false);
    });

    test("returns true when both strings are null, or both strings are undefined", () => {
        expect(ORDINAL_EQUALITY_COMPARER(null, null)).toBe(true);
        expect(ORDINAL_EQUALITY_COMPARER(undefined, undefined)).toBe(true);
    });
});

describe("IGNORE_CASE_EQUALITY_COMPARER", () => {
    test("returns true for identical strings", () => {
        expect(IGNORE_CASE_EQUALITY_COMPARER("Test", "Test")).toBe(true);
    });

    test("returns false for different strings", () => {
        expect(IGNORE_CASE_EQUALITY_COMPARER("Test", "Other")).toBe(false);
    });

    test("returns true for strings differing only by case", () => {
        expect(IGNORE_CASE_EQUALITY_COMPARER("Test", "test")).toBe(true);
    });

    test("returns false when one string is null or undefined", () => {
        expect(IGNORE_CASE_EQUALITY_COMPARER(null, "Test")).toBe(false);
        expect(IGNORE_CASE_EQUALITY_COMPARER("Test", undefined)).toBe(false);
        expect(IGNORE_CASE_EQUALITY_COMPARER(null, undefined)).toBe(false);
    });

    test("returns true when both strings are null, or both strings are undefined", () => {
        expect(IGNORE_CASE_EQUALITY_COMPARER(null, null)).toBe(true);
        expect(IGNORE_CASE_EQUALITY_COMPARER(undefined, undefined)).toBe(true);
    });
});

describe("IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER", () => {
    test("returns true for identical strings", () => {
        expect(IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER("Test", "Test")).toBe(true);
    });

    test("returns false for different strings", () => {
        expect(IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER("Test", "Other")).toBe(false);
    });

    test("returns false for strings differing only by case", () => {
        expect(IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER("Test", "test")).toBe(false);
    });

    test("returns true for strings differing only be non-word characters", () => {
        expect(IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER("Test", "T.e_s-t")).toBe(true);
    });

    test("returns false when one string is null or undefined", () => {
        expect(IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER(null, "Test")).toBe(false);
        expect(IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER("Test", undefined)).toBe(false);
        expect(IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER(null, undefined)).toBe(false);
    });

    test("returns true when both strings are null, or both strings undefined", () => {
        expect(IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER(null, null)).toBe(true);
        expect(IGNORE_NON_WORD_CHARACTERS_EQUALITY_COMPARER(undefined, undefined)).toBe(true);
    });
});

describe("IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER", () => {
    test("returns true for identical strings", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER("Test", "Test")).toBe(true);
    });

    test("returns false for different strings", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER("Test", "Other")).toBe(false);
    });

    test("returns true for strings differing only by case", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER("Test", "test")).toBe(true);
    });

    test("returns true for strings differing only by non-word characters and cases", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER("Test", "t.e_s-t")).toBe(true);
    });

    test("returns false when one string is null or undefined", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER(null, "Test")).toBe(false);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER("Test", undefined)).toBe(false);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER(null, undefined)).toBe(false);
    });

    test("returns true when both strings are null, or both strings are undefined", () => {
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER(null, null)).toBe(true);
        expect(IGNORE_CASE_AND_NON_WORD_CHARACTERS_EQUALITY_COMPARER(undefined, undefined)).toBe(true);
    });
});
