import { HttpResponse } from "@/utils/net/http-response";
import { getHeader } from "@/utils/net/headers";
import { createFetch, fetch, fetchDestinationEquals } from "@/utils/net/fetch";

describe("fetch", () => {
    test("is defined", () => {
        expect(fetch).toBeDefined();
    });

    test("is able to access the Internet", async () => {
        const response = await fetch("https://google.com/");

        expect(response.ok).toBe(true);
    });
});

describe("createFetch", () => {
    test("returns a new fetch instance", () => {
        const fetchInstance = createFetch();

        expect(typeof fetchInstance).toBe("function");
        expect(fetchInstance).not.toBe(fetch);
        expect(fetchInstance).toHaveProperty("baseUrl");
        expect(fetchInstance).toHaveProperty("defaultHeaders");
        expect(fetchInstance).toHaveProperty("use");
    });

    test("creates a configured fetch instance", async () => {
        const handler = jest.fn().mockResolvedValueOnce(HttpResponse.text("Success", { status: 200 }));
        const fetchInstance = createFetch({
            handler,
            baseUrl: "http://example.com",
            defaultHeaders: { "X-Test": "Test" },
        });

        const response = await fetchInstance("/foo");
        const responseText = await response.text();

        expect(fetchInstance).not.toBe(fetch);
        expect(fetchInstance.baseUrl).toBe("http://example.com");
        expect(getHeader(fetchInstance.defaultHeaders, "X-Test")).toBe("Test");
        expect(response.status).toBe(200);
        expect(responseText).toBe("Success");
        expect(handler).toBeCalledTimes(1);
        expect(handler).toBeCalledWith(new URL("http://example.com/foo"), { headers: { "X-Test": "Test" } });
    });

    test("uses default options when not provided", () => {
        const fetchInstance = createFetch();

        expect(fetchInstance).not.toBe(fetch);
        expect(fetchInstance.baseUrl).toBeUndefined();
        expect(fetchInstance.defaultHeaders).toBeDefined();
    });

    test("configured fetch executes a middleware pipeline on call", async () => {
        const handler = jest.fn().mockResolvedValueOnce(HttpResponse.text("Success", { status: 200 }));
        const middleware = jest.fn().mockImplementation((url, request, next) => next(url, request));
        const fetchInstance = createFetch({ handler }).use(middleware);

        const response = await fetchInstance("http://example.com");
        const responseText = await response.text();

        expect(fetchInstance).not.toBe(fetch);
        expect(response.status).toBe(200);
        expect(responseText).toBe("Success");
        expect(handler).toBeCalledTimes(1);
        expect(handler).toBeCalledWith("http://example.com", undefined);
        expect(middleware).toBeCalledTimes(1);
        expect(middleware).toBeCalledWith("http://example.com", undefined, expect.anything());
    });
});

describe("fetchDestinationEquals", () => {
    test("returns true when both URLs and methods are the same", () => {
        const result = fetchDestinationEquals(["http://example.com/foo", "GET"], ["http://example.com/foo", "GET"]);

        expect(result).toBe(true);
    });

    test("returns true when both URLs are the same and methods represent the 'GET' method", () => {
        const result = fetchDestinationEquals(["http://example.com/foo", "GET"], ["http://example.com/foo", "" as "GET"]);

        expect(result).toBe(true);
    });

    test("returns false when URLs are different", () => {
        const result = fetchDestinationEquals(["http://example.com/foo", "GET"], ["http://example.com/bar", "GET"]);

        expect(result).toBe(false);
    });

    test("returns false when methods are different", () => {
        const result = fetchDestinationEquals(["http://example.com/foo", "GET"], ["http://example.com/foo", "POST"]);

        expect(result).toBe(false);
    });

    test("returns true when comparing equal URLs without methods", () => {
        const result = fetchDestinationEquals("http://example.com/foo", "http://example.com/foo");

        expect(result).toBe(true);
    });

    test("returns false when comparing URLs without methods and URLs are different", () => {
        const result = fetchDestinationEquals("http://example.com/foo", "http://example.com/bar");

        expect(result).toBe(false);
    });
});
