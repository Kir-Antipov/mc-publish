import {
    defineNestedProperties,
    defineNestedProperty,
    getAllEntries,
    getAllKeys,
    getAllNames,
    getAllPropertyDescriptors,
    getAllSymbols,
    getAllValues,
    getOwnEntries,
    getPropertyDescriptor,
    getSafe,
    merge,
} from "@/utils/reflection/object-reflector";

describe("defineNestedProperties", () => {
    test("defines properties for the given object", () => {
        const properties = {
            "a.b.c": { value: 1, writable: true },
            "a.b.d": { value: 2, writable: true },
            "a.c": { value: 3, writable: true },
            "b": { value: 4, writable: true },
        };

        const result = defineNestedProperties({}, properties);

        expect(result).toHaveProperty("a.b.c", 1);
        expect(result).toHaveProperty("a.b.d", 2);
        expect(result).toHaveProperty("a.c", 3);
        expect(result).toHaveProperty("b", 4);
    });

    test("throws TypeError for non-object value", () => {
        const properties = { "a.b.c": { value: 1, writable: true } };

        expect(() => defineNestedProperties(1, properties)).toThrow(TypeError);
    });
});

describe("defineNestedProperty", () => {
    test("defines a property for the given object", () => {
        const property = { value: 1, writable: true };

        const result = defineNestedProperty({}, "a.b.c", property);

        expect(result).toHaveProperty("a.b.c", 1);
    });

    test("throws TypeError for non-object value", () => {
        const property = { value: 1, writable: true };

        expect(() => defineNestedProperty(1, "a.b.c", property)).toThrow(TypeError);
    });
});

describe("getAllPropertyDescriptors", () => {
    test("returns all property descriptors from the given object and its prototypes", () => {
        const obj = { a: 1 };

        const result = Array.from(getAllPropertyDescriptors(obj));
        const keys = result.map(([key]) => key);

        expect(keys).toContain("a");
        expect(keys).toContain("toString");
        expect(keys).toContain("constructor");
    });
});

describe("getPropertyDescriptor", () => {
    test("returns the property descriptor of the given object", () => {
        expect(getPropertyDescriptor({ a: 1 }, "a")).toBeDefined();
        expect(getPropertyDescriptor({}, "toString")).toBeDefined();
    });

    test("returns undefined if property descriptor is not found", () => {
        expect(getPropertyDescriptor({ a: 1 }, "b")).toBeUndefined();
        expect(getPropertyDescriptor({}, "toJSON")).toBeUndefined();
    });
});

describe("getAllKeys", () => {
    test("returns all keys from the given object and its prototypes", () => {
        const obj = { a: 1, b: 2, [Symbol.toStringTag]: "3" };

        const keys = Array.from(getAllKeys(obj));

        expect(keys).toEqual(expect.arrayContaining(["a", "b", Symbol.toStringTag, "toString", "constructor"]));
    });
});

describe("getAllNames", () => {
    test("returns all string keys from the given object and its prototypes", () => {
        const obj = { a: 1, b: 2, [Symbol.toStringTag]: "3" };

        const names = Array.from(getAllNames(obj));

        expect(names).toEqual(expect.arrayContaining(["a", "b", "toString", "constructor"]));
    });
});

describe("getAllSymbols", () => {
    test("returns all symbol keys from the given object and its prototypes", () => {
        const obj = { a: 1, b: 2, [Symbol.toStringTag]: "3" };

        const symbols = Array.from(getAllSymbols(obj));

        expect(symbols).toEqual(expect.arrayContaining([Symbol.toStringTag]));
    });
});

describe("getAllValues", () => {
    test("returns all property values from the given object and its prototypes", () => {
        const obj = { a: 1, b: 2, [Symbol.toStringTag]: "3" };

        const values = Array.from(getAllValues(obj));

        expect(values).toEqual(expect.arrayContaining([1, 2, "3", Object.prototype.constructor, Object.prototype.toString]));
    });
});

