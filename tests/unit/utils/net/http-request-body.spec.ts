import { Readable } from "node:stream";
import { Blob } from "@/utils/net/blob";
import { FormData } from "@/utils/net/form-data";
import { isHttpRequestBody, isStreamableHttpRequestBody } from "@/utils/net/http-request-body";

describe("isHttpRequestBody", () => {
    test("returns true when body is a string", () => {
        const body = "string body";

        expect(isHttpRequestBody(body)).toBe(true);
    });

    test("returns true when body is a Blob", () => {
        const body = new Blob(["blob content"]);

        expect(isHttpRequestBody(body)).toBe(true);
    });

    test("returns true when body is a Buffer", () => {
        const body = Buffer.from("buffer content");

        expect(isHttpRequestBody(body)).toBe(true);
    });

    test("returns true when body is a URLSearchParams", () => {
        const body = new URLSearchParams({ param: "value" });

        expect(isHttpRequestBody(body)).toBe(true);
    });

    test("returns true when body is a FormData", () => {
        const body = new FormData();
        body.append("key", "value");

        expect(isHttpRequestBody(body)).toBe(true);
    });

    test("returns true when body is a ReadableStream", () => {
        const body = Readable.from("stream content");

        expect(isHttpRequestBody(body)).toBe(true);
    });

    test("returns false when body is not a valid HTTP request body type", () => {
        expect(isHttpRequestBody({ key: "value" })).toBe(false);
        expect(isHttpRequestBody(["foo"])).toBe(false);
        expect(isHttpRequestBody(null)).toBe(false);
        expect(isHttpRequestBody(undefined)).toBe(false);
    });
});

describe("isStreamableHttpRequestBody", () => {
    test("returns true when body is a Blob", () => {
        const body = new Blob(["blob content"]);

        expect(isStreamableHttpRequestBody(body)).toBe(true);
    });

    test("returns true when body is a Buffer", () => {
        const body = Buffer.from("buffer content");

        expect(isStreamableHttpRequestBody(body)).toBe(true);
    });

    test("returns true when body is a ReadableStream", () => {
        const body = Readable.from("stream content");

        expect(isStreamableHttpRequestBody(body)).toBe(true);
    });

    test("returns false when body is not a valid streamable HTTP request body type", () => {
        expect(isStreamableHttpRequestBody({ key: "value" })).toBe(false);
        expect(isStreamableHttpRequestBody(["foo"])).toBe(false);
        expect(isStreamableHttpRequestBody("string body")).toBe(false);
        expect(isStreamableHttpRequestBody(new URLSearchParams({ param: "value" }))).toBe(false);
        expect(isStreamableHttpRequestBody(null)).toBe(false);
        expect(isStreamableHttpRequestBody(undefined)).toBe(false);
    });
});
