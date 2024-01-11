import { getHeader } from "@/utils/net";
import { Blob } from "@/utils/net/blob";
import { FormData, isFormData } from "@/utils/net/form-data";
import { isURLSearchParams } from "@/utils/net/query-string";
import { HttpRequest } from "@/utils/net/http-request";

describe("HttpRequest", () => {
    describe("get", () => {
        test("creates a new GET request", () => {
            const request = HttpRequest.get({ referrerPolicy: "same-origin" });

            expect(request).toBeDefined();
            expect(request.method).toBe("GET");
            expect(request.referrerPolicy).toBe("same-origin");
        });
    });

    describe("post", () => {
        test("creates a new POST request", () => {
            const request = HttpRequest.post({ referrerPolicy: "same-origin" });

            expect(request).toBeDefined();
            expect(request.method).toBe("POST");
            expect(request.referrerPolicy).toBe("same-origin");
        });
    });

    describe("patch", () => {
        test("creates a new PATCH request", () => {
            const request = HttpRequest.patch({ referrerPolicy: "same-origin" });

            expect(request).toBeDefined();
            expect(request.method).toBe("PATCH");
            expect(request.referrerPolicy).toBe("same-origin");
        });
    });

    describe("put", () => {
        test("creates a new PUT request", () => {
            const request = HttpRequest.put({ referrerPolicy: "same-origin" });

            expect(request).toBeDefined();
            expect(request.method).toBe("PUT");
            expect(request.referrerPolicy).toBe("same-origin");
        });
    });

    describe("delete", () => {
        test("creates a new DELETE request", () => {
            const request = HttpRequest.delete({ referrerPolicy: "same-origin" });

            expect(request).toBeDefined();
            expect(request.method).toBe("DELETE");
            expect(request.referrerPolicy).toBe("same-origin");
        });
    });
});

