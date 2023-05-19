import {
    toUndefined,
    toString,
    toBoolean,
    toInteger,
    toFloat,
    toDate,
    toRegExp,
    toType,
} from "@/utils/convert";

describe("toUndefined", () => {
    test("always returns undefined", () => {
        expect(toUndefined("something")).toBeUndefined();
        expect(toUndefined(123)).toBeUndefined();
        expect(toUndefined(null)).toBeUndefined();
        expect(toUndefined(undefined)).toBeUndefined();
    });
});

describe("toString", () => {
    test("returns strings as is", () => {
        expect(toString("test")).toBe("test");
    });

    test("converts valid values to strings", () => {
        expect(toString(123)).toBe("123");
        expect(toString(true)).toBe("true");
    });

    test("returns undefined for invalid values", () => {
        expect(toString(null)).toBeUndefined();
        expect(toString(undefined)).toBeUndefined();
        expect(toString(NaN)).toBeUndefined();
    });
});

describe("toBoolean", () => {
    test("returns booleans as is", () => {
        expect(toBoolean(false)).toBe(false);
        expect(toBoolean(true)).toBe(true);
    });

    test("converts 'true' and 'false' strings to booleans ignoring their case", () => {
        expect(toBoolean("true")).toBe(true);
        expect(toBoolean("false")).toBe(false);

        expect(toBoolean("TRUE")).toBe(true);
        expect(toBoolean("FALSE")).toBe(false);

        expect(toBoolean("True")).toBe(true);
        expect(toBoolean("False")).toBe(false);
    });

    test("converts numbers to booleans", () => {
        expect(toBoolean(0)).toBe(false);
        expect(toBoolean(1)).toBe(true);
        expect(toBoolean(2)).toBe(true);
    });

    test("returns undefined for invalid values", () => {
        expect(toBoolean("invalid")).toBeUndefined();
        expect(toBoolean(null)).toBeUndefined();
        expect(toBoolean(undefined)).toBeUndefined();
        expect(toBoolean(NaN)).toBeUndefined();
    });
});

describe("toInteger", () => {
    test("returns integers as is", () => {
        expect(toInteger(-1)).toBe(-1);
        expect(toInteger(0)).toBe(0);
        expect(toInteger(123)).toBe(123);
    });

    test("converts floats to integers", () => {
        expect(toInteger(123.456)).toBe(123);
        expect(toInteger(true)).toBe(1);
        expect(toInteger(false)).toBe(0);
    });

    test("converts dates to integers", () => {
        const date = new Date();

        expect(toInteger(date)).toBe(date.getTime());
    });

    test("converts valid strings to integers", () => {
        expect(toInteger("-1")).toBe(-1);
        expect(toInteger("-1.23")).toBe(-1);
        expect(toInteger("123")).toBe(123);
        expect(toInteger("123.456")).toBe(123);
    });

    test("converts booleans to integers", () => {
        expect(toInteger(true)).toBe(1);
        expect(toInteger(false)).toBe(0);
    });

    test("returns undefined for invalid values", () => {
        expect(toInteger("invalid")).toBeUndefined();
        expect(toInteger(null)).toBeUndefined();
        expect(toInteger(undefined)).toBeUndefined();
        expect(toInteger(NaN)).toBeUndefined();
    });
});

describe("toFloat", () => {
    test("returns numbers as is", () => {
        expect(toFloat(-1)).toBe(-1);
        expect(toFloat(0)).toBe(0);
        expect(toFloat(123)).toBe(123);
        expect(toFloat(123.456)).toBe(123.456);
    });

    test("converts dates to floats", () => {
        const date = new Date();

        expect(toFloat(date)).toBe(date.valueOf());
    });

    test("converts valid strings to floats", () => {
        expect(toFloat("-1")).toBe(-1);
        expect(toFloat("-1.23")).toBe(-1.23);
        expect(toFloat("123")).toBe(123);
        expect(toFloat("123.456")).toBe(123.456);
    });

    test("converts booleans to floats", () => {
        expect(toFloat(true)).toBe(1);
        expect(toFloat(false)).toBe(0);
    });

    test("returns undefined for invalid values", () => {
        expect(toFloat("invalid")).toBeUndefined();
        expect(toFloat(null)).toBeUndefined();
        expect(toFloat(undefined)).toBeUndefined();
        expect(toFloat(NaN)).toBeUndefined();
    });
});