describe("getAllEntries", () => {
    test("returns all entries from the given object and its prototypes", () => {
        const obj = { a: 1, b: 2, [Symbol.toStringTag]: "3" };

        const entries = Array.from(getAllEntries(obj));

        expect(entries).toEqual(expect.arrayContaining([
            ["a", 1],
            ["b", 2],
            [Symbol.toStringTag, "3"],
            ["toString", Object.prototype.toString],
            ["constructor", Object.prototype.constructor],
        ]));
    });
});

describe("getOwnEntries", () => {
    test("returns the key/value pairs from an object", () => {
        const obj = { a: 1, b: 2 };

        const result = Array.from(getOwnEntries(obj));

        expect(result).toEqual([["a", 1], ["b", 2]]);
    });

    test("returns the key/value pairs from a map", () => {
        const map = new Map(Object.entries({ a: 1, b: 2 }));

        const result = Array.from(getOwnEntries(map));

        expect(result).toEqual([["a", 1], ["b", 2]]);
    });

    test("returns the key/value pairs from an array of key/value pairs", () => {
        const entries = [["a", 1], ["b", 2]];

        const result = Array.from(getOwnEntries(entries));

        expect(result).toEqual([["a", 1], ["b", 2]]);
    });

    test("returns empty array if the object is null or undefined", () => {
        expect(Array.from(getOwnEntries(null))).toEqual([]);
        expect(Array.from(getOwnEntries(undefined))).toEqual([]);
    });
});

describe("merge", () => {
    test("merges multiple objects into a single object while preserving property descriptors", () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { c: 3, d: 4 };

        const merged = merge(obj1, obj2);

        expect(merged).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    test("respects precedence when merging objects", () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 3, c: 4 };

        const merged = merge(obj1, obj2);

        expect(merged).toEqual({ a: 1, b: 3, c: 4 });
        expect(Object.getOwnPropertyDescriptor(obj2, "b")).toStrictEqual(Object.getOwnPropertyDescriptor(merged, "b"));
    });

    test("preserves getters and setters when merging objects", () => {
        const obj1 = {
            _a: 1,
            get a() {
                return this._a;
            },

            set a(val) {
                this._a = val;
            },
        };

        const obj2 = {
            _b: 2,
            get b() {
                return this._b;
            },

            set b(val) {
                this._b = val;
            },
        };

        const merged = merge(obj1, obj2);

        expect(merged).toMatchObject({ a: 1, b: 2 });
        expect(Object.getOwnPropertyDescriptor(merged, "a")).toEqual(Object.getOwnPropertyDescriptor(obj1, "a"));
        expect(Object.getOwnPropertyDescriptor(merged, "b")).toEqual(Object.getOwnPropertyDescriptor(obj2, "b"));
    });
});

describe("getSafe", () => {
    it("returns the value of an existing property", () => {
        const obj = {
            name: "John",
            age: 30,
        };

        expect(getSafe(obj, "name")).toBe("John");
        expect(getSafe(obj, "age")).toBe(30);
    });

    it("handles array indices as keys", () => {
        const arr = ["apple", "banana", "cherry"] as const;

        expect(getSafe(arr, 0)).toBe("apple");
        expect(getSafe(arr, 1)).toBe("banana");
        expect(getSafe(arr, 2)).toBe("cherry");
        expect(getSafe(arr, 3)).toBeUndefined();
    });

    it("handles Symbols as keys", () => {
        const obj = {
            [Symbol.toStringTag]: "Not Object",
        };

        expect(getSafe(obj, Symbol.toStringTag)).toBe("Not Object");
    });

    it("returns undefined for non-existent properties", () => {
        const obj = {
            name: "John",
            age: 30,
        };

        expect(getSafe(obj, "address")).toBeUndefined();
        expect(getSafe(obj, "salary")).toBeUndefined();
    });

    it("returns undefined if accessing the property is not possible", () => {
        const obj = {
            get name(): string {
                throw new Error();
            },
        };

        expect(getSafe(obj, "name")).toBeUndefined();
    });

    it("returns undefined when the target object is null or undefined", () => {
        expect(getSafe(null, "name")).toBeUndefined();
        expect(getSafe(undefined, "name")).toBeUndefined();
    });
});
