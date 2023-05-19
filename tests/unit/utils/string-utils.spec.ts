import {
    asString,
    isLetter,
    IS_LETTER_REGEX,
    isDigit,
    IS_DIGIT_REGEX,
    isLetterOrDigit,
    IS_LETTER_OR_DIGIT_REGEX,
    isUpperCase,
    IS_UPPER_CASE_REGEX,
    isLowerCase,
    IS_LOWER_CASE_REGEX,
    isNumberString,
    isIntegerString,
    stringCompare,
    stringEquals,
    capitalize,
    uncapitalize,
    toPascalCase,
    split,
    splitLines,
    pad,
    generateSecureRandomString,
    hashString,
} from "@/utils/string-utils";
import { createHash } from "node:crypto";

describe("asString", () => {
    test("returns string as is", () => {
        expect(asString("test")).toBe("test");
    });

    test("converts non-string value to string", () => {
        expect(asString(123)).toBe("123");
    });

    test("converts undefined value to string", () => {
        expect(asString(undefined)).toBe("undefined");
    });

    test("converts null value to string", () => {
        expect(asString(null)).toBe("null");
    });
});

describe("isLetter", () => {
    test("returns true for a single letter", () => {
        expect(isLetter("a")).toBe(true);
    });

    test("returns false for a string of multiple letters", () => {
        expect(isLetter("abc")).toBe(false);
    });

    test("returns false for a digit", () => {
        expect(isLetter("1")).toBe(false);
    });

    test("returns false for an empty string", () => {
        expect(isLetter("")).toBe(false);
    });
});

describe("IS_LETTER_REGEX", () => {
    test("matches a single letter", () => {
        expect(IS_LETTER_REGEX.test("a")).toBe(true);
    });

    test("does not match a string of multiple letters", () => {
        expect(IS_LETTER_REGEX.test("abc")).toBe(false);
    });

    test("does not match a digit", () => {
        expect(IS_LETTER_REGEX.test("1")).toBe(false);
    });

    test("does not match an empty string", () => {
        expect(IS_LETTER_REGEX.test("")).toBe(false);
    });
});

describe("isDigit", () => {
    test("returns true for a single digit", () => {
        expect(isDigit("1")).toBe(true);
    });

    test("returns false for a string of multiple digits", () => {
        expect(isDigit("123")).toBe(false);
    });

    test("returns false for a letter", () => {
        expect(isDigit("a")).toBe(false);
    });

    test("returns false for an empty string", () => {
        expect(isDigit("")).toBe(false);
    });
});

describe("IS_DIGIT_REGEX", () => {
    test("matches a single digit", () => {
        expect(IS_DIGIT_REGEX.test("1")).toBe(true);
    });

    test("does not match a string of multiple digits", () => {
        expect(IS_DIGIT_REGEX.test("123")).toBe(false);
    });

    test("does not match a letter", () => {
        expect(IS_DIGIT_REGEX.test("a")).toBe(false);
    });

    test("does not match an empty string", () => {
        expect(IS_DIGIT_REGEX.test("")).toBe(false);
    });
});

describe("isLetterOrDigit", () => {
    test("returns true for a single letter", () => {
        expect(isLetterOrDigit("a")).toBe(true);
    });

    test("returns true for a single digit", () => {
        expect(isLetterOrDigit("1")).toBe(true);
    });

    test("returns false for a string of multiple letters or digits", () => {
        expect(isLetterOrDigit("123")).toBe(false);
        expect(isLetterOrDigit("abc")).toBe(false);
    });

    test("returns false for a non-letter and non-digit character", () => {
        expect(isLetterOrDigit("@")).toBe(false);
    });

    test("returns false for an empty string", () => {
        expect(isLetterOrDigit("")).toBe(false);
    });
});

describe("IS_LETTER_OR_DIGIT_REGEX", () => {
    test("matches a single letter", () => {
        expect(IS_LETTER_OR_DIGIT_REGEX.test("a")).toBe(true);
    });

    test("matches a single digit", () => {
        expect(IS_LETTER_OR_DIGIT_REGEX.test("1")).toBe(true);
    });

    test("does not match a string of multiple letters or digits", () => {
        expect(IS_LETTER_OR_DIGIT_REGEX.test("123")).toBe(false);
        expect(IS_LETTER_OR_DIGIT_REGEX.test("abc")).toBe(false);
    });

    test("does not match a non-letter and non-digit character", () => {
        expect(IS_LETTER_OR_DIGIT_REGEX.test("@")).toBe(false);
    });

    test("does not match an empty string", () => {
        expect(IS_LETTER_OR_DIGIT_REGEX.test("")).toBe(false);
    });
});