describe("toDate", () => {
    test("returns dates as is", () => {
        const date = new Date("1856-07-10T12:34:56.000Z");

        expect(toDate(date)).toEqual(date);
    });

    test("converts valid values to Date objects", () => {
        const date = new Date("1856-07-10T12:34:56.000Z");

        expect(toDate(date.toISOString())).toEqual(date);
        expect(toDate(date.getTime())).toEqual(date);
    });

    test("returns undefined for invalid values", () => {
        expect(toDate(new Date("not a date"))).toBeUndefined();
        expect(toDate("invalid")).toBeUndefined();
        expect(toDate(null)).toBeUndefined();
        expect(toDate(undefined)).toBeUndefined();
        expect(toDate(NaN)).toBeUndefined();
    });
});

describe("toRegExp", () => {
    test("returns RegExps as is", () => {
        const regex = /test/i;

        expect(toRegExp(regex)).toEqual(regex);
    });

    test("converts valid string values to RegExp objects", () => {
        const regex = /test/i;

        expect(toRegExp(regex.toString())).toEqual(regex);
    });

    test("returns undefined for invalid values", () => {
        expect(toDate("invalid")).toBeUndefined();
        expect(toDate("/invalid")).toBeUndefined();
        expect(toDate(null)).toBeUndefined();
        expect(toDate(undefined)).toBeUndefined();
        expect(toDate(NaN)).toBeUndefined();
    });
});

