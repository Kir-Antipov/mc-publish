import { Enum } from "@/utils/enum/enum";
import { enumKeys } from "@/utils/enum/enum-key";

describe("enumKeys", () => {
    test("returns the correct keys for number-based built-in enums", () => {
        enum NumberEnum {
            A = 1,
            B = 2,
            C = 3,
        }

        const keys = enumKeys(NumberEnum);

        expect(keys).toEqual(["A", "B", "C"]);
    });

    test("returns the correct keys for string-based built-in enums", () => {
        enum StringEnum {
            A = "a",
            B = "b",
            C = "c",
        }

        const keys = enumKeys(StringEnum);
        expect(keys).toEqual(["A", "B", "C"]);
    });

    test("returns the correct keys for custom enums created with Enum.create", () => {
        const CustomEnum = Enum.create({
            A: 1n,
            B: 2n,
            C: 3n,
        });

        const keys = enumKeys(CustomEnum);
        expect(keys).toEqual(["A", "B", "C"]);
    });
});