describe("isUpperCase", () => {
    test("returns true for a string of uppercase letters", () => {
        expect(isUpperCase("ABC")).toBe(true);
    });

    test("returns true for a string of uppercase letters and non-letter characters", () => {
        expect(isUpperCase("HELLO WORLD! 42 IS THE ANSWER.")).toBe(true);
    });

    test("returns true for an empty string", () => {
        expect(isUpperCase("")).toBe(true);
    });

    test("returns false for a string of lowercase letters", () => {
        expect(isUpperCase("abc")).toBe(false);
    });

    test("returns false for a mixed-case string", () => {
        expect(isUpperCase("AbC")).toBe(false);
    });
});

describe("IS_UPPER_CASE_REGEX", () => {
    test("matches a string of uppercase letters", () => {
        expect(IS_UPPER_CASE_REGEX.test("ABC")).toBe(true);
    });

    test("matches a string of uppercase letters and non-letter characters", () => {
        expect(IS_UPPER_CASE_REGEX.test("HELLO WORLD! 42 IS THE ANSWER.")).toBe(true);
    });

    test("matches an empty string", () => {
        expect(IS_UPPER_CASE_REGEX.test("")).toBe(true);
    });

    test("does not match a string of lowercase letters", () => {
        expect(IS_UPPER_CASE_REGEX.test("abc")).toBe(false);
    });

    test("does not match a mixed-case string", () => {
        expect(IS_UPPER_CASE_REGEX.test("AbC")).toBe(false);
    });
});

describe("isLowerCase", () => {
    test("returns true for a string of lowercase letters", () => {
        expect(isLowerCase("abc")).toBe(true);
    });

    test("returns true for a string of lowercase letters and non-letter characters", () => {
        expect(isLowerCase("hello world! 42 is the answer.")).toBe(true);
    });

    test("returns true for an empty string", () => {
        expect(isLowerCase("")).toBe(true);
    });

    test("returns false for a string of uppercase letters", () => {
        expect(isLowerCase("ABC")).toBe(false);
    });

    test("returns false for a mixed-case string", () => {
        expect(isLowerCase("AbC")).toBe(false);
    });
});

describe("IS_LOWER_CASE_REGEX", () => {
    test("matches a string of lowercase letters", () => {
        expect(IS_LOWER_CASE_REGEX.test("abc")).toBe(true);
    });

    test("matches a string of lowercase letters and non-letter characters", () => {
        expect(IS_LOWER_CASE_REGEX.test("hello world! 42 is the answer.")).toBe(true);
    });

    test("matches an empty string", () => {
        expect(IS_LOWER_CASE_REGEX.test("")).toBe(true);
    });

    test("does not match a string of uppercase letters", () => {
        expect(IS_LOWER_CASE_REGEX.test("ABC")).toBe(false);
    });

    test("does not match a mixed-case string", () => {
        expect(IS_LOWER_CASE_REGEX.test("AbC")).toBe(false);
    });
});

describe("isNumberString", () => {
    test("returns true for a valid number string", () => {
        expect(isNumberString("123")).toBe(true);
        expect(isNumberString("0.5")).toBe(true);
    });

    test("returns false for a non-number string", () => {
        expect(isNumberString("abc")).toBe(false);
    });
});

describe("isIntegerString", () => {
    test("returns true for a valid integer string", () => {
        expect(isIntegerString("123")).toBe(true);
    });

    test("returns false for a non-number string", () => {
        expect(isIntegerString("abc")).toBe(false);
    });

    test("returns false for a non-integer string", () => {
        expect(isIntegerString("0.5")).toBe(false);
    });
});

describe("stringCompare", () => {
    test("compares two strings", () => {
        expect(stringCompare("abc", "def")).toBeLessThan(0);
        expect(stringCompare("def", "abc")).toBeGreaterThan(0);
        expect(stringCompare("abc", "abc")).toBe(0);
    });

    test("compares two strings ignoring case", () => {
        expect(stringCompare("abc", "DEF", { ignoreCase: true })).toBeLessThan(0);
        expect(stringCompare("ABC", "def", { ignoreCase: true })).toBeLessThan(0);
        expect(stringCompare("DEF", "abc", { ignoreCase: true })).toBeGreaterThan(0);
        expect(stringCompare("def", "ABC", { ignoreCase: true })).toBeGreaterThan(0);
        expect(stringCompare("abc", "ABC", { ignoreCase: true })).toBe(0);
        expect(stringCompare("ABC", "abc", { ignoreCase: true })).toBe(0);
    });
});

describe("stringEquals", () => {
    test("compares two strings for equality", () => {
        expect(stringEquals("abc", "abc")).toBe(true);
        expect(stringEquals("abc", "def")).toBe(false);
    });

    test("compares two strings for equality ignoring case", () => {
        expect(stringEquals("abc", "ABC", { ignoreCase: true })).toBe(true);
        expect(stringEquals("ABC", "abc", { ignoreCase: true })).toBe(true);
    });
});

