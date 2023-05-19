import { Enum } from "@/utils/enum/enum";
import { enumEntries } from "@/utils/enum/enum-entry";

describe("enumEntries", () => {
    test("returns the correct entries for number-based built-in enums", () => {
        enum NumberEnum {
            A = 1,
            B = 2,
            C = 3,
        }

        const entries = enumEntries(NumberEnum);

        expect(entries).toEqual([["A", 1], ["B", 2], ["C", 3]]);
    });

    test("returns the correct entries for string-based built-in enums", () => {
        enum StringEnum {
            A = "a",
            B = "b",
            C = "c",
        }

        const entries = enumEntries(StringEnum);
        expect(entries).toEqual([["A", "a"], ["B", "b"], ["C", "c"]]);
    });

    test("returns the correct entries for custom enums created with Enum.create", () => {
        const CustomEnum = Enum.create({
            A: 1n,
            B: 2n,
            C: 3n,
        });

        const entries = enumEntries(CustomEnum);
        expect(entries).toEqual([["A", 1n], ["B", 2n], ["C", 3n]]);
    });
});
