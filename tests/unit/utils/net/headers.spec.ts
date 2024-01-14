import { createReadStream, statSync } from "node:fs";
import mockFs from "mock-fs";
import { ArrayMap, MultiMap } from "@/utils/collections/map";
import { Blob } from "@/utils/net/blob";
import { appendHeader, appendHeaders, cloneHeaders, deleteHeader, deleteHeaders, getHeader, hasHeader, inferHttpRequestBodyHeaders, setDefaultHeader, setDefaultHeaders, setHeader, setHeaders } from "@/utils/net";

beforeEach(() => {
    mockFs({
        "file.json": "{}",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("hasHeader", () => {
    test("returns true when header exists in a Record", () => {
        const headers = { "Content-Type": "application/json" };

        expect(hasHeader(headers, "Content-Type")).toBe(true);
    });

    test("returns false when header does not exist in a Record", () => {
        const headers = { "Content-Type": "application/json" };

        expect(hasHeader(headers, "Authorization")).toBe(false);
    });

    test("returns true when header exists in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];

        expect(hasHeader(headers, "Content-Type")).toBe(true);
    });

    test("returns false when header does not exist in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];

        expect(hasHeader(headers, "Authorization")).toBe(false);
    });

    test("returns true when header exists in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);

        expect(hasHeader(headers, "Content-Type")).toBe(true);
    });

    test("returns false when header does not exist in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);

        expect(hasHeader(headers, "Authorization")).toBe(false);
    });

    test("is case-sensitive by default", () => {
        const headers = { "Content-Type": "application/json" };

        expect(hasHeader(headers, "content-type")).toBe(false);
    });

    test("uses a custom comparer provided by the Map instance", () => {
        const headers = new ArrayMap([["Content-Type", "application/json"]], (a, b) => a.toLowerCase() === b.toLowerCase());

        expect(hasHeader(headers, "content-type")).toBe(true);
    });
});

describe("getHeader", () => {
    test("returns undefined when headers are not present", () => {
        expect(getHeader(null, "Content-Type")).toBeUndefined();
        expect(getHeader(undefined, "Content-Type")).toBeUndefined();
    });

    test("returns the value of the header when headers are stored in a Record", () => {
        const headers = { "Content-Type": "application/json" };

        expect(getHeader(headers, "Content-Type")).toBe("application/json");
    });

    test("returns undefined when the header does not exist in a Record", () => {
        const headers = { "Content-Type": "application/json" };

        expect(getHeader(headers, "Authorization")).toBeUndefined();
    });

    test("returns the value of the header when headers are stored in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];

        expect(getHeader(headers, "Content-Type")).toBe("application/json");
    });

    test("returns undefined when the header does not exist in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];

        expect(getHeader(headers, "Authorization")).toBeUndefined();
    });

    test("returns the value of the header when headers are stored in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);

        expect(getHeader(headers, "Content-Type")).toBe("application/json");
    });

    test("returns undefined when the header does not exist in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);

        expect(getHeader(headers, "Authorization")).toBeUndefined();
    });

    test("returns the value of the header when headers are stored in a MultiMap", () => {
        const headers = new MultiMap([["Content-Type", ["application/json", "charset=utf-8"]]]) as unknown as Map<string, string>;

        expect(getHeader(headers, "Content-Type")).toBe("application/json, charset=utf-8");
    });

    test("returns undefined when the header does not exist in a MultiMap", () => {
        const headers = new MultiMap([["Content-Type", ["application/json"]]]) as unknown as Map<string, string>;

        expect(getHeader(headers, "Authorization")).toBeUndefined();
    });
});

describe("appendHeader", () => {
    test("appends a header value when headers are stored in a Record", () => {
        const headers = { "Content-Type": "application/json" };

        const updatedHeaders = appendHeader(headers, "Content-Type", "charset=utf-8");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json, charset=utf-8");
    });

    test("appends a header value when headers are stored in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];

        const updatedHeaders = appendHeader(headers, "Content-Type", "charset=utf-8");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json, charset=utf-8");
    });

    test("appends a header value when headers are stored in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);

        const updatedHeaders = appendHeader(headers, "Content-Type", "charset=utf-8");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json, charset=utf-8");
    });

    test("appends a header value when headers are stored in a MultiMap", () => {
        const headers = new MultiMap([["Content-Type", ["application/json"]]]) as unknown as Map<string, string>;

        appendHeader(headers, "Content-Type", "charset=utf-8");

        expect(getHeader(headers, "Content-Type")).toBe("application/json, charset=utf-8");
    });

    test("creates a new header when the header does not exist", () => {
        const headers = { };

        const updatedHeaders = appendHeader(headers, "Content-Type", "application/json");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
    });
});

