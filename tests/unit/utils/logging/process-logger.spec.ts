import { ProcessLogger } from "@/utils/logging/process-logger";

interface MockProcess {
    stdout: {
        write: jest.Mock;
    };
}

function createMockProcess(): MockProcess {
    return {
        stdout: {
            write: jest.fn(),
        },
    };
}

describe("ProcessLogger", () => {
    describe("constructor", () => {
        test("constructs a new instance with the provided process", () => {
            const process = createMockProcess();
            const logger = new ProcessLogger(process, "\n");

            logger.info("Info");

            expect(process.stdout.write).toHaveBeenCalledTimes(1);
            expect(process.stdout.write).toHaveBeenCalledWith("Info\n");
        });

        test("constructor uses provided newline sequence", () => {
            const process = createMockProcess();
            const logger = new ProcessLogger(process, "\n\n");

            logger.info("Info");

            expect(process.stdout.write).toHaveBeenCalledTimes(1);
            expect(process.stdout.write).toHaveBeenCalledWith("Info\n\n");
        });

        test("constructor uses provided log consumer", () => {
            const logConsumer = jest.fn();
            const logger = new ProcessLogger(logConsumer, "\n");

            logger.info("Info");

            expect(logConsumer).toHaveBeenCalledTimes(1);
            expect(logConsumer).toHaveBeenCalledWith("Info\n");
        });

        test("constructor uses provided log consumer and newline sequence", () => {
            const logConsumer = jest.fn();
            const logger = new ProcessLogger(logConsumer, "\n\n");

            logger.info("Info");

            expect(logConsumer).toHaveBeenCalledTimes(1);
            expect(logConsumer).toHaveBeenCalledWith("Info\n\n");
        });
    });

    describe("fatal", () => {
        test("redirects the call to process.stdout.write", () => {
            const process = createMockProcess();
            const logger = new ProcessLogger(process, "\n");

            logger.fatal("Fatal Error");
            logger.fatal(new Error("Fatal Error"));

            expect(process.stdout.write).toHaveBeenCalledTimes(2);
            expect(process.stdout.write).toHaveBeenNthCalledWith(1, "::error::Fatal Error\n");
            expect(process.stdout.write).toHaveBeenNthCalledWith(2, "::error::Error: Fatal Error\n");
        });
    });

    describe("error", () => {
        test("redirects the call to process.stdout.write", () => {
            const process = createMockProcess();
            const logger = new ProcessLogger(process, "\n");

            logger.error("Error");
            logger.error(new Error("Error"));

            expect(process.stdout.write).toHaveBeenCalledTimes(2);
            expect(process.stdout.write).toHaveBeenNthCalledWith(1, "::error::Error\n");
            expect(process.stdout.write).toHaveBeenNthCalledWith(2, "::error::Error: Error\n");
        });
    });

    describe("warn", () => {
        test("redirects the call to process.stdout.write", () => {
            const process = createMockProcess();
            const logger = new ProcessLogger(process, "\n");

            logger.warn("Warning");
            logger.warn(new Error("Warning"));

            expect(process.stdout.write).toHaveBeenCalledTimes(2);
            expect(process.stdout.write).toHaveBeenNthCalledWith(1, "::warning::Warning\n");
            expect(process.stdout.write).toHaveBeenNthCalledWith(2, "::warning::Error: Warning\n");
        });
    });

    describe("info", () => {
        test("redirects the call to process.stdout.write", () => {
            const process = createMockProcess();
            const logger = new ProcessLogger(process, "\n");

            logger.info("Info");
            logger.info(new Error("Info"));

            expect(process.stdout.write).toHaveBeenCalledTimes(2);
            expect(process.stdout.write).toHaveBeenNthCalledWith(1, "Info\n");
            expect(process.stdout.write).toHaveBeenNthCalledWith(2, "Error: Info\n");
        });
    });

    describe("debug", () => {
        test("redirects the call to process.stdout.write", () => {
            const process = createMockProcess();
            const logger = new ProcessLogger(process, "\n");

            logger.debug("Debug Info");
            logger.debug(new Error("Debug Info"));

            expect(process.stdout.write).toHaveBeenCalledTimes(2);
            expect(process.stdout.write).toHaveBeenNthCalledWith(1, "::debug::Debug Info\n");
            expect(process.stdout.write).toHaveBeenNthCalledWith(2, "::debug::Error: Debug Info\n");
        });
    });
});