describe("toType", () => {
    describe("via 'typeof' type name", () => {
        test("converts an object to a string", () => {
            expect(toType("string", "string")).toBe("string");
            expect(toType(123, "string")).toBe("123");
            expect(toType(true, "string")).toBe("true");
            expect(toType(false, "string")).toBe("false");
            expect(toType(new Date("1856-07-10T12:34:56.000Z"), "string")).toBe(new Date("1856-07-10T12:34:56.000Z").toString());
            expect(toType(/\d/, "string")).toBe(String(/\d/));
        });

        test("converts an object to a number", () => {
            expect(toType(123, "number")).toBe(123);
            expect(toType(123.456, "number")).toBe(123.456);
            expect(toType("123", "number")).toBe(123);
            expect(toType("123.456", "number")).toBe(123.456);
            expect(toType(false, "number")).toBe(0);
            expect(toType(true, "number")).toBe(1);
            expect(toType(new Date("1856-07-10T12:34:56.000Z"), "number")).toBe(new Date("1856-07-10T12:34:56.000Z").getTime());
        });

        test("converts an object to a boolean", () => {
            expect(toType(true, "boolean")).toBe(true);
            expect(toType(false, "boolean")).toBe(false);
            expect(toType(1, "boolean")).toBe(true);
            expect(toType(0, "boolean")).toBe(false);
            expect(toType(123.456, "boolean")).toBe(true);
            expect(toType("true", "boolean")).toBe(true);
            expect(toType("false", "boolean")).toBe(false);
            expect(toType("TRUE", "boolean")).toBe(true);
            expect(toType("FALSE", "boolean")).toBe(false);
            expect(toType("True", "boolean")).toBe(true);
            expect(toType("False", "boolean")).toBe(false);
        });

        test("converts an object to undefined", () => {
            expect(toType(true, "undefined")).toBeUndefined();
            expect(toType(false, "undefined")).toBeUndefined();
            expect(toType("string", "undefined")).toBeUndefined();
            expect(toType({}, "undefined")).toBeUndefined();
            expect(toType(0, "undefined")).toBeUndefined();
            expect(toType(1, "undefined")).toBeUndefined();
            expect(toType(new Date(), "undefined")).toBeUndefined();
            expect(toType(/\d/, "undefined")).toBeUndefined();
        });

        test("returns undefined when conversion is not possible", () => {
            expect(toType(undefined, "string")).toBeUndefined();
            expect(toType(undefined, "number")).toBeUndefined();
            expect(toType(undefined, "boolean")).toBeUndefined();
            expect(toType(null, "string")).toBeUndefined();
            expect(toType(null, "number")).toBeUndefined();
            expect(toType(null, "boolean")).toBeUndefined();
            expect(toType(NaN, "string")).toBeUndefined();
            expect(toType(NaN, "number")).toBeUndefined();
            expect(toType(NaN, "boolean")).toBeUndefined();

            expect(toType("abc", "number")).toBeUndefined();
            expect(toType("abc", "boolean")).toBeUndefined();
            expect(toType("123", "date")).toBeUndefined();
            expect(toType("123", "void")).toBeUndefined();
        });
    });

    describe("via constructor", () => {
        test("converts an object to a string", () => {
            expect(toType("string", String)).toBe("string");
            expect(toType(123, String)).toBe("123");
            expect(toType(true, String)).toBe("true");
            expect(toType(false, String)).toBe("false");
            expect(toType(new Date("1856-07-10T12:34:56.000Z"), String)).toBe(new Date("1856-07-10T12:34:56.000Z").toString());
            expect(toType(/\d/, String)).toBe(String(/\d/));
        });

        test("converts an object to a number", () => {
            expect(toType(123, Number)).toBe(123);
            expect(toType(123.456, Number)).toBe(123.456);
            expect(toType("123", Number)).toBe(123);
            expect(toType("123.456", Number)).toBe(123.456);
            expect(toType(false, Number)).toBe(0);
            expect(toType(true, Number)).toBe(1);
            expect(toType(new Date("1856-07-10T12:34:56.000Z"), Number)).toBe(new Date("1856-07-10T12:34:56.000Z").getTime());
        });

        test("converts an object to a boolean", () => {
            expect(toType(true, Boolean)).toBe(true);
            expect(toType(false, Boolean)).toBe(false);
            expect(toType(1, Boolean)).toBe(true);
            expect(toType(0, Boolean)).toBe(false);
            expect(toType(123.456, Boolean)).toBe(true);
            expect(toType("true", Boolean)).toBe(true);
            expect(toType("false", Boolean)).toBe(false);
            expect(toType("TRUE", Boolean)).toBe(true);
            expect(toType("FALSE", Boolean)).toBe(false);
            expect(toType("True", Boolean)).toBe(true);
            expect(toType("False", Boolean)).toBe(false);
        });

        test("converts an object to a Date", () => {
            const date = new Date("1856-07-10T12:34:56.000Z");

            expect(toType(date, Date)).toEqual(date);
            expect(toType(date.toISOString(), Date)).toEqual(date);
            expect(toType(date.getTime(), Date)).toEqual(date);
        });

        test("converts an object to a RegExp", () => {
            const regex = /^a+$/im;

            expect(toType(regex, RegExp)).toEqual(regex);
            expect(toType(String(regex), RegExp)).toEqual(regex);
        });

        test("returns undefined when conversion is not possible", () => {
            expect(toType(undefined, String)).toBeUndefined();
            expect(toType(undefined, Number)).toBeUndefined();
            expect(toType(undefined, Boolean)).toBeUndefined();
            expect(toType(undefined, Date)).toBeUndefined();
            expect(toType(undefined, RegExp)).toBeUndefined();
            expect(toType(null, String)).toBeUndefined();
            expect(toType(null, Number)).toBeUndefined();
            expect(toType(null, Boolean)).toBeUndefined();
            expect(toType(null, Date)).toBeUndefined();
            expect(toType(null, RegExp)).toBeUndefined();
            expect(toType(NaN, String)).toBeUndefined();
            expect(toType(NaN, Number)).toBeUndefined();
            expect(toType(NaN, Boolean)).toBeUndefined();
            expect(toType(NaN, Date)).toBeUndefined();
            expect(toType(NaN, RegExp)).toBeUndefined();

            expect(toType("abc", Number)).toBeUndefined();
            expect(toType("abc", Boolean)).toBeUndefined();
            expect(toType("abc", Date)).toBeUndefined();
            expect(toType("123", RegExp)).toBeUndefined();
            expect(toType("123", undefined)).toBeUndefined();
        });
    });

    describe("via globalThis type name", () => {
        test("converts an object to a string", () => {
            expect(toType("string", "String")).toBe("string");
            expect(toType(123, "String")).toBe("123");
            expect(toType(true, "String")).toBe("true");
            expect(toType(false, "String")).toBe("false");
            expect(toType(new Date("1856-07-10T12:34:56.000Z"), "String")).toBe(new Date("1856-07-10T12:34:56.000Z").toString());
            expect(toType(/\d/, "String")).toBe(String(/\d/));
        });

        test("converts an object to a number", () => {
            expect(toType(123, "Number")).toBe(123);
            expect(toType(123.456, "Number")).toBe(123.456);
            expect(toType("123", "Number")).toBe(123);
            expect(toType("123.456", "Number")).toBe(123.456);
            expect(toType(false, "Number")).toBe(0);
            expect(toType(true, "Number")).toBe(1);
            expect(toType(new Date("1856-07-10T12:34:56.000Z"), "Number")).toBe(new Date("1856-07-10T12:34:56.000Z").getTime());
        });

        test("converts an object to a boolean", () => {
            expect(toType(true, "Boolean")).toBe(true);
            expect(toType(false, "Boolean")).toBe(false);
            expect(toType(1, "Boolean")).toBe(true);
            expect(toType(0, "Boolean")).toBe(false);
            expect(toType(123.456, "Boolean")).toBe(true);
            expect(toType("true", "Boolean")).toBe(true);
            expect(toType("false", "Boolean")).toBe(false);
            expect(toType("TRUE", "Boolean")).toBe(true);
            expect(toType("FALSE", "Boolean")).toBe(false);
            expect(toType("True", "Boolean")).toBe(true);
            expect(toType("False", "Boolean")).toBe(false);
        });

        test("converts an object to a Date", () => {
            const date = new Date("1856-07-10T12:34:56.000Z");

            expect(toType(date, "Date")).toEqual(date);
            expect(toType(date.toISOString(), "Date")).toEqual(date);
            expect(toType(date.getTime(), "Date")).toEqual(date);
        });

        test("converts an object to a RegExp", () => {
            const regex = /^a+$/im;

            expect(toType(regex, "RegExp")).toEqual(regex);
            expect(toType(String(regex), "RegExp")).toEqual(regex);
        });

        test("returns undefined when conversion is not possible", () => {
            expect(toType(undefined, "String")).toBeUndefined();
            expect(toType(undefined, "Number")).toBeUndefined();
            expect(toType(undefined, "Boolean")).toBeUndefined();
            expect(toType(undefined, "Date")).toBeUndefined();
            expect(toType(undefined, "RegExp")).toBeUndefined();
            expect(toType(null, "String")).toBeUndefined();
            expect(toType(null, "Number")).toBeUndefined();
            expect(toType(null, "Boolean")).toBeUndefined();
            expect(toType(null, "Date")).toBeUndefined();
            expect(toType(null, "RegExp")).toBeUndefined();
            expect(toType(NaN, "String")).toBeUndefined();
            expect(toType(NaN, "Number")).toBeUndefined();
            expect(toType(NaN, "Boolean")).toBeUndefined();
            expect(toType(NaN, "Date")).toBeUndefined();
            expect(toType(NaN, "RegExp")).toBeUndefined();

            expect(toType("abc", "Number")).toBeUndefined();
            expect(toType("abc", "Boolean")).toBeUndefined();
            expect(toType("abc", "Date")).toBeUndefined();
            expect(toType("123", "RegExp")).toBeUndefined();
            expect(toType("123", "NotAType")).toBeUndefined();
        });
    });

    describe("from convertible object", () => {
        test("converts a value via the standard 'convert' function in a class", () => {
            const convert = jest.fn().mockImplementation(o => String(o));
            class Convertible {
                static convert(n: number): string {
                    return convert(n);
                }
            }

            expect(toType(123, Convertible)).toBe("123");
            expect(convert).toBeCalledTimes(1);
            expect(convert).toBeCalledWith(123);
        });

        test("converts a value via the standard 'convert' function", () => {
            const convertible = {
                convert: jest.fn().mockImplementation(o => String(o)),
            };

            expect(toType(123, convertible)).toBe("123");
            expect(convertible.convert).toBeCalledTimes(1);
            expect(convertible.convert).toBeCalledWith(123);
        });

        test("converts a value via a first function that start with 'convert'", () => {
            const convertible = {
                convertObjectToNumber: jest.fn().mockImplementation(o => String(o)),
            };

            expect(toType(123, convertible)).toBe("123");
            expect(convertible.convertObjectToNumber).toBeCalledTimes(1);
            expect(convertible.convertObjectToNumber).toBeCalledWith(123);
        });

        test("converts a value via the prioritized 'convert' function", () => {
            const convertible = {
                convert: jest.fn().mockImplementation(o => String(o)),
                convertObjectToNumber: jest.fn(),
                from: jest.fn(),
                fromObjectTonNumber: jest.fn(),
                parse: jest.fn(),
                parseToNumber: jest.fn(),
            };

            expect(toType(123, convertible)).toBe("123");
            expect(convertible.convert).toBeCalledTimes(1);
            expect(convertible.convert).toBeCalledWith(123);
            expect(convertible.convertObjectToNumber).not.toHaveBeenCalled();
            expect(convertible.from).not.toHaveBeenCalled();
            expect(convertible.fromObjectTonNumber).not.toHaveBeenCalled();
            expect(convertible.parse).not.toHaveBeenCalled();
            expect(convertible.parseToNumber).not.toHaveBeenCalled();
        });

        test("converts a value via the prioritized 'from' function, if 'convert' is not present", () => {
            const convertible = {
                convertObjectToNumber: jest.fn(),
                from: jest.fn().mockImplementation(o => String(o)),
                fromObjectTonNumber: jest.fn(),
                parse: jest.fn(),
                parseToNumber: jest.fn(),
            };

            expect(toType(123, convertible)).toBe("123");
            expect(convertible.from).toBeCalledTimes(1);
            expect(convertible.from).toBeCalledWith(123);
            expect(convertible.convertObjectToNumber).not.toHaveBeenCalled();
            expect(convertible.fromObjectTonNumber).not.toHaveBeenCalled();
            expect(convertible.parse).not.toHaveBeenCalled();
            expect(convertible.parseToNumber).not.toHaveBeenCalled();
        });

        test("parses a string via the prioritized 'parse' function", () => {
            const convertible = {
                convert: jest.fn(),
                convertObjectToNumber: jest.fn(),
                from: jest.fn(),
                fromObjectTonNumber: jest.fn(),
                parse: jest.fn().mockImplementation(x => +x),
                parseToNumber: jest.fn(),
            };

            expect(toType("123", convertible)).toBe(123);
            expect(convertible.parse).toBeCalledTimes(1);
            expect(convertible.parse).toBeCalledWith("123");
            expect(convertible.parseToNumber).not.toHaveBeenCalled();
            expect(convertible.convert).not.toHaveBeenCalled();
            expect(convertible.convertObjectToNumber).not.toHaveBeenCalled();
            expect(convertible.from).not.toHaveBeenCalled();
            expect(convertible.fromObjectTonNumber).not.toHaveBeenCalled();
        });

        test("returns undefined when conversion is not possible", () => {
            expect(toType(123, {})).toBeUndefined();
            expect(toType(123, { notConvertFunction: () => 42 })).toBeUndefined();
        });

        test("returns undefined instead of throwing", () => {
            const throwingConvertible = {
                convert: jest.fn().mockImplementation(() => {
                    throw new Error("Conversion is impossible");
                }),
            };
            const anotherThrowingConvertible = {
                convertNothing: jest.fn().mockImplementation(() => {
                    throw new Error("Conversion is impossible");
                }),
            };

            expect(toType(123, throwingConvertible)).toBeUndefined();
            expect(throwingConvertible.convert).toHaveBeenCalledTimes(1);
            expect(throwingConvertible.convert).toHaveBeenCalledWith(123);

            expect(toType(123, anotherThrowingConvertible)).toBeUndefined();
            expect(anotherThrowingConvertible.convertNothing).toHaveBeenCalledTimes(1);
            expect(anotherThrowingConvertible.convertNothing).toHaveBeenCalledWith(123);
        });
    });

    describe("from parsable object", () => {
        test("parses a value via the standard 'parse' function", () => {
            const parsable = {
                parse: jest.fn().mockImplementation(s => +s),
            };

            expect(toType("123", parsable)).toBe(123);
            expect(parsable.parse).toBeCalledTimes(1);
            expect(parsable.parse).toBeCalledWith("123");
        });

        test("parses a value via a first function that start with 'parse'", () => {
            const parsable = {
                parseStringToNumber: jest.fn().mockImplementation(s => +s),
            };

            expect(toType("123", parsable)).toBe(123);
            expect(parsable.parseStringToNumber).toBeCalledTimes(1);
            expect(parsable.parseStringToNumber).toBeCalledWith("123");
        });

        test("returns undefined when the input value is not a string", () => {
            const parsable = {
                parse: jest.fn().mockImplementation(s => +s),
            };
            const anotherParsable = {
                parseStringToNumber: jest.fn().mockImplementation(s => +s),
            };

            expect(toType(123, parsable)).toBeUndefined();
            expect(parsable.parse).not.toBeCalled();

            expect(toType(123, anotherParsable)).toBeUndefined();
            expect(anotherParsable.parseStringToNumber).not.toBeCalled();
        });

        test("returns undefined when conversion is not possible", () => {
            expect(toType("123", {})).toBeUndefined();
            expect(toType("123", { notParseFunction: () => 42 })).toBeUndefined();
        });

        test("returns undefined instead of throwing", () => {
            const throwingParsable = {
                parse: jest.fn().mockImplementation(() => {
                    throw new Error("Parsing is impossible");
                }),
            };
            const anotherThrowingParsable = {
                parseNothing: jest.fn().mockImplementation(() => {
                    throw new Error("Parsing is impossible");
                }),
            };

            expect(toType("123", throwingParsable)).toBeUndefined();
            expect(throwingParsable.parse).toHaveBeenCalledTimes(1);
            expect(throwingParsable.parse).toHaveBeenCalledWith("123");

            expect(toType("123", anotherThrowingParsable)).toBeUndefined();
            expect(anotherThrowingParsable.parseNothing).toHaveBeenCalledTimes(1);
            expect(anotherThrowingParsable.parseNothing).toHaveBeenCalledWith("123");
        });
    });
});
