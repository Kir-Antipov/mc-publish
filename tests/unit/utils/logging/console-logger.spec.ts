import { ConsoleLogger } from "@/utils/logging/console-logger";

interface MockConsole {
    error: jest.Mock;
    warn: jest.Mock;
    info: jest.Mock;
    debug: jest.Mock;
}

function createMockConsole(): MockConsole {
    return {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
    };
}

describe("ConsoleLogger", () => {
    describe("constructor", () => {
        test("constructs a new instance with the provided console", () => {
            const console = createMockConsole();
            const logger = new ConsoleLogger(console);

            logger.fatal("Fatal");
            logger.error("Error");
            logger.warn("Warn");
            logger.info("Info");
            logger.debug("Debug");

            expect(console.error).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenNthCalledWith(1, "Fatal");
            expect(console.error).toHaveBeenNthCalledWith(2, "Error");
            expect(console.warn).toHaveBeenCalledTimes(1);
            expect(console.warn).toHaveBeenCalledWith("Warn");
            expect(console.info).toHaveBeenCalledTimes(1);
            expect(console.info).toHaveBeenCalledWith("Info");
            expect(console.debug).toHaveBeenCalledTimes(1);
            expect(console.debug).toHaveBeenCalledWith("Debug");
        });
    });

    describe("fatal", () => {
        test("redirects the call to console.error", () => {
            const console = createMockConsole();
            const logger = new ConsoleLogger(console);

            logger.fatal("Fatal Error");
            logger.fatal(new Error("Fatal Error"));

            expect(console.error).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenNthCalledWith(1, "Fatal Error");
            expect(console.error).toHaveBeenNthCalledWith(2, new Error("Fatal Error"));
        });
    });

    describe("error", () => {
        test("redirects the call to console.error", () => {
            const console = createMockConsole();
            const logger = new ConsoleLogger(console);

            logger.fatal("Error");
            logger.fatal(new Error("Error"));

            expect(console.error).toHaveBeenCalledTimes(2);
            expect(console.error).toHaveBeenNthCalledWith(1, "Error");
            expect(console.error).toHaveBeenNthCalledWith(2, new Error("Error"));
        });
    });

    describe("warn", () => {
        test("redirects the call to console.warn", () => {
            const console = createMockConsole();
            const logger = new ConsoleLogger(console);

            logger.warn("Warning");
            logger.warn(new Error("Warning"));

            expect(console.warn).toHaveBeenCalledTimes(2);
            expect(console.warn).toHaveBeenNthCalledWith(1, "Warning");
            expect(console.warn).toHaveBeenNthCalledWith(2, new Error("Warning"));
        });
    });

    describe("info", () => {
        test("redirects the call to console.info", () => {
            const console = createMockConsole();
            const logger = new ConsoleLogger(console);

            logger.info("Info");
            logger.info(new Error("Info"));

            expect(console.info).toHaveBeenCalledTimes(2);
            expect(console.info).toHaveBeenNthCalledWith(1, "Info");
            expect(console.info).toHaveBeenNthCalledWith(2, new Error("Info"));
        });
    });

    describe("debug", () => {
        test("redirects the call to console.debug", () => {
            const console = createMockConsole();
            const logger = new ConsoleLogger(console);

            logger.debug("Debug Info");
            logger.debug(new Error("Debug Info"));

            expect(console.debug).toHaveBeenCalledTimes(2);
            expect(console.debug).toHaveBeenNthCalledWith(1, "Debug Info");
            expect(console.debug).toHaveBeenNthCalledWith(2, new Error("Debug Info"));
        });
    });
});