describe("capitalize", () => {
    test("capitalizes the first letter of a string", () => {
        expect(capitalize("abc")).toBe("Abc");
    });

    test("leaves the string as is if the first letter is already capitalized", () => {
        expect(capitalize("Abc")).toBe("Abc");
    });
});

describe("uncapitalize", () => {
    test("uncapitalizes the first letter of a string", () => {
        expect(uncapitalize("Abc")).toBe("abc");
    });

    test("leave the string as is if the first letter is already uncapitalized", () => {
        expect(uncapitalize("abc")).toBe("abc");
    });
});

describe("toPascalCase", () => {
    test("converts strings to PascalCase", () => {
        expect(toPascalCase("PascalCase")).toBe("PascalCase");
        expect(toPascalCase("camelCase")).toBe("CamelCase");
        expect(toPascalCase("kebab-case")).toBe("KebabCase");
        expect(toPascalCase("snake_case")).toBe("SnakeCase");
        expect(toPascalCase("SCREAMING_SNAKE_CASE")).toBe("ScreamingSnakeCase");
    });
});

describe("split", () => {
    describe("with string separator", () => {
        test("splits a string by a given separator", () => {
            expect(split("a,b,c", ",")).toEqual(["a", "b", "c"]);
        });

        test("removes empty entries if specified", () => {
            expect(split("a,,b,,c", ",", { removeEmptyEntries: true })).toEqual(["a", "b", "c"]);
        });

        test("trims entries if specified", () => {
            expect(split(" a , b ,  c  ", ",", { trimEntries: true })).toEqual(["a", "b", "c"]);
        });
    });

    describe("with array of string separators", () => {
        test("splits a string by a given separators", () => {
            expect(split("a,b|c", [",", "|"])).toEqual(["a", "b", "c"]);
        });

        test("removes empty entries if specified", () => {
            expect(split("a|,b,|c", [",", "|"], { removeEmptyEntries: true })).toEqual(["a", "b", "c"]);
        });

        test("trims entries if specified", () => {
            expect(split(" a , b |  c  ", [",", "|"], { trimEntries: true })).toEqual(["a", "b", "c"]);
        });
    });

    describe("with regex separator", () => {
        test("splits a string by a given separator", () => {
            expect(split("a1b2c", /\d/)).toEqual(["a", "b", "c"]);
        });

        test("removes empty entries if specified", () => {
            expect(split("a12b34c5", /\d/, { removeEmptyEntries: true })).toEqual(["a", "b", "c"]);
        });

        test("trims entries if specified", () => {
            expect(split(" a 1 b 2  c  ", /\d/, { trimEntries: true })).toEqual(["a", "b", "c"]);
        });
    });
});

describe("splitLines", () => {
    test("splits a string into lines", () => {
        expect(splitLines("a\nb\nc")).toEqual(["a", "b", "c"]);
        expect(splitLines("a\r\nb\r\nc")).toEqual(["a", "b", "c"]);
    });

    test("splits a string into lines of a specified maximum length", () => {
        expect(splitLines("abcd efg\nhijk lmn\nopq", { maxLength: 5 })).toEqual(["abcd", "efg", "hijk", "lmn", "opq"]);
    });
});

describe("pad", () => {
    test("pads a string to a given length", () => {
        expect(pad("abc", 5)).toBe(" abc ");
    });

    test("pads a string with the given fill character", () => {
        expect(pad("abc", 5, { fillString: "*" })).toBe("*abc*");
    });

    test("pads a string to the left", () => {
        expect(pad("abc", 5, { align: "left" })).toBe("abc  ");
    });

    test("pads a string to the right", () => {
        expect(pad("abc", 5, { align: "right" })).toBe("  abc");
    });

    test("pads a string to the center", () => {
        expect(pad("abc", 5, { align: "center" })).toBe(" abc ");
    });
});

describe("generateSecureRandomString", () => {
    test("generates a random string of the specified length", () => {
        expect(generateSecureRandomString(1)).toHaveLength(1);
        expect(generateSecureRandomString(2)).toHaveLength(2);
        expect(generateSecureRandomString(10)).toHaveLength(10);
        expect(generateSecureRandomString(11)).toHaveLength(11);
    });

    test("returns an empty string if called with zero", () => {
        expect(generateSecureRandomString(0)).toBe("");
    });

    test("generates different strings for different calls", () => {
        expect(generateSecureRandomString(10)).not.toBe(generateSecureRandomString(10));
    });
});

describe("hashString", () => {
    test("hashes a string using the 'sha256' algorithm", () => {
        const hashed = hashString("hello", "sha256");

        expect(hashed).toBe(createHash("sha256").update("hello").digest("hex"));
    });

    test("hashes a string using the 'md5' algorithm", () => {
        const hashed = hashString("hello", "md5");

        expect(hashed).toBe(createHash("md5").update("hello").digest("hex"));
    });

    test("throws an error for an unknown algorithm", () => {
        expect(() => hashString("hello", "unknown")).toThrow();
    });
});