describe("appendHeaders", () => {
    test("appends multiple headers when headers are stored in a Record", () => {
        const headers = { "Content-Type": "application/json" };
        const newHeaders = { Authorization: "Bearer token" };

        const updatedHeaders = appendHeaders(headers, newHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("appends multiple headers when headers are stored in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];
        const newHeaders = [["Authorization", "Bearer token"]];

        const updatedHeaders = appendHeaders(headers, newHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("appends multiple headers when headers are stored in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);
        const newHeaders = new Map([["Authorization", "Bearer token"]]);

        const updatedHeaders = appendHeaders(headers, newHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("appends multiple headers when headers are stored in a MultiMap", () => {
        const headers = new MultiMap([["Content-Type", ["application/json"]]]) as unknown as Map<string, string>;
        const newHeaders = new MultiMap([["Authorization", ["Bearer token"]]]) as unknown as Map<string, string>;

        const updatedHeaders = appendHeaders(headers, newHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });
});

describe("setHeader", () => {
    test("sets a header value when headers are stored in a Record", () => {
        const headers = { "Content-Type": "application/json" };

        const updatedHeaders = setHeader(headers, "Content-Type", "text/plain");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("text/plain");
    });

    test("sets a header value when headers are stored in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];

        const updatedHeaders = setHeader(headers, "Content-Type", "text/plain");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("text/plain");
    });

    test("sets a header value when headers are stored in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);

        const updatedHeaders = setHeader(headers, "Content-Type", "text/plain");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("text/plain");
    });

    test("sets a header value when headers are stored in a MultiMap", () => {
        const headers = new MultiMap([["Content-Type", ["application/json"]]]) as unknown as Map<string, string>;

        const updatedHeaders = setHeader(headers, "Content-Type", "text/plain");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("text/plain");
    });

    test("deletes a header when the value is null or undefined", () => {
        const headers = { "Content-Type": "application/json", "Authorization": "Bearer token" };

        const updatedHeaders = setHeader(setHeader(headers, "Content-Type", null), "Authorization", undefined);

        expect(hasHeader(updatedHeaders, "Content-Type")).toBe(false);
        expect(hasHeader(updatedHeaders, "Authorization")).toBe(false);
    });
});

describe("setHeaders", () => {
    test("sets multiple headers when headers are stored in a Record", () => {
        const headers = { "Content-Type": "application/json" };
        const newHeaders = { "Authorization": "Bearer token", "Content-Type": "text/plain" };

        const updatedHeaders = setHeaders(headers, newHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("text/plain");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("sets multiple headers when headers are stored in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];
        const newHeaders = [["Authorization", "Bearer token"], ["Content-Type", "text/plain"]];

        const updatedHeaders = setHeaders(headers, newHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("text/plain");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("sets multiple headers when headers are stored in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);
        const newHeaders = new Map([["Authorization", "Bearer token"], ["Content-Type", "text/plain"]]);

        const updatedHeaders = setHeaders(headers, newHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("text/plain");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("sets multiple headers when headers are stored in a MultiMap", () => {
        const headers = new MultiMap([["Content-Type", ["application/json"]]]) as unknown as Map<string, string>;
        const newHeaders = new MultiMap([["Authorization", ["Bearer token"]], ["Content-Type", ["text/plain"]]]) as unknown as Map<string, string>;

        const updatedHeaders = setHeaders(headers, newHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("text/plain");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("deletes multiple headers when a new value is null or undefined", () => {
        const headers = { "Content-Type": "application/json", "Authorization": "Bearer token" };
        const newHeaders = { "Content-Type": null, "Authorization": undefined };

        const updatedHeaders = setHeaders(headers, newHeaders);

        expect(hasHeader(updatedHeaders, "Content-Type")).toBe(false);
        expect(hasHeader(updatedHeaders, "Authorization")).toBe(false);
    });
});

describe("setDefaultHeader", () => {
    test("does not set the header value when the header already exists in a Record", () => {
        const headers = { "Content-Type": "application/json" };

        const updatedHeaders = setDefaultHeader(headers, "Content-Type", "text/plain");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
    });

    test("sets the header value when the header does not exist in a Record", () => {
        const headers = { "Content-Type": "application/json" };

        const updatedHeaders = setDefaultHeader(headers, "Authorization", "Bearer token");

        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("does not set the header value when the header already exists in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];

        const updatedHeaders = setDefaultHeader(headers, "Content-Type", "text/plain");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
    });

    test("sets the header value when the header does not exist in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];

        const updatedHeaders = setDefaultHeader(headers, "Authorization", "Bearer token");

        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("does not set the header value when the header already exists in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);

        const updatedHeaders = setDefaultHeader(headers, "Content-Type", "text/plain");

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
    });

    test("sets the header value when the header does not exist in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);

        const updatedHeaders = setDefaultHeader(headers, "Authorization", "Bearer token");

        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });
});

describe("setDefaultHeaders", () => {
    test("does not set the header values when the headers already exist in a Record", () => {
        const headers = { "Content-Type": "application/json", "Authorization": "Bearer token" };
        const defaultHeaders = { "Content-Type": "text/plain", "Authorization": "Basic auth" };

        const updatedHeaders = setDefaultHeaders(headers, defaultHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("sets the header values when the headers do not exist in a Record", () => {
        const headers = { "Content-Type": "application/json" };
        const defaultHeaders = { Authorization: "Bearer token" };

        const updatedHeaders = setDefaultHeaders(headers, defaultHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("does not set the header values when the headers already exist in an Iterable", () => {
        const headers = [["Content-Type", "application/json"], ["Authorization", "Bearer token"]];
        const defaultHeaders = [["Content-Type", "text/plain"], ["Authorization", "Basic auth"]];

        const updatedHeaders = setDefaultHeaders(headers, defaultHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("sets the header values when the headers do not exist in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];
        const defaultHeaders = [["Authorization", "Bearer token"]];

        const updatedHeaders = setDefaultHeaders(headers, defaultHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("does not set the header values when the headers already exist in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"], ["Authorization", "Bearer token"]]);
        const defaultHeaders = new Map([["Content-Type", "text/plain"], ["Authorization", "Basic auth"]]);

        const updatedHeaders = setDefaultHeaders(headers, defaultHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });

    test("sets the header values when the headers do not exist in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);
        const defaultHeaders = new Map([["Authorization", "Bearer token"]]);

        const updatedHeaders = setDefaultHeaders(headers, defaultHeaders);

        expect(getHeader(updatedHeaders, "Content-Type")).toBe("application/json");
        expect(getHeader(updatedHeaders, "Authorization")).toBe("Bearer token");
    });
});

describe("deleteHeader", () => {
    test("deletes the header when headers are stored in a Record", () => {
        const headers = { "Content-Type": "application/json" };

        const updatedHeaders = deleteHeader(headers, "Content-Type");

        expect(hasHeader(updatedHeaders, "Content-Type")).toBe(false);
    });

    test("does not delete other headers when headers are stored in a Record", () => {
        const headers = { "Content-Type": "application/json", "Authorization": "Bearer token" };

        const updatedHeaders = deleteHeader(headers, "Content-Type");

        expect(hasHeader(updatedHeaders, "Authorization")).toBe(true);
    });

    test("deletes the header when headers are stored in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];

        const updatedHeaders = deleteHeader(headers, "Content-Type");

        expect(hasHeader(updatedHeaders, "Content-Type")).toBe(false);
    });

    test("does not delete other headers when headers are stored in an Iterable", () => {
        const headers = [["Content-Type", "application/json"], ["Authorization", "Bearer token"]];

        const updatedHeaders = deleteHeader(headers, "Content-Type");

        expect(hasHeader(updatedHeaders, "Authorization")).toBe(true);
    });

    test("deletes the header when headers are stored in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);

        const updatedHeaders = deleteHeader(headers, "Content-Type");

        expect(hasHeader(updatedHeaders, "Content-Type")).toBe(false);
    });

    test("does not delete other headers when headers are stored in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"], ["Authorization", "Bearer token"]]);

        const updatedHeaders = deleteHeader(headers, "Content-Type");

        expect(hasHeader(updatedHeaders, "Authorization")).toBe(true);
    });
});

describe("deleteHeaders", () => {
    test("deletes multiple headers when headers are stored in a Record", () => {
        const headers = { "Content-Type": "application/json", "Authorization": "Bearer token" };

        const updatedHeaders = deleteHeaders(headers, ["Content-Type", "Authorization"]);

        expect(hasHeader(updatedHeaders, "Content-Type")).toBe(false);
        expect(hasHeader(updatedHeaders, "Authorization")).toBe(false);
    });

    test("does not delete other headers when headers are stored in a Record", () => {
        const headers = { "Content-Type": "application/json", "Authorization": "Bearer token", "Accept": "application/json" };

        const updatedHeaders = deleteHeaders(headers, ["Content-Type", "Authorization"]);

        expect(hasHeader(updatedHeaders, "Accept")).toBe(true);
    });

    test("deletes multiple headers when headers are stored in an Iterable", () => {
        const headers = [["Content-Type", "application/json"], ["Authorization", "Bearer token"]];

        const updatedHeaders = deleteHeaders(headers, ["Content-Type", "Authorization"]);

        expect(hasHeader(updatedHeaders, "Content-Type")).toBe(false);
        expect(hasHeader(updatedHeaders, "Authorization")).toBe(false);
    });

    test("does not delete other headers when headers are stored in an Iterable", () => {
        const headers = [["Content-Type", "application/json"], ["Authorization", "Bearer token"], ["Accept", "application/json"]];

        const updatedHeaders = deleteHeaders(headers, ["Content-Type", "Authorization"]);

        expect(hasHeader(updatedHeaders, "Accept")).toBe(true);
    });

    test("deletes multiple headers when headers are stored in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"], ["Authorization", "Bearer token"]]);

        const updatedHeaders = deleteHeaders(headers, ["Content-Type", "Authorization"]);

        expect(hasHeader(updatedHeaders, "Content-Type")).toBe(false);
        expect(hasHeader(updatedHeaders, "Authorization")).toBe(false);
    });

    test("does not delete other headers when headers are stored in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"], ["Authorization", "Bearer token"], ["Accept", "application/json"]]);

        const updatedHeaders = deleteHeaders(headers, ["Content-Type", "Authorization"]);

        expect(hasHeader(updatedHeaders, "Accept")).toBe(true);
    });
});

describe("cloneHeaders", () => {
    test("returns undefined when headers are not present", () => {
        expect(cloneHeaders(null)).toBeUndefined();
        expect(cloneHeaders(undefined)).toBeUndefined();
    });

    test("clones the headers when headers are stored in a Record", () => {
        const headers = { "Content-Type": "application/json" };

        const clonedHeaders = cloneHeaders(headers);

        expect(clonedHeaders).not.toBe(headers);
        expect(clonedHeaders).toEqual(headers);
    });

    test("clones the headers when headers are stored in an Iterable", () => {
        const headers = [["Content-Type", "application/json"]];

        const clonedHeaders = cloneHeaders(headers);

        expect(clonedHeaders).not.toBe(headers);
        expect(clonedHeaders).toEqual(headers);
    });

    test("clones the headers when headers are stored in a Map", () => {
        const headers = new Map([["Content-Type", "application/json"]]);

        const clonedHeaders = cloneHeaders(headers);

        expect(clonedHeaders).not.toBe(headers);
        expect(clonedHeaders).toEqual(headers);
    });
});

describe("inferHttpRequestBodyHeaders", () => {
    test("returns empty headers when body is not streamable", () => {
        const body = "non-streamable body";

        const headers = inferHttpRequestBodyHeaders(body);

        expect(headers).toEqual({});
    });

    test("returns correct headers when body is a Blob", () => {
        const body = new Blob(["blob content"]);

        const headers = inferHttpRequestBodyHeaders(body);

        expect(headers["Content-Type"]).toBe("application/octet-stream");
        expect(headers["Content-Length"]).toBe(String(body.size));
    });

    test("returns correct headers when body is a Buffer", () => {
        const body = Buffer.from("buffer content");

        const headers = inferHttpRequestBodyHeaders(body);

        expect(headers["Content-Type"]).toBe("application/octet-stream");
        expect(headers["Content-Length"]).toBe(String(body.byteLength));
    });

    test("returns correct headers when body is a ReadableStream created from a file path", () => {
        const body = createReadStream("file.json");

        const headers = inferHttpRequestBodyHeaders(body);

        expect(headers["Content-Type"]).toBe("application/octet-stream");
        expect(headers["Content-Length"]).toBe(String(statSync("file.json").size));
    });
});
