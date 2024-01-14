import { ArgumentError } from "@/utils/errors/argument-error";

describe("ArgumentError", () => {
    describe("constructor", () => {
        test("creates an instance with the given parameter name and message", () => {
            const error = new ArgumentError("param1", "test message");

            expect(error).toBeInstanceOf(ArgumentError);
            expect(error.name).toBe("ArgumentError");
            expect(error.message).toBe("test message (Parameter 'param1')");
            expect(error.paramName).toBe("param1");
        });

        test("creates an instance with a default message if no message is provided", () => {
            const error = new ArgumentError("param1");

            expect(error.message).toBe("Value does not fall within the expected range. (Parameter 'param1')");
        });

        test("creates an instance with no parameter name if none is provided", () => {
            const error = new ArgumentError(undefined, "test message");

            expect(error.message).toBe("test message");
            expect(error.paramName).toBeUndefined();
        });
    });

    describe("throwIfNullOrEmpty", () => {
        test("throws an ArgumentError with a specified parameter name if the argument is null", () => {
            expect(() => ArgumentError.throwIfNullOrEmpty(null, "param1")).toThrowError(new ArgumentError("param1", "The value cannot be null, undefined, or empty."));
        });

        test("throws an ArgumentError with a specified parameter name if the argument is undefined", () => {
            expect(() => ArgumentError.throwIfNullOrEmpty(undefined, "param1")).toThrowError(new ArgumentError("param1", "The value cannot be null, undefined, or empty."));
        });

        test("throws an ArgumentError with a specified parameter name if the argument is empty", () => {
            expect(() => ArgumentError.throwIfNullOrEmpty("", "param1")).toThrowError(new ArgumentError("param1", "The value cannot be null, undefined, or empty."));
        });

        test("throws an ArgumentError with the provided error message", () => {
            expect(() => ArgumentError.throwIfNullOrEmpty(null, "param1", "I don't like nulls.")).toThrowError(new ArgumentError("param1", "I don't like nulls."));
        });

        test("does not throw if the argument is not null, undefined, or empty", () => {
            expect(() => ArgumentError.throwIfNullOrEmpty("not empty", "param1")).not.toThrow();
        });
    });
});
