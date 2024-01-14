import { FileNotFoundError } from "@/utils/errors/file-not-found-error";
import mockFs from "mock-fs";

describe("FileNotFoundError", () => {
    describe("constructor", () => {
        test("initializes with default message if none provided", () => {
            const error = new FileNotFoundError("test.txt");

            expect(error).toBeInstanceOf(FileNotFoundError);
            expect(error.name).toBe("FileNotFoundError");
            expect(error.message).toBe("Could not find file 'test.txt'.");
            expect(error.fileName).toBe("test.txt");
        });

        test("initializes with provided message", () => {
            const error = new FileNotFoundError("test.txt", "Custom error message");

            expect(error).toBeInstanceOf(FileNotFoundError);
            expect(error.name).toBe("FileNotFoundError");
            expect(error.message).toBe("Custom error message");
            expect(error.fileName).toBe("test.txt");
        });
    });

    describe("throwIfNotFound", () => {
        beforeEach(() => {
            mockFs({ test: "test" });
        });

        afterEach(() => {
            mockFs.restore();
        });

        test("throws error if file does not exist", () => {
            expect(() => FileNotFoundError.throwIfNotFound("test.txt")).toThrow(FileNotFoundError);
        });

        test("throws a FileNotFoundError with the provided error message", () => {
            expect(() => FileNotFoundError.throwIfNotFound("test.txt", "I don't like file extensions.")).toThrowError(new FileNotFoundError("test.txt", "I don't like file extensions."));
        });

        test("does not throw error if file exists", () => {
            expect(() => FileNotFoundError.throwIfNotFound("test")).not.toThrow();
        });
    });
});
