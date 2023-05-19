import { FailMode } from "@/utils/errors/fail-mode";
import { Logger } from "@/utils/logging/logger";
import { ErrorBuilder } from "@/utils/errors/error-builder";

describe("ErrorBuilder", () => {
    describe("hasErrors", () => {
        test("returns false if no errors were appended to the builder", () => {
            const builder = new ErrorBuilder();

            expect(builder.hasErrors).toBe(false);
        });

        test("returns true if errors were appended to the builder", () => {
            const builder = new ErrorBuilder();
            builder.append(new Error());

            expect(builder.hasErrors).toBe(true);
        });
    });

    describe("append", () => {
        it("appends an error and logs it when mode is SKIP", () => {
            const logger = { error: jest.fn() } as unknown as Logger;
            const builder = new ErrorBuilder(logger);
            const error = new Error("Test error");

            builder.append(error, FailMode.SKIP);

            expect(logger.error).toHaveBeenCalledTimes(1);
            expect(logger.error).toHaveBeenCalledWith(error);
            expect(builder.hasErrors).toBe(true);
        });

        it("processes an error and logs it when mode is WARN", () => {
            const logger = { error: jest.fn() } as unknown as Logger;
            const builder = new ErrorBuilder(logger);
            const error = new Error("Test error");

            builder.append(error, FailMode.WARN);

            expect(logger.error).toHaveBeenCalledTimes(1);
            expect(logger.error).toHaveBeenCalledWith(error);
            expect(builder.hasErrors).toBe(false);
        });

        it("throws error immediately when mode is FAIL", () => {
            const logger = { error: jest.fn() } as unknown as Logger;
            const builder = new ErrorBuilder(logger);
            const error = new Error("Test error");

            expect(() => builder.append(error, FailMode.FAIL)).toThrow(error);

            expect(logger.error).not.toHaveBeenCalled();
            expect(builder.hasErrors).toBe(false);
        });
    });

    describe("build", () => {
        it("returns undefined when there are no errors", () => {
            const builder = new ErrorBuilder();

            expect(builder.build()).toBeUndefined();
        });

        it("returns an AggregateError when there are errors", () => {
            const error = new Error("Test error");
            const builder = new ErrorBuilder();

            builder.append(error);
            const builtError = builder.build();

            expect(builtError).toBeInstanceOf(AggregateError);
            expect((builtError as AggregateError).errors).toEqual([error]);
        });
    });

    describe("throwIfHasErrors", () => {
        it("does not throw when there are no errors", () => {
            const builder = new ErrorBuilder();

            expect(() => builder.throwIfHasErrors()).not.toThrow();
        });

        it("throws an AggregateError when there are errors", () => {
            const error = new Error("Test error");
            const builder = new ErrorBuilder();

            builder.append(error);

            expect(() => builder.throwIfHasErrors()).toThrow(new AggregateError([error]));
        });
    });
});
