import { HttpResponse } from "@/utils/net/http-response";
import { HttpError } from "@/utils/errors";
import { defaultResponse, simpleCache, throwOnError } from "@/utils/net/fetch-middlewares";

describe("defaultResponse", () => {
    test("returns default response when filter condition is met", async () => {
        const middleware = defaultResponse({
            filter: x => x.status === 404,
            response: x => HttpResponse.text("Foo", x),
        });

        const next = jest.fn().mockResolvedValue(HttpResponse.text("Foo", { status: 404 }));
        const response = await middleware("http://example.com/", {}, next);
        const responseText = await response.text();

        expect(next).toBeCalledWith("http://example.com/", {});
        expect(response.status).toBe(404);
        expect(responseText).toBe("Foo");
    });

    test("returns original response when filter condition is not met", async () => {
        const middleware = defaultResponse({
            filter: x => x.status === 404,
            response: x => HttpResponse.text("Foo", x),
        });

        const next = jest.fn().mockResolvedValue(HttpResponse.text("Success", { status: 200 }));
        const response = await middleware("http://example.com/", {}, next);
        const responseText = await response.text();

        expect(next).toBeCalledWith("http://example.com/", {});
        expect(response.status).toBe(200);
        expect(responseText).toBe("Success");
    });

    test("uses default filter and response factory when options are not provided", async () => {
        const middleware = defaultResponse();

        const next = jest.fn().mockResolvedValue(HttpResponse.text("Foo", { status: 404 }));
        const response = await middleware("http://example.com/", {}, next);
        const responseText = await response.text();

        expect(next).toBeCalledWith("http://example.com/", {});
        expect(response.status).toBe(404);
        expect(responseText).toBe("");
    });
});

describe("throwOnError", () => {
    test("throws error when filter condition is met", async () => {
        const middleware = throwOnError({
            filter: x => x.status === 404,
            error: x => new Error(`HTTP Error: ${x.status}`),
        });

        const next = jest.fn().mockResolvedValue(HttpResponse.text("Foo", { status: 404 }));
        const responsePromise = middleware("http://example.com/", {}, next);

        await expect(responsePromise).rejects.toThrow("HTTP Error: 404");
        expect(next).toBeCalledWith("http://example.com/", {});
    });

    test("returns original response when filter condition is not met", async () => {
        const middleware = throwOnError({
            filter: x => x.status === 404,
            error: x => new Error(`HTTP Error: ${x.status}`),
        });

        const next = jest.fn().mockResolvedValue(HttpResponse.text("Success", { status: 200 }));
        const response = await middleware("http://example.com/", {}, next);
        const responseText = await response.text();

        expect(next).toBeCalledWith("http://example.com/", {});
        expect(response.status).toBe(200);
        expect(responseText).toBe("Success");
    });

    test("uses default filter and error factory when options are not provided", async () => {
        const middleware = throwOnError();

        const next = jest.fn().mockResolvedValue(HttpResponse.text("Foo", { status: 404 }));
        const responsePromise = middleware("http://example.com/", {}, next);

        await expect(responsePromise).rejects.toThrow(HttpError);
        expect(next).toBeCalledWith("http://example.com/", {});
    });
});

describe("simpleCache", () => {
    test("returns cached response when filter condition is met", async () => {
        const middleware = simpleCache({
            filter: url => String(url).includes("useCache=true"),
            comparer: ([urlA, { method: methodA }], [urlB, { method: methodB }]) => String(urlA) === String(urlB) && methodA === methodB,
        });

        const next = jest.fn().mockResolvedValue(HttpResponse.text("Cached", { status: 200 }));

        const response1 = await middleware("http://example.com/?useCache=true", {}, next);
        const responseText1 = await response1.text();

        const response2 = await middleware("http://example.com/?useCache=true", {}, next);
        const responseText2 = await response2.text();

        expect(next).toBeCalledTimes(1);
        expect(response1.status).toBe(200);
        expect(responseText1).toBe("Cached");
        expect(response2.status).toBe(200);
        expect(responseText2).toBe("Cached");
    });

    test("returns new response when filter condition is not met", async () => {
        const middleware = simpleCache({
            filter: url => String(url).includes("useCache=true"),
            comparer: ([urlA, { method: methodA }], [urlB, { method: methodB }]) => String(urlA) === String(urlB) && methodA === methodB,
        });

        const next = jest.fn().mockImplementation(() => Promise.resolve(HttpResponse.text("Not Cached", { status: 200 })));

        const response1 = await middleware("http://example.com/", {}, next);
        const responseText1 = await response1.text();

        const response2 = await middleware("http://example.com/", {}, next);
        const responseText2 = await response2.text();

        expect(next).toBeCalledTimes(2);
        expect(response1.status).toBe(200);
        expect(responseText1).toBe("Not Cached");
        expect(response2.status).toBe(200);
        expect(responseText2).toBe("Not Cached");
    });

    test("uses default filter and comparer when options are not provided", async () => {
        const middleware = simpleCache();

        const next = jest.fn().mockResolvedValue(HttpResponse.text("Cached", { status: 200 }));

        const response1 = await middleware("http://example.com/?cache=true", {}, next);
        const responseText1 = await response1.text();

        const response2 = await middleware("http://example.com/?cache=true", {}, next);
        const responseText2 = await response2.text();

        expect(next).toBeCalledTimes(1);
        expect(response1.status).toBe(200);
        expect(responseText1).toBe("Cached");
        expect(response2.status).toBe(200);
        expect(responseText2).toBe("Cached");
    });
});
