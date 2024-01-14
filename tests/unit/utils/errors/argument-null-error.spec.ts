import { ArgumentNullError } from "@/utils/errors/argument-null-error";

describe("ArgumentNullError", () => {
    describe("constructor", () => {
        test("creates an instance with the given parameter name and message", () => {
            const error = new ArgumentNullError("param1", "test message");

            expect(error).toBeInstanceOf(ArgumentNullError);
            expect(error.name).toBe("ArgumentNullError");
            expect(error.message).toBe("test message (Parameter 'param1')");
            expect(error.paramName).toBe("param1");
        });

        test("creates an instance with a default message if no message is provided", () => {
            const error = new ArgumentNullError("param1");

            expect(error.message).toBe("Value cannot be null or undefined. (Parameter 'param1')");
        });

        test("creates an instance with no parameter name if none is provided", () => {
            const error = new ArgumentNullError(undefined, "test message");

            expect(error.message).toBe("test message");
            expect(error.paramName).toBeUndefined();
        });
    });

    describe("throwIfNull", () => {
        test("throws an ArgumentNullError with a specified parameter name if the argument is null", () => {
            expect(() => ArgumentNullError.throwIfNull(null, "param1")).toThrowError(new ArgumentNullError("param1"));
        });

        test("throws an ArgumentNullError with a specified parameter name if the argument is undefined", () => {
            expect(() => ArgumentNullError.throwIfNull(undefined, "param1")).toThrowError(new ArgumentNullError("param1"));
        });

        test("throws an ArgumentNullError with the provided error message", () => {
            expect(() => ArgumentNullError.throwIfNullOrEmpty(null, "param1", "I don't like nulls.")).toThrowError(new ArgumentNullError("param1", "I don't like nulls."));
        });

        test("does not throw if the argument is not null or undefined", () => {
            expect(() => ArgumentNullError.throwIfNull("not null or undefined", "param1")).not.toThrow();
        });
    });
});
