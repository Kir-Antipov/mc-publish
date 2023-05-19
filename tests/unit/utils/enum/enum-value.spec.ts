import { Enum } from "@/utils/enum/enum";
import { enumValues } from "@/utils/enum/enum-value";

describe("enumValues", () => {
    test("returns the correct values for number-based built-in enums", () => {
        enum NumberEnum {
            A = 1,
            B = 2,
            C = 3,
        }

        const values = enumValues(NumberEnum);

        expect(values).toEqual([1, 2, 3]);
    });

    test("returns the correct values for string-based built-in enums", () => {
        enum StringEnum {
            A = "a",
            B = "b",
            C = "c",
        }

        const values = enumValues(StringEnum);
        expect(values).toEqual(["a", "b", "c"]);
    });

    test("returns the correct values for custom enums created with Enum.create", () => {
        const CustomEnum = Enum.create({
            A: 1n,
            B: 2n,
            C: 3n,
        });

        const values = enumValues(CustomEnum);
        expect(values).toEqual([1n, 2n, 3n]);
    });
});
