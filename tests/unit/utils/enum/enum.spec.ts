import { enumEntries } from "@/utils/enum/enum-entry";
import { enumKeys } from "@/utils/enum/enum-key";
import { enumValues } from "@/utils/enum/enum-value";
import { DynamicEnum } from "@/utils/enum/dynamic-enum";
import { hasFlag, Enum, createEnum } from "@/utils/enum/enum";

describe("hasFlag", () => {
    test("returns true if a flag is set", () => {
        expect(hasFlag(3, 2)).toBe(true);
        expect(hasFlag(3n, 2n)).toBe(true);
        expect(hasFlag(true, true)).toBe(true);
        expect(hasFlag("value1, value2", "value2")).toBe(true);
        expect(hasFlag("value1 | value2", "value2")).toBe(true);
        expect(hasFlag("value1|value2", "value2")).toBe(true);
    });

    test("returns false if a flag is not set", () => {
        expect(hasFlag(3, 4)).toBe(false);
        expect(hasFlag(3n, 4n)).toBe(false);
        expect(hasFlag(false, true)).toBe(false);
        expect(hasFlag("value1, value2", "value3")).toBe(false);
        expect(hasFlag("value1 | value2", "value3")).toBe(false);
        expect(hasFlag("value1|value2", "value3")).toBe(false);
    });

    test("returns false if a value cannot contain flags", () => {
        expect(hasFlag({}, {})).toBe(false);
        expect(hasFlag([], [])).toBe(false);
        expect(hasFlag(Symbol("a"), Symbol("b"))).toBe(false);
    });
});

describe("createEnum", () => {
    test("creates an enum when a plain object is given", () => {
        const e = createEnum({ A: "A", B: "B" });

        expect(e).toBeInstanceOf(DynamicEnum);
        expect(e.A).toBe("A");
        expect(e.B).toBe("B");
    });

    test("creates an enum when a plain enum is given", () => {
        enum TestEnum {
            A = 1,
            B = 2,
        }
        const e = createEnum(TestEnum);

        expect(e).toBeInstanceOf(DynamicEnum);
        expect(e.A).toBe(1);
        expect(e.B).toBe(2);
    });

    test("creates an enum when a function returning an object is given", () => {
        const e = createEnum(() => ({ A: "A", B: "B" }));

        expect(e).toBeInstanceOf(DynamicEnum);
        expect(e.A).toBe("A");
        expect(e.B).toBe("B");
    });

    test("creates an enum with custom methods", () => {
        const e = createEnum({ A: "A", B: "B" }, {}, { customMethod: () => "custom" });

        expect(e.customMethod()).toBe("custom");
    });

    test("creates an enum with 'ignoreCase' option", () => {
        const e = createEnum({ A: "A", B: "B", Foo: "Foo" }, { ignoreCase: true });

        expect(e.get("A")).toBe("A");
        expect(e.get("a")).toBe("A");
        expect(e.get("B")).toBe("B");
        expect(e.get("b")).toBe("B");
        expect(e.get("Foo")).toBe("Foo");
        expect(e.get("foo")).toBe("Foo");
        expect(e.get("FOO")).toBe("Foo");
        expect(e.get("FoO")).toBe("Foo");
    });

    test("creates an enum with 'ignoreNonWordCharacters' option", () => {
        const e = createEnum({ "a-b": "a-b", "C_D": "C_D" }, { ignoreNonWordCharacters: true });

        expect(e.get("ab")).toBe("a-b");
        expect(e.get("CD")).toBe("C_D");
    });
});

describe("Enum", () => {
    describe("hasFlag", () => {
        test("redirects the call to 'hasFlag'", () => {
            expect(Enum.hasFlag).toBe(hasFlag);
        });
    });

    describe("create", () => {
        test("redirects the call to 'createEnum'", () => {
            expect(Enum.create).toBe(createEnum);
        });
    });

    describe("keys", () => {
        test("redirects the call to 'enumKeys'", () => {
            expect(Enum.keys).toBe(enumKeys);
        });
    });

    describe("values", () => {
        test("redirects the call to 'enumValues'", () => {
            expect(Enum.values).toBe(enumValues);
        });
    });

    describe("entries", () => {
        test("redirects the call to 'enumEntries'", () => {
            expect(Enum.entries).toBe(enumEntries);
        });
    });
});
