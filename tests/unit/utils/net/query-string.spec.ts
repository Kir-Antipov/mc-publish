import { QueryString, isQueryString, isURLSearchParams } from "@/utils/net/query-string";

describe("QueryString", () => {
    describe("constructor", () => {
        test("creates a new QueryString instance", () => {
            const queryString = new QueryString();

            expect(queryString.size).toBe(0);
        });

        test("creates a new QueryString instance from a query string", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.get("key2")).toBe("value2");
        });

        test("creates a new QueryString instance from a query string that starts with '?'", () => {
            const params = "?key1=value1&key2=value2";

            const queryString = new QueryString(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.get("key2")).toBe("value2");
        });

        test("creates a new QueryString instance from an iterable", () => {
            const params = [["key1", "value1"], ["key2", "value2"]] as Iterable<[string, string]>;

            const queryString = new QueryString(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.get("key2")).toBe("value2");
        });

        test("creates a new QueryString instance from a record", () => {
            const params = { key1: "value1", key2: "value2" };

            const queryString = new QueryString(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.get("key2")).toBe("value2");
        });

        test("filters out null and undefined parameters from an iterable", () => {
            const params = [["key1", "value1"], ["key2", null], ["key3", undefined]] as Iterable<[string, string]>;

            const queryString = new QueryString(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.has("key2")).toBe(false);
            expect(queryString.has("key3")).toBe(false);
        });

        test("filters out null and undefined parameters from a record", () => {
            const params = { key1: "value1", key2: null, key3: undefined };

            const queryString = new QueryString(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.has("key2")).toBe(false);
            expect(queryString.has("key3")).toBe(false);
        });

        test("stringifies all values in an iterable", () => {
            const params = [["key1", "value1"], ["key2", 42], ["key3", true]] as Iterable<[string, unknown]>;

            const queryString = new QueryString(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.get("key2")).toBe("42");
            expect(queryString.get("key3")).toBe("true");
        });

        test("stringifies all values in a record", () => {
            const params = { key1: "value1", key2: 42, key3: true };

            const queryString = new QueryString(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.get("key2")).toBe("42");
            expect(queryString.get("key3")).toBe("true");
        });
    });

    describe("parse", () => {
        test("creates a new QueryString instance from a query string", () => {
            const params = "key1=value1&key2=value2";

            const queryString = QueryString.parse(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.get("key2")).toBe("value2");
        });

        test("creates a new QueryString instance from a query string that starts with '?'", () => {
            const params = "?key1=value1&key2=value2";

            const queryString = QueryString.parse(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.get("key2")).toBe("value2");
        });
    });

    describe("size", () => {
        test("returns the number of key-value pairs in the query string", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);

            expect(queryString.size).toBe(2);
        });

        test("returns 0 when the query string is empty", () => {
            const queryString = new QueryString();

            expect(queryString.size).toBe(0);
        });

        test("returns the correct size after adding a key-value pair", () => {
            const queryString = new QueryString();
            queryString.append("key1", "value1");

            expect(queryString.size).toBe(1);
        });

        test("returns the correct size after removing a key-value pair", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);
            queryString.delete("key1");

            expect(queryString.size).toBe(1);
        });

        test("returns the correct size after clearing the query string", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);
            queryString.clear();

            expect(queryString.size).toBe(0);
        });
    });

    describe("get", () => {
        test("returns the value of the first key/value pair with the given key", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);

            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.get("key2")).toBe("value2");
        });

        test("returns undefined if there is no key/value pair with the given key", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);

            expect(queryString.get("key3")).toBeUndefined();
        });

        test("returns undefined if the query string is empty", () => {
            const queryString = new QueryString();

            expect(queryString.get("key1")).toBeUndefined();
        });
    });

    describe("append", () => {
        test("appends a new key/value pair to the query string", () => {
            const queryString = new QueryString();

            queryString.append("key1", "value1");

            expect(queryString.get("key1")).toBe("value1");
        });

        test("appends multiple values to the same key", () => {
            const queryString = new QueryString();

            queryString.append("key1", "value1");
            queryString.append("key1", "value2");

            expect(queryString.getAll("key1")).toEqual(["value1", "value2"]);
        });
    });

    describe("set", () => {
        test("sets a single value associated with the specified key, replacing any existing values", () => {
            const queryString = new QueryString("key1=value1");

            queryString.set("key1", "newValue1");

            expect(queryString.get("key1")).toBe("newValue1");
        });

        test("sets a single value associated with the specified key when no previous value exists", () => {
            const queryString = new QueryString();

            queryString.set("key1", "value1");

            expect(queryString.get("key1")).toBe("value1");
        });
    });

    describe("delete", () => {
        test("removes the entry with the specified key from the query string", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);
            const result = queryString.delete("key1");

            expect(result).toBe(true);
            expect(queryString.get("key1")).toBeUndefined();
            expect(queryString.get("key2")).toBe("value2");
        });

        test("returns false if no entry with the specified key was found", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);
            const result = queryString.delete("key3");

            expect(result).toBe(false);
            expect(queryString.get("key1")).toBe("value1");
            expect(queryString.get("key2")).toBe("value2");
        });
    });

    describe("clear", () => {
        test("removes all key/value pairs from the query string", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);
            queryString.clear();

            expect(queryString.size).toBe(0);
            expect(queryString.has("key1")).toBe(false);
            expect(queryString.has("key2")).toBe(false);
        });

        test("does nothing when the query string is already empty", () => {
            const queryString = new QueryString();
            queryString.clear();

            expect(queryString.size).toBe(0);
        });
    });

    describe("getString", () => {
        test("returns the value of the parameter as a string", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);

            expect(queryString.getString("key1")).toBe("value1");
            expect(queryString.getString("key2")).toBe("value2");
        });

        test("returns undefined if the parameter is not found", () => {
            const queryString = new QueryString();

            expect(queryString.getString("key1")).toBeUndefined();
        });
    });

    describe("getBoolean", () => {
        test("returns the value of the parameter as a boolean when the value is a boolean string", () => {
            const params = "key1=true&key2=false";

            const queryString = new QueryString(params);

            expect(queryString.getBoolean("key1")).toBe(true);
            expect(queryString.getBoolean("key2")).toBe(false);
        });

        test("returns undefined when the parameter is not found", () => {
            const queryString = new QueryString();

            expect(queryString.getBoolean("key1")).toBeUndefined();
        });

        test("returns undefined when the value of the parameter cannot be converted to a boolean", () => {
            const params = "key1=value1";

            const queryString = new QueryString(params);

            expect(queryString.getBoolean("key1")).toBeUndefined();
        });

        test("returns true when the value of the parameter is an empty string", () => {
            const params = "key1=";

            const queryString = new QueryString(params);

            expect(queryString.getBoolean("key1")).toBe(true);
        });
    });

    describe("getNumber", () => {
        test("returns the value of the parameter as a number", () => {
            const params = "key1=42";

            const queryString = new QueryString(params);

            expect(queryString.getNumber("key1")).toBe(42);
        });

        test("returns undefined if the parameter is not found", () => {
            const queryString = new QueryString();

            expect(queryString.getNumber("key1")).toBeUndefined();
        });

        test("returns undefined if the parameter cannot be converted to a number", () => {
            const params = "key1=value1";

            const queryString = new QueryString(params);

            expect(queryString.getNumber("key1")).toBeUndefined();
        });

        test("returns the value of the parameter as a number even if it's a float", () => {
            const params = "key1=42.42";

            const queryString = new QueryString(params);

            expect(queryString.getNumber("key1")).toBe(42.42);
        });
    });

    describe("getDate", () => {
        test("returns the value of the parameter as a date", () => {
            const params = "date=2022-12-31";

            const queryString = new QueryString(params);

            expect(queryString.getDate("date")).toEqual(new Date("2022-12-31"));
        });

        test("returns undefined if the parameter is not found", () => {
            const queryString = new QueryString();

            expect(queryString.getDate("date")).toBeUndefined();
        });

        test("returns undefined if the parameter cannot be converted to a date", () => {
            const params = "date=not-a-date";

            const queryString = new QueryString(params);

            expect(queryString.getDate("date")).toBeUndefined();
        });
    });

    describe("getRegExp", () => {
        test("returns the value of the parameter as a RegExp", () => {
            const params = "key1=/^value1$/g&key2=/^value2$/g";

            const queryString = new QueryString(params);

            expect(queryString.getRegExp("key1")).toEqual(/^value1$/g);
            expect(queryString.getRegExp("key2")).toEqual(/^value2$/g);
        });

        test("returns undefined if the parameter is not found", () => {
            const queryString = new QueryString();

            expect(queryString.getRegExp("key1")).toBeUndefined();
        });

        test("returns undefined if the parameter cannot be converted to a RegExp", () => {
            const params = "key1=value1&key2=value2";

            const queryString = new QueryString(params);

            expect(queryString.getRegExp("key1")).toBeUndefined();
            expect(queryString.getRegExp("key2")).toBeUndefined();
        });
    });

    describe("forEach", () => {
        test("calls the specified callback function for each element in the query string", () => {
            const params = "key1=value1&key2=value2";
            const callback = jest.fn();

            const queryString = new QueryString(params);
            queryString.forEach(callback);

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenNthCalledWith(1, "value1", "key1", queryString);
            expect(callback).toHaveBeenNthCalledWith(2, "value2", "key2", queryString);
        });

        test("uses the provided thisArg as `this` when executing the callback function", () => {
            const params = "key1=value1";
            const thisArg = {};
            const callback = jest.fn(function(this: unknown) {
                expect(this).toBe(thisArg);
            });

            const queryString = new QueryString(params);
            queryString.forEach(callback, thisArg);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenNthCalledWith(1, "value1", "key1", queryString);
        });

        test("does not call the callback function if the query string is empty", () => {
            const callback = jest.fn();

            const queryString = new QueryString();
            queryString.forEach(callback);

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe("[Symbol.toStringTag]", () => {
        test("returns the same string tag as URLSearchParams", () => {
            const urlSearchParams = new URLSearchParams();
            const queryString = new QueryString();

            expect(queryString[Symbol.toStringTag]).toBe(urlSearchParams[Symbol.toStringTag]);
        });
    });
});

describe("isURLSearchParams", () => {
    test("returns true when the object is an instance of URLSearchParams", () => {
        expect(isURLSearchParams(new URLSearchParams())).toBe(true);
        expect(isURLSearchParams(new QueryString())).toBe(true);
    });

    test("returns false when the object is not an instance of URLSearchParams", () => {
        expect(isURLSearchParams({})).toBe(false);
    });

    test("returns false when the object is null", () => {
        expect(isURLSearchParams(null)).toBe(false);
    });

    test("returns false when the object is undefined", () => {
        expect(isURLSearchParams(undefined)).toBe(false);
    });
});

describe("isQueryString", () => {
    test("returns true when the object is an instance of QueryString", () => {
        expect(isQueryString(new QueryString())).toBe(true);
    });

    test("returns false when the object is not an instance of QueryString", () => {
        expect(isQueryString(new URLSearchParams())).toBe(false);
        expect(isQueryString({})).toBe(false);
    });

    test("returns false when the object is null", () => {
        expect(isQueryString(null)).toBe(false);
    });

    test("returns false when the object is undefined", () => {
        expect(isQueryString(undefined)).toBe(false);
    });
});
