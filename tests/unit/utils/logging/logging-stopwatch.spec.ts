import { Logger } from "@/utils/logging/logger";
import { LoggingStopwatch } from "@/utils/logging/logging-stopwatch";

function createMockLogger(): Logger {
    return {
        fatal: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
    };
}

describe("LoggingStopwatch", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(0);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("constructor", () => {
        test("initializes with default values", () => {
            const stopwatch = new LoggingStopwatch(createMockLogger());

            expect(stopwatch.isRunning).toBe(false);
            expect(stopwatch.elapsedMilliseconds).toBe(0);
        });
    });

    describe("start", () => {
        test("starts stopwatch and logs start message", () => {
            const logger = createMockLogger();
            const stopwatch = new LoggingStopwatch(logger, "Stopwatch started");

            expect(stopwatch.start()).toBe(true);
            expect(logger.info).toHaveBeenCalledWith("Stopwatch started");
        });

        test("doesn't start if stopwatch is already running", () => {
            const logger = createMockLogger();
            const stopwatch = LoggingStopwatch.startNew(logger, "Stopwatch started");

            expect(stopwatch.start()).toBe(false);
            expect(logger.info).toHaveBeenCalledTimes(1);
        });
    });

    describe("stop", () => {
        test("stops stopwatch and logs stop message", () => {
            const logger = createMockLogger();
            const onStart = jest.fn().mockReturnValue("Stopwatch started");
            const onStop = jest.fn().mockReturnValue("Stopwatch stopped");
            const stopwatch = LoggingStopwatch.startNew(logger, onStart, onStop);

            jest.advanceTimersByTime(1000);

            expect(stopwatch.stop()).toBe(true);
            expect(onStart).toHaveBeenCalledTimes(1);
            expect(onStart).toHaveBeenCalledWith(new Date(0), stopwatch);
            expect(onStop).toHaveBeenCalledTimes(1);
            expect(onStop).toHaveBeenCalledWith(1000, new Date(1000), stopwatch);
            expect(logger.info).toHaveBeenCalledTimes(2);
            expect(logger.info).toHaveBeenNthCalledWith(1, "Stopwatch started");
            expect(logger.info).toHaveBeenNthCalledWith(2, "Stopwatch stopped");
        });

        test("doesn't stop if stopwatch is already stopped", () => {
            const logger = createMockLogger();
            const stopwatch = new LoggingStopwatch(logger, undefined, "Stopwatch stopped");

            expect(stopwatch.stop()).toBe(false);
            expect(logger.info).not.toBeCalled();
        });
    });

    describe("elapsedMilliseconds", () => {
        test("measures elapsed time while stopwatch is running", () => {
            const stopwatch = LoggingStopwatch.startNew(createMockLogger());

            expect(stopwatch.elapsedMilliseconds).toBe(0);

            jest.advanceTimersByTime(1000);
            expect(stopwatch.elapsedMilliseconds).toBe(1000);

            jest.advanceTimersByTime(1000);
            expect(stopwatch.elapsedMilliseconds).toBe(2000);
        });

        test("measures elapsed time correctly when stopwatch is stopped", () => {
            const stopwatch = LoggingStopwatch.startNew(createMockLogger());

            expect(stopwatch.elapsedMilliseconds).toBe(0);

            jest.advanceTimersByTime(1000);
            expect(stopwatch.elapsedMilliseconds).toBe(1000);

            jest.advanceTimersByTime(1000);
            expect(stopwatch.elapsedMilliseconds).toBe(2000);

            stopwatch.stop();
            jest.advanceTimersByTime(1000);
            expect(stopwatch.elapsedMilliseconds).toBe(2000);
        });

        test("returns 0 if the stopwatch was never started", () => {
            const stopwatch = new LoggingStopwatch(createMockLogger());

            expect(stopwatch.elapsedMilliseconds).toBe(0);
        });
    });

    describe("reset", () => {
        test("resets stopwatch correctly while it's running", () => {
            const stopwatch = LoggingStopwatch.startNew(createMockLogger());

            jest.advanceTimersByTime(1000);
            stopwatch.reset();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(false);
        });

        test("resets stopwatch correctly when it's stopped", () => {
            const stopwatch = LoggingStopwatch.startNew(createMockLogger());

            jest.advanceTimersByTime(1000);
            stopwatch.stop();
            stopwatch.reset();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(false);
        });

        test("does nothing if the stopwatch was never started", () => {
            const stopwatch = new LoggingStopwatch(createMockLogger());
            stopwatch.reset();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(false);
        });
    });

    describe("restart", () => {
        test("restarts stopwatch correctly while it's running", () => {
            const stopwatch = LoggingStopwatch.startNew(createMockLogger());

            jest.advanceTimersByTime(1000);
            stopwatch.restart();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(true);
        });

        test("restarts stopwatch correctly when it's stopped", () => {
            const stopwatch = LoggingStopwatch.startNew(createMockLogger());

            jest.advanceTimersByTime(1000);
            stopwatch.stop();
            stopwatch.restart();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(true);
        });

        test("starts the stopwatch if it was never started", () => {
            const stopwatch = new LoggingStopwatch(createMockLogger());
            stopwatch.restart();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(true);
        });
    });

    describe("startNew", () => {
        test("starts new stopwatch correctly", () => {
            const logger = createMockLogger();
            const onStart = jest.fn().mockReturnValue("Stopwatch started");
            const onStop = jest.fn();
            const stopwatch = LoggingStopwatch.startNew(logger, onStart, onStop);

            expect(stopwatch.isRunning).toBe(true);
            expect(onStart).toHaveBeenCalledTimes(1);
            expect(onStart).toHaveBeenCalledWith(new Date(0), stopwatch);
            expect(logger.info).toHaveBeenCalledTimes(1);
            expect(logger.info).toHaveBeenCalledWith("Stopwatch started");
            expect(onStop).not.toHaveBeenCalled();
        });
    });
});
