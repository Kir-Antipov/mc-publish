import { describe, test, expect } from "@jest/globals";
import sleep from "../src/utils/sleep";
import Logger from "../src/utils/logger";
import LogginStopwatch from "../src/utils/logging-stopwatch";

function createLogger(info?: (msg: string) => void): Logger {
    const notImplementedLogger = () => {
        throw new Error("Not implemented and should never be called");
    };

    return {
        fatal: notImplementedLogger,
        error: notImplementedLogger,
        warn: notImplementedLogger,
        debug: notImplementedLogger,
        info: info ?? notImplementedLogger
    };
}

describe("LogginStopwatch", () => {
    test("base functionality of LogginStopwatch works", async () => {
        const stopwatch = new LogginStopwatch(createLogger());
        expect(stopwatch.isRunning).toBe(false);
        expect(stopwatch.elapsedMilliseconds).toBe(0);
        expect(stopwatch.start()).toBe(true);
        await sleep(100);
        expect(stopwatch.start()).toBe(false);
        expect(stopwatch.stop()).toBe(true);
        expect(stopwatch.stop()).toBe(false);
        expect(stopwatch.elapsedMilliseconds).toBeGreaterThan(50);
        expect(stopwatch.elapsedMilliseconds).toBeLessThan(200);
        stopwatch.reset();
        expect(stopwatch.elapsedMilliseconds).toBe(0);
    });

    test("LogginStopwatch executes callbacks on start and end", async () => {
        let started = 0;
        let stopped = 0;
        let ms = 0;
        const logger = createLogger(msg => {
            if (msg.startsWith("start")) {
                ++started;
            } else if (msg.startsWith("stop")) {
                ++stopped;
                ms = +msg.split(" ")[1];
            } else {
                throw new Error("Unrecognized message");
            }
        });

        const stopwatch = new LogginStopwatch(logger, "start", ms => `stop ${ms}`);

        expect(stopwatch.isRunning).toBe(false);
        expect(stopwatch.elapsedMilliseconds).toBe(0);

        expect(stopwatch.start()).toBe(true);
        expect(started).toBe(1);
        expect(stopped).toBe(0);

        await sleep(100);

        expect(stopwatch.start()).toBe(false);
        expect(started).toBe(1);
        expect(stopped).toBe(0);

        expect(stopwatch.stop()).toBe(true);
        expect(started).toBe(1);
        expect(stopped).toBe(1);

        expect(stopwatch.stop()).toBe(false);
        expect(started).toBe(1);
        expect(stopped).toBe(1);

        expect(stopwatch.elapsedMilliseconds).toBeGreaterThan(50);
        expect(stopwatch.elapsedMilliseconds).toBeLessThan(200);
        expect(stopwatch.elapsedMilliseconds).toBe(ms);

        stopwatch.reset();
        expect(stopwatch.elapsedMilliseconds).toBe(0);
    });
});
