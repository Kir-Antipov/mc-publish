import { Stopwatch } from "@/utils/diagnostics/stopwatch";

describe("Stopwatch", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(0);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("constructor", () => {
        test("initializes with default values", () => {
            const stopwatch = new Stopwatch();

            expect(stopwatch.isRunning).toBe(false);
            expect(stopwatch.elapsedMilliseconds).toBe(0);
        });
    });

    describe("start", () => {
        test("starts stopwatch", () => {
            const onStart = jest.fn();
            const onStop = jest.fn();
            const stopwatch = new Stopwatch(onStart, onStop);

            expect(stopwatch.start()).toBe(true);
            expect(stopwatch.isRunning).toBe(true);
            expect(onStart).toHaveBeenCalledTimes(1);
            expect(onStart).toHaveBeenCalledWith(new Date(0), stopwatch);
            expect(onStop).not.toHaveBeenCalled();
        });

        test("doesn't start if stopwatch is already running", () => {
            const onStart = jest.fn();
            const stopwatch = Stopwatch.startNew(onStart);

            expect(stopwatch.start()).toBe(false);
            expect(onStart).toHaveBeenCalledTimes(1);
        });
    });

    describe("stop", () => {
        test("stops stopwatch", () => {
            const onStart = jest.fn();
            const onStop = jest.fn();
            const stopwatch = Stopwatch.startNew(onStart, onStop);

            jest.advanceTimersByTime(1000);

            expect(stopwatch.stop()).toBe(true);
            expect(stopwatch.isRunning).toBe(false);
            expect(onStart).toHaveBeenCalledTimes(1);
            expect(onStart).toHaveBeenCalledWith(new Date(0), stopwatch);
            expect(onStop).toHaveBeenCalledTimes(1);
            expect(onStop).toHaveBeenCalledWith(1000, new Date(1000), stopwatch);
        });

        test("doesn't stop if stopwatch is already stopped", () => {
            const onStop = jest.fn();
            const stopwatch = new Stopwatch(undefined, onStop);

            expect(stopwatch.stop()).toBe(false);
            expect(onStop).not.toBeCalled();
        });
    });

    describe("elapsedMilliseconds", () => {
        test("measures elapsed time while stopwatch is running", () => {
            const stopwatch = Stopwatch.startNew();

            expect(stopwatch.elapsedMilliseconds).toBe(0);

            jest.advanceTimersByTime(1000);
            expect(stopwatch.elapsedMilliseconds).toBe(1000);

            jest.advanceTimersByTime(1000);
            expect(stopwatch.elapsedMilliseconds).toBe(2000);
        });

        test("measures elapsed time correctly when stopwatch is stopped", () => {
            const stopwatch = Stopwatch.startNew();

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
            const stopwatch = new Stopwatch();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
        });
    });

    describe("reset", () => {
        test("resets stopwatch correctly while it's running", () => {
            const stopwatch = Stopwatch.startNew();

            jest.advanceTimersByTime(1000);
            stopwatch.reset();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(false);
        });

        test("resets stopwatch correctly when it's stopped", () => {
            const stopwatch = Stopwatch.startNew();

            jest.advanceTimersByTime(1000);
            stopwatch.stop();
            stopwatch.reset();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(false);
        });

        test("does nothing if the stopwatch was never started", () => {
            const stopwatch = new Stopwatch();
            stopwatch.reset();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(false);
        });
    });

    describe("restart", () => {
        test("restarts stopwatch correctly while it's running", () => {
            const stopwatch = Stopwatch.startNew();

            jest.advanceTimersByTime(1000);
            stopwatch.restart();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(true);
        });

        test("restarts stopwatch correctly when it's stopped", () => {
            const stopwatch = Stopwatch.startNew();

            jest.advanceTimersByTime(1000);
            stopwatch.stop();
            stopwatch.restart();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(true);
        });

        test("starts the stopwatch if it was never started", () => {
            const stopwatch = new Stopwatch();
            stopwatch.restart();

            expect(stopwatch.elapsedMilliseconds).toBe(0);
            expect(stopwatch.isRunning).toBe(true);
        });
    });

    describe("startNew", () => {
        test("starts new stopwatch correctly", () => {
            const onStart = jest.fn();
            const onStop = jest.fn();
            const stopwatch = Stopwatch.startNew(onStart, onStop);

            expect(stopwatch.isRunning).toBe(true);
            expect(onStart).toHaveBeenCalledTimes(1);
            expect(onStart).toHaveBeenCalledWith(new Date(0), stopwatch);
            expect(onStop).not.toHaveBeenCalled();
        });
    });
});