describe("HttpRequestBuilder", () => {
    describe("with", () => {
        test("sets the request data as URL parameters for GET requests when data is a string", () => {
            const builder = HttpRequest.get();
            const data = "param1=value1&param2=value2";

            const request = builder.with(data);
            const urlParams = request.body as URLSearchParams;

            expect(isURLSearchParams(urlParams)).toBe(true);
            expect(urlParams.get("param1")).toBe("value1");
            expect(urlParams.get("param2")).toBe("value2");
        });

        test("sets the request data as plain text for non-GET requests when data is a string", () => {
            const builder = HttpRequest.post();
            const data = "request body";

            const request = builder.with(data);

            expect(request.body).toBe(data);
            expect(getHeader(request.headers, "Content-Type")).toBe("text/plain");
        });

        test("sets the request data as URL parameters for GET requests when data is an iterable", () => {
            const builder = HttpRequest.get();
            const data = [["param1", "value1"], ["param2", "value2"]];

            const request = builder.with(data);
            const urlParams = request.body as URLSearchParams;

            expect(isURLSearchParams(urlParams)).toBe(true);
            expect(urlParams.get("param1")).toBe("value1");
            expect(urlParams.get("param2")).toBe("value2");
        });

        test("sets the request data as FormData for non-GET requests when data is an iterable", () => {
            const builder = HttpRequest.post();
            const data = [["field1", "value1"], ["field2", "value2"]];

            const request = builder.with(data);
            const formData = request.body as FormData;

            expect(isFormData(formData)).toBe(true);
            expect(formData.get("field1")).toBe("value1");
            expect(formData.get("field2")).toBe("value2");
        });

        test("sets the request data as URL parameters for GET requests when data is a record", () => {
            const builder = HttpRequest.get();
            const data = { param1: "value1", param2: "value2" };

            const request = builder.with(data);
            const urlParams = request.body as URLSearchParams;

            expect(isURLSearchParams(urlParams)).toBe(true);
            expect(urlParams.get("param1")).toBe("value1");
            expect(urlParams.get("param2")).toBe("value2");
        });

        test("sets the request data as FormData for non-GET requests when data is a record", () => {
            const builder = HttpRequest.post();
            const data = { field1: "value1", field2: "value2" };

            const request = builder.with(data);
            const formData = request.body as FormData;

            expect(isFormData(formData)).toBe(true);
            expect(formData.get("field1")).toBe("value1");
            expect(formData.get("field2")).toBe("value2");
        });

        test("sets the request data directly when data is a valid HttpRequestBody", () => {
            const builder = HttpRequest.post();
            const data = new Blob(["blob content"]);

            const request = builder.with(data);

            expect(request.body).toBe(data);
            expect(getHeader(request.headers, "Content-Type")).toBe("application/octet-stream");
            expect(getHeader(request.headers, "Content-Length")).toBe(String(data.size));
        });
    });

    describe("urlParams", () => {
        test("sets the request URL parameters when params is a URLSearchParams instance", () => {
            const builder = HttpRequest.get();
            const params = new URLSearchParams("param1=value1&param2=value2");

            const request = builder.urlParams(params);
            const urlParams = request.body as URLSearchParams;

            expect(isURLSearchParams(urlParams)).toBe(true);
            expect(urlParams.get("param1")).toBe("value1");
            expect(urlParams.get("param2")).toBe("value2");
        });

        test("sets the request URL parameters when params is a string", () => {
            const builder = HttpRequest.get();
            const params = "param1=value1&param2=value2";

            const request = builder.urlParams(params);
            const urlParams = request.body as URLSearchParams;

            expect(isURLSearchParams(urlParams)).toBe(true);
            expect(urlParams.get("param1")).toBe("value1");
            expect(urlParams.get("param2")).toBe("value2");
        });

        test("sets the request URL parameters when params is an iterable", () => {
            const builder = HttpRequest.get();
            const params = [["param1", "value1"], ["param2", "value2"]];

            const request = builder.urlParams(params);
            const urlParams = request.body as URLSearchParams;

            expect(isURLSearchParams(urlParams)).toBe(true);
            expect(urlParams.get("param1")).toBe("value1");
            expect(urlParams.get("param2")).toBe("value2");
        });

        test("sets the request URL parameters when params is a record", () => {
            const builder = HttpRequest.get();
            const params = { param1: "value1", param2: "value2" };

            const request = builder.urlParams(params);
            const urlParams = request.body as URLSearchParams;

            expect(isURLSearchParams(urlParams)).toBe(true);
            expect(urlParams.get("param1")).toBe("value1");
            expect(urlParams.get("param2")).toBe("value2");
        });
    });

    describe("formData", () => {
        test("sets the request body as FormData when data is a FormData instance", () => {
            const builder = HttpRequest.post();
            const data = new FormData();
            data.append("field1", "value1");
            data.append("field2", "value2");

            const request = builder.formData(data);
            const formData = request.body as FormData;

            expect(isFormData(formData)).toBe(true);
            expect(formData.get("field1")).toBe("value1");
            expect(formData.get("field2")).toBe("value2");
        });

        test("converts and sets the request body as FormData when data is an iterable", () => {
            const builder = HttpRequest.post();
            const data = [["field1", "value1"], ["field2", "value2"]];

            const request = builder.formData(data);
            const formData = request.body as FormData;

            expect(isFormData(formData)).toBe(true);
            expect(formData.get("field1")).toBe("value1");
            expect(formData.get("field2")).toBe("value2");
        });

        test("converts and sets the request body as FormData when data is a record", () => {
            const builder = HttpRequest.post();
            const data = { field1: "value1", field2: "value2" };

            const request = builder.formData(data);
            const formData = request.body as FormData;

            expect(isFormData(formData)).toBe(true);
            expect(formData.get("field1")).toBe("value1");
            expect(formData.get("field2")).toBe("value2");
        });
    });

    describe("json", () => {
        test("sets the request body as a JSON string when obj is a string", () => {
            const builder = HttpRequest.post();
            const obj = JSON.stringify({ field1: "value1", field2: "value2" });

            const request = builder.json(obj);

            expect(request.body).toBe(obj);
            expect(getHeader(request.headers, "Content-Type")).toBe("application/json");
        });

        test("sets the request body as a JSON string when obj is an object", () => {
            const builder = HttpRequest.post();
            const obj = { field1: "value1", field2: "value2" };

            const request = builder.json(obj);

            expect(request.body).toBe(JSON.stringify(obj));
            expect(getHeader(request.headers, "Content-Type")).toBe("application/json");
        });
    });

    describe("text", () => {
        test("sets the request body as a plain text string", () => {
            const builder = HttpRequest.post();
            const text = "Foo";

            const request = builder.text(text);

            expect(request.body).toBe(text);
            expect(getHeader(request.headers, "Content-Type")).toBe("text/plain");
        });
    });

    describe("abort", () => {
        test("sets an AbortSignal to cancel the request", () => {
            const builder = HttpRequest.post();
            const controller = new AbortController();
            const signal = controller.signal;

            const request = builder.abort(signal);

            expect(request.signal).toBe(signal);
            expect(request.signal.aborted).toBe(false);

            controller.abort();

            expect(request.signal.aborted).toBe(true);
        });
    });

    describe("timeout", () => {
        test("sets an AbortSignal with a timeout to cancel the request", () => {
            const builder = HttpRequest.post();
            const abortDelay = 5000;

            const result = builder.timeout(abortDelay);

            expect(result.signal).toBeDefined();
            expect(result.signal.aborted).toBe(false);
        });
    });

    describe("header", () => {
        test("sets a single request header", () => {
            const builder = HttpRequest.get();
            const headerName = "Content-Type";
            const headerValue = "application/json";

            builder.header(headerName, headerValue);

            expect(builder.headers).toBeDefined();
            expect(getHeader(builder.headers, headerName)).toBe(headerValue);
        });

        test("overwrites an existing header with the same name", () => {
            const builder = HttpRequest.get();
            const headerName = "Content-Type";
            const firstHeaderValue = "text/plain";
            const secondHeaderValue = "application/json";

            builder.header(headerName, firstHeaderValue);
            builder.header(headerName, secondHeaderValue);

            expect(getHeader(builder.headers, headerName)).toBe(secondHeaderValue);
        });

        test("maintains previously set headers when a new one is added", () => {
            const builder = HttpRequest.get();
            const firstHeaderName = "Content-Type";
            const firstHeaderValue = "application/json";
            const secondHeaderName = "Accept";
            const secondHeaderValue = "application/json";

            builder.header(firstHeaderName, firstHeaderValue);
            builder.header(secondHeaderName, secondHeaderValue);

            expect(getHeader(builder.headers, firstHeaderName)).toBe(firstHeaderValue);
            expect(getHeader(builder.headers, secondHeaderName)).toBe(secondHeaderValue);
        });
    });
});
