import { IGNORE_CASE_EQUALITY_COMPARER } from "@/utils/comparison/string-equality-comparer";
import { DynamicEnum } from "@/utils/enum/dynamic-enum";

describe("DynamicEnum", () => {
    enum TestEnum {
        FOO = 1,
        BAR = 2,
        BAZ = 4,
        QUX = 8,
    }

    describe("create", () => {
        test("creates a dynamic enum based on the given enum value container", () => {
            const e = DynamicEnum.create(TestEnum);

            expect(e).toBeInstanceOf(DynamicEnum);
            expect(e.FOO).toBe(TestEnum.FOO);
            expect(e.BAR).toBe(TestEnum.BAR);
            expect(e.BAZ).toBe(TestEnum.BAZ);
            expect(e.QUX).toBe(TestEnum.QUX);
        });

        test("handles enums without flags", () => {
            const e = DynamicEnum.create({ A: "a", B: "b" }, { hasFlags: false });

            expect(e.hasFlag("a", "b")).toBe(false);
        });

        test("handles enums with flags", () => {
            const e = DynamicEnum.create(TestEnum, { hasFlags: true });

            expect(e.hasFlag(TestEnum.BAR | TestEnum.BAZ, TestEnum.BAZ)).toBe(true);
        });

        test("handles enums with a custom comparer", () => {
            const e = DynamicEnum.create(TestEnum, { comparer: IGNORE_CASE_EQUALITY_COMPARER, hasFlags: true });

            expect(e.parse("FOO")).toBe(TestEnum.FOO);
            expect(e.parse("Foo")).toBe(TestEnum.FOO);
            expect(e.parse("foo")).toBe(TestEnum.FOO);
            expect(e.parse("foo, baz")).toBe(TestEnum.FOO | TestEnum.BAZ);
            expect(e.parse("FOO, baz")).toBe(TestEnum.FOO | TestEnum.BAZ);
            expect(e.parse("foo, Baz")).toBe(TestEnum.FOO | TestEnum.BAZ);
            expect(e.parse("foo | Baz")).toBe(TestEnum.FOO | TestEnum.BAZ);
            expect(e.parse("foo|Baz")).toBe(TestEnum.FOO | TestEnum.BAZ);
        });

        test("handles enums with custom display names", () => {
            const e = DynamicEnum.create(TestEnum, { names: [["FOO", "1"]] });

            expect(e.friendlyNameOf(TestEnum.FOO)).toBe("1");
        });
    });

    describe("size", () => {
        test("returns the correct size of the enum", () => {
            expect(DynamicEnum.create({}).size).toBe(0);
            expect(DynamicEnum.create({ A: "a" }).size).toBe(1);
            expect(DynamicEnum.create({ A: "a", B: "b" }).size).toBe(2);
            expect(DynamicEnum.create(TestEnum).size).toBe(4);
        });
    });

    describe("underlyingType", () => {
        test("returns the correct underlying type of the enum", () => {
            expect(DynamicEnum.create({ A: "a" }).underlyingType).toBe("string");
            expect(DynamicEnum.create({ A: 1n }).underlyingType).toBe("bigint");
            expect(DynamicEnum.create({ TRUE: true }).underlyingType).toBe("boolean");
            expect(DynamicEnum.create(TestEnum).underlyingType).toBe("number");
        });

        test("returns 'number' if the enum is empty", () => {
            expect(DynamicEnum.create({}).underlyingType).toBe("number");
        });
    });

    describe("hasFlag", () => {
        test("returns true if a flag is set", () => {
            const e = DynamicEnum.create(TestEnum, { hasFlags: true });

            expect(e.hasFlag(TestEnum.BAR, TestEnum.BAR)).toBe(true);
            expect(e.hasFlag(TestEnum.BAR | TestEnum.QUX, TestEnum.QUX)).toBe(true);
            expect(e.hasFlag(TestEnum.BAR | TestEnum.QUX | TestEnum.FOO, TestEnum.FOO)).toBe(true);
        });

        test("returns false if a flag is not set", () => {
            const e = DynamicEnum.create(TestEnum);

            expect(e.hasFlag(TestEnum.BAR, TestEnum.QUX)).toBe(false);
            expect(e.hasFlag(TestEnum.BAR | TestEnum.QUX, TestEnum.FOO)).toBe(false);
            expect(e.hasFlag(TestEnum.BAR | TestEnum.QUX | TestEnum.FOO, TestEnum.BAZ)).toBe(false);
        });
    });

    describe("get", () => {
        test("retrieves the correct enum value", () => {
            expect(DynamicEnum.create(TestEnum).get("FOO")).toBe(TestEnum.FOO);
        });

        test("returns undefined if the given key does not exist in the enum", () => {
            expect(DynamicEnum.create(TestEnum).get("Foo")).toBeUndefined();
            expect(DynamicEnum.create({}).get("A")).toBeUndefined();
        });
    });

    describe("keyOf", () => {
        test("retrieves the correct enum key for the value", () => {
            expect(DynamicEnum.create(TestEnum).keyOf(TestEnum.FOO)).toBe("FOO");
        });

        test("returns undefined if the given value does not exist in the enum", () => {
            expect(DynamicEnum.create(TestEnum).keyOf(16 as TestEnum)).toBeUndefined();
            expect(DynamicEnum.create({}).keyOf("A" as never)).toBeUndefined();
        });
    });

    describe("friendlyNameOf", () => {
        test("retrieves the friendly name of a value", () => {
            expect(DynamicEnum.create(TestEnum).friendlyNameOf(TestEnum.FOO)).toBe("Foo");
        });

        test("returns undefined if the given value does not exist in the enum", () => {
            expect(DynamicEnum.create(TestEnum).friendlyNameOf(16 as TestEnum)).toBeUndefined();
            expect(DynamicEnum.create({}).friendlyNameOf("A" as never)).toBeUndefined();
        });
    });

    describe("find", () => {
        test("finds the first value that satisfies the provided testing function", () => {
            const predicate = jest.fn().mockImplementation(x => x === TestEnum.QUX);

            const e = DynamicEnum.create(TestEnum);

            expect(e.find(predicate)).toBe(TestEnum.QUX);
            expect(predicate).toHaveBeenCalledTimes(4);
            expect(predicate).toHaveBeenNthCalledWith(1, TestEnum.FOO, "FOO", e);
            expect(predicate).toHaveBeenNthCalledWith(2, TestEnum.BAR, "BAR", e);
            expect(predicate).toHaveBeenNthCalledWith(3, TestEnum.BAZ, "BAZ", e);
            expect(predicate).toHaveBeenNthCalledWith(4, TestEnum.QUX, "QUX", e);
        });

        test("returns undefined if no value satisfies the given predicate", () => {
            expect(DynamicEnum.create({}).find(() => false)).toBeUndefined();
        });
    });

    describe("findKey", () => {
        test("finds the first key that satisfies the provided testing function", () => {
            const predicate = jest.fn().mockImplementation(x => x === TestEnum.QUX);

            const e = DynamicEnum.create(TestEnum);

            expect(e.findKey(predicate)).toBe("QUX");
            expect(predicate).toHaveBeenCalledTimes(4);
            expect(predicate).toHaveBeenNthCalledWith(1, TestEnum.FOO, "FOO", e);
            expect(predicate).toHaveBeenNthCalledWith(2, TestEnum.BAR, "BAR", e);
            expect(predicate).toHaveBeenNthCalledWith(3, TestEnum.BAZ, "BAZ", e);
            expect(predicate).toHaveBeenNthCalledWith(4, TestEnum.QUX, "QUX", e);
        });

        test("returns undefined if no key satisfies the given predicate", () => {
            expect(DynamicEnum.create({}).findKey(() => false)).toBeUndefined();
        });
    });

    describe("has", () => {
        test("returns true if a key exists in the enum", () => {
            expect(DynamicEnum.create(TestEnum).has("FOO")).toBe(true);
        });

        test("returns false if a key does not exist in the enum", () => {
            expect(DynamicEnum.create({}).has("A")).toBe(false);
        });
    });

    describe("includes", () => {
        test("returns true if a value exists in the enum", () => {
            expect(DynamicEnum.create(TestEnum).includes(TestEnum.QUX)).toBe(true);
        });

        test("returns false if a value does not exist in the enum", () => {
            expect(DynamicEnum.create({}).includes(1 as never)).toBe(false);
        });
    });

    describe("keys", () => {
        test("returns an iterable of keys in the enum", () => {
            const e = DynamicEnum.create(TestEnum);
            const keys = Array.from(e.keys());

            expect(keys).toEqual(["FOO", "BAR", "BAZ", "QUX"]);
        });

        test("returns an empty iterable if the enum is empty", () => {
            expect(Array.from(DynamicEnum.create({}).keys())).toEqual([]);
        });
    });

    describe("values", () => {
        test("returns an iterable of values in the enum", () => {
            const e = DynamicEnum.create(TestEnum);
            const values = Array.from(e.values());

            expect(values).toEqual([TestEnum.FOO, TestEnum.BAR, TestEnum.BAZ, TestEnum.QUX]);
        });

        test("returns an empty iterable if the enum is empty", () => {
            expect(Array.from(DynamicEnum.create({}).values())).toEqual([]);
        });
    });

    describe("entries", () => {
        test("returns an iterable of entries in the enum", () => {
            const e = DynamicEnum.create(TestEnum);
            const entries = Array.from(e.entries());

            expect(entries).toEqual([["FOO", TestEnum.FOO], ["BAR", TestEnum.BAR], ["BAZ", TestEnum.BAZ], ["QUX", TestEnum.QUX]]);
        });

        test("returns an empty iterable if the enum is empty", () => {
            expect(Array.from(DynamicEnum.create({}).entries())).toEqual([]);
        });
    });

    describe("[Symbol.iterator]", () => {
        test("returns an iterable of entries in the enum", () => {
            const e = DynamicEnum.create(TestEnum);
            const entries = Array.from(e.entries());

            expect(entries).toEqual([["FOO", TestEnum.FOO], ["BAR", TestEnum.BAR], ["BAZ", TestEnum.BAZ], ["QUX", TestEnum.QUX]]);
        });

        test("returns an empty iterable if the enum is empty", () => {
            expect(Array.from(DynamicEnum.create({}).entries())).toEqual([]);
        });
    });

    describe("[Symbol.toStringTag]", () => {
        test("returns 'Enum'", () => {
            expect(DynamicEnum.create(TestEnum)[Symbol.toStringTag]).toBe("Enum");
            expect(DynamicEnum.create({})[Symbol.toStringTag]).toBe("Enum");
        });
    });

    describe("forEach", () => {
        test("executes a provided function once for each enum entry", () => {
            const callback = jest.fn();

            const e = DynamicEnum.create(TestEnum);
            e.forEach(callback);

            expect(callback).toHaveBeenCalledTimes(4);
            expect(callback).toHaveBeenNthCalledWith(1, TestEnum.FOO, "FOO", e);
            expect(callback).toHaveBeenNthCalledWith(2, TestEnum.BAR, "BAR", e);
            expect(callback).toHaveBeenNthCalledWith(3, TestEnum.BAZ, "BAZ", e);
            expect(callback).toHaveBeenNthCalledWith(4, TestEnum.QUX, "QUX", e);
        });
    });

    describe("format", () => {
        test("formats a single enum value correctly", () => {
            const e = DynamicEnum.create(TestEnum, { hasFlags: true });

            expect(e.format(TestEnum.FOO)).toBe("FOO");
            expect(e.format(TestEnum.BAR)).toBe("BAR");
            expect(e.format(TestEnum.BAZ)).toBe("BAZ");
            expect(e.format(TestEnum.QUX)).toBe("QUX");
        });

        test("formats enum values with flags correctly", () => {
            const e = DynamicEnum.create(TestEnum, { hasFlags: true });

            expect(e.format(TestEnum.FOO)).toBe("FOO");
            expect(e.format(TestEnum.BAR)).toBe("BAR");
            expect(e.format(TestEnum.BAZ)).toBe("BAZ");
            expect(e.format(TestEnum.QUX)).toBe("QUX");

            expect(e.format(TestEnum.FOO | TestEnum.BAZ)).toBe("FOO, BAZ");
            expect(e.format(TestEnum.FOO | TestEnum.BAZ | TestEnum.QUX)).toBe("FOO, BAZ, QUX");
        });

        test("returns invalid enum values as is", () => {
            const e = DynamicEnum.create(TestEnum, { hasFlags: true });

            expect(e.format(0 as TestEnum)).toBe("0");
            expect(e.format(16 as TestEnum)).toBe("16");
        });
    });

    describe("parse", () => {
        test("parses a single enum value correctly", () => {
            const e = DynamicEnum.create(TestEnum, { hasFlags: true });

            expect(e.parse("FOO")).toBe(TestEnum.FOO);
            expect(e.parse("BAR")).toBe(TestEnum.BAR);
            expect(e.parse("BAZ")).toBe(TestEnum.BAZ);
            expect(e.parse("QUX")).toBe(TestEnum.QUX);
        });

        test("parses enum values with flags correctly", () => {
            const e = DynamicEnum.create(TestEnum, { hasFlags: true });

            expect(e.parse("FOO, BAZ")).toBe(TestEnum.FOO | TestEnum.BAZ);
            expect(e.parse("FOO, BAZ, QUX")).toBe(TestEnum.FOO | TestEnum.BAZ | TestEnum.QUX);
            expect(e.parse("FOO|BAZ|QUX")).toBe(TestEnum.FOO | TestEnum.BAZ | TestEnum.QUX);
        });

        test("returns undefined for an invalid enum value", () => {
            const e = DynamicEnum.create(TestEnum, { hasFlags: true });

            expect(e.parse("QUUX")).toBeUndefined();
            expect(e.parse("FOO, Huh")).toBeUndefined();
            expect(e.parse("FOO|Huh")).toBeUndefined();
        });
    });
});
