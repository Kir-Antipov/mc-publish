import {
    httpMethodEquals,
    canHttpMethodAcceptBody,
    isGetHttpMethod,
    isPostHttpMethod,
    isPutHttpMethod,
    isPatchHttpMethod,
    isDeleteHttpMethod,
    isOptionsHttpMethod,
    isHeadHttpMethod,
    isConnectHttpMethod,
    isTraceHttpMethod,
} from "@/utils/net/http-method";

describe("httpMethodEquals", () => {
    test("returns true for same HTTP methods", () => {
        expect(httpMethodEquals("GET", "GET")).toBe(true);
        expect(httpMethodEquals("POST", "POST")).toBe(true);
        expect(httpMethodEquals("PUT", "PUT")).toBe(true);
    });

    test("returns true if both HTTP methods represent GET", () => {
        expect(httpMethodEquals(undefined, "GET")).toBe(true);
        expect(httpMethodEquals("GET", null)).toBe(true);
        expect(httpMethodEquals("GET", "")).toBe(true);
    });

    test("returns false for different HTTP methods", () => {
        expect(httpMethodEquals("GET", "POST")).toBe(false);
        expect(httpMethodEquals("PUT", "PATCH")).toBe(false);
        expect(httpMethodEquals("OPTIONS", "HEAD")).toBe(false);
    });
});

describe("canHttpMethodAcceptBody", () => {
    test("returns true for POST method", () => {
        expect(canHttpMethodAcceptBody("POST")).toBe(true);
    });

    test("returns false for GET method", () => {
        expect(canHttpMethodAcceptBody("GET")).toBe(false);
    });
});

describe("isGetHttpMethod", () => {
    test("returns true for GET method", () => {
        expect(isGetHttpMethod("GET")).toBe(true);
    });

    test("returns true for unspecified values", () => {
        expect(isGetHttpMethod(undefined)).toBe(true);
        expect(isGetHttpMethod(null)).toBe(true);
        expect(isGetHttpMethod("")).toBe(true);
    });

    test("returns false for non-GET method", () => {
        expect(isGetHttpMethod("POST")).toBe(false);
    });
});

describe("isPostHttpMethod", () => {
    test("returns true for POST method", () => {
        expect(isPostHttpMethod("POST")).toBe(true);
    });

    test("returns false for non-POST method", () => {
        expect(isPostHttpMethod("GET")).toBe(false);
    });
});

describe("isPutHttpMethod", () => {
    test("returns true for PUT method", () => {
        expect(isPutHttpMethod("PUT")).toBe(true);
    });

    test("returns false for non-PUT method", () => {
        expect(isPutHttpMethod("GET")).toBe(false);
    });
});

describe("isPatchHttpMethod", () => {
    test("returns true for PATCH method", () => {
        expect(isPatchHttpMethod("PATCH")).toBe(true);
    });

    test("returns false for non-PATCH method", () => {
        expect(isPatchHttpMethod("GET")).toBe(false);
    });
});

describe("isDeleteHttpMethod", () => {
    test("returns true for DELETE method", () => {
        expect(isDeleteHttpMethod("DELETE")).toBe(true);
    });

    test("returns false for non-DELETE method", () => {
        expect(isDeleteHttpMethod("GET")).toBe(false);
    });
});

describe("isOptionsHttpMethod", () => {
    test("returns true for OPTIONS method", () => {
        expect(isOptionsHttpMethod("OPTIONS")).toBe(true);
    });

    test("returns false for non-DELETE method", () => {
        expect(isOptionsHttpMethod("GET")).toBe(false);
    });
});

describe("isHeadHttpMethod", () => {
    test("returns true for HEAD method", () => {
        expect(isHeadHttpMethod("HEAD")).toBe(true);
    });

    test("returns false for non-DELETE method", () => {
        expect(isHeadHttpMethod("GET")).toBe(false);
    });
});

describe("isConnectHttpMethod", () => {
    test("returns true for CONNECT method", () => {
        expect(isConnectHttpMethod("CONNECT")).toBe(true);
    });

    test("returns false for non-DELETE method", () => {
        expect(isConnectHttpMethod("GET")).toBe(false);
    });
});

describe("isTraceHttpMethod", () => {
    test("returns true for TRACE method", () => {
        expect(isTraceHttpMethod("TRACE")).toBe(true);
    });

    test("returns false for non-DELETE method", () => {
        expect(isTraceHttpMethod("GET")).toBe(false);
    });
});
