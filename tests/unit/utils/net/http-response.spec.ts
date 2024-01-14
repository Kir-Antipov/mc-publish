import { getHeader } from "@/utils/net";
import { Blob } from "@/utils/net/blob";
import { FormData } from "@/utils/net/form-data";
import { HttpResponse } from "@/utils/net/http-response";

describe("HttpResponse", () => {
    describe("cache", () => {
        test("returns a cached HttpResponse with a reusable arrayBuffer body", async () => {
            const blob = new Blob(["blob body"]);
            const body = await blob.arrayBuffer();
            const response = HttpResponse.blob(blob);

            const cachedResponse = HttpResponse.cache(response);

            const firstRead = await cachedResponse.arrayBuffer();
            const secondRead = await cachedResponse.arrayBuffer();

            expect(firstRead).toEqual(body);
            expect(secondRead).toEqual(body);
        });

        test("returns a cached HttpResponse with a reusable blob body", async () => {
            const body = new Blob(["blob body"]);
            const response = HttpResponse.blob(body);

            const cachedResponse = HttpResponse.cache(response);

            const firstRead = await cachedResponse.blob();
            const secondRead = await cachedResponse.blob();

            expect(firstRead).toEqual(body);
            expect(secondRead).toEqual(body);
        });

        test("returns a cached HttpResponse with a reusable formData body", async () => {
            const body = new FormData();
            body.append("key", "value");
            const response = HttpResponse.formData(body);

            const cachedResponse = HttpResponse.cache(response);

            const firstRead = await cachedResponse.formData();
            const secondRead = await cachedResponse.formData();

            expect(firstRead).toEqual(body);
            expect(secondRead).toEqual(body);
        });

        test("returns a cached HttpResponse with a reusable json body", async () => {
            const body = { key: "value" };
            const response = HttpResponse.json(body);

            const cachedResponse = HttpResponse.cache(response);

            const firstRead = await cachedResponse.json();
            const secondRead = await cachedResponse.json();

            expect(firstRead).toEqual(body);
            expect(secondRead).toEqual(body);
        });

        test("returns a cached HttpResponse with a reusable text body", async () => {
            const body = "response body";
            const response = HttpResponse.text(body);

            const cachedResponse = HttpResponse.cache(response);

            const firstRead = await cachedResponse.text();
            const secondRead = await cachedResponse.text();

            expect(firstRead).toBe(body);
            expect(secondRead).toBe(body);
        });
    });

    describe("blob", () => {
        test("creates a new HttpResponse with a Blob body", async () => {
            const blob = new Blob(["blob body"]);

            const response = HttpResponse.blob(blob);
            const body = await response.blob();

            expect(body).toEqual(blob);
        });

        test("sets the Content-Type header to 'application/octet-stream'", async () => {
            const blob = new Blob(["blob body"]);

            const response = HttpResponse.blob(blob);
            const body = await response.blob();

            expect(body).toEqual(blob);
            expect(getHeader(response.headers, "Content-Type")).toBe("application/octet-stream");
        });

        test("uses the provided options to configure the response", async () => {
            const blob = new Blob(["blob body"]);
            const options = { status: 200, statusText: "OK", headers: { "X-Custom-Header": "Custom Value" } };

            const response = HttpResponse.blob(blob, options);
            const body = await response.blob();

            expect(body).toEqual(blob);
            expect(response.status).toBe(options.status);
            expect(response.statusText).toBe(options.statusText);
            expect(getHeader(response.headers, "X-Custom-Header")).toBe(options.headers["X-Custom-Header"]);
        });
    });

    describe("formData", () => {
        test("creates a new HttpResponse with a FormData body", async () => {
            const formData = new FormData();
            formData.append("key", "value");

            const response = HttpResponse.formData(formData);
            const body = await response.formData();

            expect(body).toEqual(formData);
        });

        test("sets the Content-Type header to 'multipart/form-data'", async () => {
            const formData = new FormData();
            formData.append("key", "value");

            const response = HttpResponse.formData(formData);
            const body = await response.formData();

            expect(body).toEqual(formData);
            expect(getHeader(response.headers, "Content-Type")).toMatch("multipart/form-data");
        });

        test("uses the provided options to configure the response", async () => {
            const formData = new FormData();
            formData.append("key", "value");
            const options = { status: 200, statusText: "OK", headers: { "X-Custom-Header": "Custom Value" } };

            const response = HttpResponse.formData(formData, options);
            const body = await response.formData();

            expect(body).toEqual(formData);
            expect(response.status).toBe(options.status);
            expect(response.statusText).toBe(options.statusText);
            expect(getHeader(response.headers, "X-Custom-Header")).toBe(options.headers["X-Custom-Header"]);
        });
    });

    describe("json", () => {
        test("creates a new HttpResponse with a JSON body", async () => {
            const data = { key: "value" };

            const response = HttpResponse.json(data);
            const body = await response.json();

            expect(body).toEqual(data);
        });

        test("sets the Content-Type header to 'application/json'", async () => {
            const data = { key: "value" };

            const response = HttpResponse.json(data);
            const body = await response.json();

            expect(body).toEqual(data);
            expect(getHeader(response.headers, "Content-Type")).toBe("application/json");
        });

        test("uses the provided options to configure the response", async () => {
            const data = { key: "value" };
            const options = { status: 200, statusText: "OK", headers: { "X-Custom-Header": "Custom Value" } };

            const response = HttpResponse.json(data, options);
            const body = await response.json();

            expect(body).toEqual(data);
            expect(response.status).toBe(options.status);
            expect(response.statusText).toBe(options.statusText);
            expect(getHeader(response.headers, "X-Custom-Header")).toBe(options.headers["X-Custom-Header"]);
        });

        test("serializes non-string data as JSON", async () => {
            const data = { key: "value" };

            const response = HttpResponse.json(data);
            const body = await response.text();

            expect(body).toBe(JSON.stringify(data));
        });

        test("does not serialize string data", async () => {
            const data = JSON.stringify({ key: "value" });

            const response = HttpResponse.json(data);
            const body = await response.text();

            expect(body).toBe(data);
        });
    });

    describe("text", () => {
        test("creates a new HttpResponse with a text body", async () => {
            const text = "response text";

            const response = HttpResponse.text(text);
            const body = await response.text();

            expect(body).toBe(text);
        });

        test("sets the Content-Type header to 'text/plain'", async () => {
            const text = "response text";

            const response = HttpResponse.text(text);
            const body = await response.text();

            expect(body).toBe(text);
            expect(getHeader(response.headers, "Content-Type")).toBe("text/plain");
        });

        test("uses the provided options to configure the response", async () => {
            const text = "response text";
            const options = { status: 200, statusText: "OK", headers: { "X-Custom-Header": "Custom Value" } };

            const response = HttpResponse.text(text, options);
            const body = await response.text();

            expect(body).toBe(text);
            expect(response.status).toBe(options.status);
            expect(response.statusText).toBe(options.statusText);
            expect(getHeader(response.headers, "X-Custom-Header")).toBe(options.headers["X-Custom-Header"]);
        });
    });

    describe("redirect", () => {
        test("creates a new HttpResponse with a redirection status", () => {
            const url = "http://example.com";
            const options = { status: 302 };

            const response = HttpResponse.redirect(url, options);

            expect(response.status).toBe(options.status);
            expect(getHeader(response.headers, "Location")).toBe(url);
        });

        test("uses the provided options to configure the response", () => {
            const url = "http://example.com";
            const options = { status: 301, statusText: "Moved Permanently", headers: { "X-Custom-Header": "Custom Value" } };

            const response = HttpResponse.redirect(url, options);

            expect(response.status).toBe(options.status);
            expect(response.statusText).toBe(options.statusText);
            expect(getHeader(response.headers, "Location")).toBe(url);
            expect(getHeader(response.headers, "X-Custom-Header")).toBe(options.headers["X-Custom-Header"]);
        });
    });

    describe("error", () => {
        test("creates a new HttpResponse representing an error", async () => {
            const response = HttpResponse.error();

            await expect(response.text).rejects.toThrow();
            expect(response.ok).toBe(false);
            expect(response.status).toBe(0);
            expect(response.statusText).toBe("");
        });
    });
});
