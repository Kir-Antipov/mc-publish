import { isError } from "@/utils/errors/error";

describe("isError", () => {
    test("returns true if the input is an instance of Error", () => {
        expect(isError(new Error("test error"))).toBe(true);
    });

    test("returns false if the input is not an instance of Error", () => {
        expect(isError("not an error")).toBe(false);
    });
});
