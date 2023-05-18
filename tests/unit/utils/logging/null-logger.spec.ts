import { NullLogger } from "@/utils/logging/null-logger";

describe("NullLogger", () => {
    describe("constructor", () => {
        test("can be created without throwing", () => {
            expect(() => new NullLogger()).not.toThrow();
        });
    });

    describe("fatal", () => {
        test("can be called without throwing", () => {
            const logger = new NullLogger();

            expect(() => logger.fatal("message")).not.toThrow();
            expect(() => logger.fatal(new Error("message"))).not.toThrow();
        });
    });

    describe("error", () => {
        test("can be called without throwing", () => {
            const logger = new NullLogger();

            expect(() => logger.error("message")).not.toThrow();
            expect(() => logger.error(new Error("message"))).not.toThrow();
        });
    });

    describe("warn", () => {
        test("can be called without throwing", () => {
            const logger = new NullLogger();

            expect(() => logger.warn("message")).not.toThrow();
            expect(() => logger.warn(new Error("message"))).not.toThrow();
        });
    });

    describe("info", () => {
        test("can be called without throwing", () => {
            const logger = new NullLogger();

            expect(() => logger.info("message")).not.toThrow();
            expect(() => logger.info(new Error("message"))).not.toThrow();
        });
    });

    describe("debug", () => {
        test("can be called without throwing", () => {
            const logger = new NullLogger();

            expect(() => logger.debug("message")).not.toThrow();
            expect(() => logger.debug(new Error("message"))).not.toThrow();
        });
    });
});
