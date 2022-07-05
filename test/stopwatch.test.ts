import { describe, test, expect } from "@jest/globals";
import sleep from "../src/utils/sleep";
import Stopwatch from "../src/utils/stopwatch";

describe("Stopwatch", () => {
    test("base functionality of Stopwatch works", async () => {
        const stopwatch = new Stopwatch();
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

    test("Stopwatch executes callbacks on start and end", async () => {
        let started = 0;
        let stopped = 0;
        let ms = 0;

        const stopwatch = new Stopwatch(() => ++started, elapsedMilliseconds => {
            ++stopped;
            ms = elapsedMilliseconds;
        });

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
