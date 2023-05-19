import { HttpResponse } from "@/utils/net/http-response";
import { HttpError, isHttpError } from "@/utils/errors/http-error";

describe("HttpError", () => {
    describe("constructor", () => {
        test("initializes with given response and message", () => {
            const response = HttpResponse.text("Resource does not exist", { status: 404, statusText: "Not Found" });

            const error = new HttpError(response, "An error occurred.", false);

            expect(error).toBeInstanceOf(HttpError);
            expect(error.name).toBe("HttpError");
            expect(error.message).toBe("An error occurred.");
            expect(error.isSoft).toBe(false);
            expect(error.response).toBe(response);
        });

        test("initializes with isSoft set to true for server error", () => {
            const response = HttpResponse.text("Somebody knows what happened?", { status: 500, statusText: "Internal Server Error" });

            const error = new HttpError(response);

            expect(error.isSoft).toBe(true);
            expect(error.response).toBe(response);
        });

        test("initializes with isSoft set to false for client error", () => {
            const response = HttpResponse.text("It's not my fault!", { status: 400, statusText: "Bad Request" });

            const error = new HttpError(response);

            expect(error.isSoft).toBe(false);
            expect(error.response).toBe(response);
        });
    });

    describe("fromResponse", () => {
        test("creates HttpError from given response", async () => {
            const response = HttpResponse.text("Resource does not exist", { status: 404, statusText: "Not Found" });

            const error = await HttpError.fromResponse(response, false);

            expect(error).toBeInstanceOf(HttpError);
            expect(error.name).toBe("HttpError");
        });

        test("includes text content in the error message", async () => {
            const response = HttpResponse.json({ error: "Resource does not exist" }, { status: 404, statusText: "Not Found" });

            const error = await HttpError.fromResponse(response, false);

            expect(error.message).toBe(`404 (Not Found, ${JSON.stringify({ error: "Resource does not exist" })})`);
        });

        test("does not include HTML content in the error message", async () => {
            const htmlContent = "<!DOCTYPE html><html><head><title>Not Found</title></head><body>Page Not Found</body></html>";
            const response = HttpResponse.text(htmlContent, { status: 404, statusText: "Not Found" });

            const error = await HttpError.fromResponse(response);

            expect(error.message).toBe("404 (Not Found)");
        });

        test("returns soft error for server error codes", async () => {
            const response = HttpResponse.text("Somebody knows what happened?", { status: 500, statusText: "Internal Server Error" });

            const error = await HttpError.fromResponse(response);

            expect(error.isSoft).toBe(true);
        });

        test("returns soft error for Too Many Requests error code (429)", async () => {
            const response = HttpResponse.text("", { status: 429, statusText: "Too Many Requests" });

            const error = await HttpError.fromResponse(response);

            expect(error.isSoft).toBe(true);
        });

        test("returns non-soft error for client error codes", async () => {
            const response = HttpResponse.text("It's not my fault!", { status: 400, statusText: "Bad Request" });

            const error = await HttpError.fromResponse(response);

            expect(error.isSoft).toBe(false);
        });

        test("can still read the response contents after the error is created", async () => {
            const response = HttpResponse.json({ error: "Resource does not exist" }, { status: 404, statusText: "Not Found" });

            const error = await HttpError.fromResponse(response);
            const responseJson = await error.response.json();

            expect(error.message).toBe(`404 (Not Found, ${JSON.stringify({ error: "Resource does not exist" })})`);
            expect(responseJson).toEqual({ error: "Resource does not exist" });
        });
    });
});

describe("isHttpError", () => {
    test("returns true for HttpError", () => {
        const response = HttpResponse.text("Resource does not exist", { status: 404, statusText: "Not Found" });

        const error = new HttpError(response, "An error occurred.", false);

        expect(isHttpError(error)).toBe(true);
    });

    test("returns false for non-HttpError errors", () => {
        expect(isHttpError(new Error("An error occurred."))).toBe(false);
    });

    test("returns false for non-error values", () => {
        expect(isHttpError("An error occurred.")).toBe(false);
    });
});
