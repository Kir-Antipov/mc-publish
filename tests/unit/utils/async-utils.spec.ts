import { isPromise, sleep, run, runSafely, retry } from "@/utils/async-utils";

describe("isPromise", () => {
    test("returns true when input is a Promise", () => {
        const promise = new Promise(resolve => {
            resolve(undefined);
        });
        expect(isPromise(promise)).toBe(true);
    });

    test("returns false when input is not a Promise", () => {
        const notAPromise = {};
        expect(isPromise(notAPromise)).toBe(false);
    });
});

describe("sleep", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    test("resolves after specified time", async () => {
        const start = Date.now();
        const promise = sleep(1000);

        await jest.advanceTimersByTimeAsync(1000);
        await promise;

        const elapsed = Date.now() - start;
        return expect(elapsed).toBe(1000);
    });

    test("resolves immediately if time is less than or equal to 0", async () => {
        const start = Date.now();
        const promise = sleep(-10);

        await promise;

        const elapsed = Date.now() - start;
        return expect(elapsed).toBe(0);
    });
});

describe("run", () => {
    test("runs the provided function asynchronously", async () => {
        const func = jest.fn().mockResolvedValue(42);
        const result = await run(func);

        expect(func).toHaveBeenCalledTimes(1);
        expect(func).toHaveBeenCalledWith();
        expect(result).toBe(42);
    });
});

describe("runSafely", () => {
    test("returns result and undefined error when function succeeds", async () => {
        const func = jest.fn().mockResolvedValue(42);
        const [result, error] = await runSafely(func);

        expect(func).toHaveBeenCalledTimes(1);
        expect(func).toHaveBeenCalledWith();
        expect(result).toBe(42);
        expect(error).toBeUndefined();
    });

    test("returns undefined result and error when function fails", async () => {
        const func = jest.fn().mockRejectedValue(new Error("Error occurred"));
        const [result, error] = await runSafely(func);

        expect(func).toHaveBeenCalledTimes(1);
        expect(func).toHaveBeenCalledWith();
        expect(result).toBeUndefined();
        expect(error).toEqual(new Error("Error occurred"));
    });
});

describe("retry", () => {
    test("retries the function when it fails", async () => {
        const func = jest.fn().mockRejectedValueOnce(new Error("Error occurred")).mockResolvedValue(42);
        const result = await retry(func, { maxAttempts: 2 });

        expect(func).toHaveBeenCalledTimes(2);
        expect(result).toBe(42);
    });

    test("does not retry the function when error is not recoverable", async () => {
        const func = jest.fn().mockRejectedValue(new Error("Error occurred"));
        const onError = jest.fn().mockResolvedValue(false);

        await expect(retry(func, { onError, maxAttempts: 2 })).rejects.toThrow("Error occurred");
        expect(func).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(1);
    });

    test("stops retrying after max attempts", async () => {
        const func = jest.fn().mockRejectedValue(new Error("Error occurred"));

        await expect(retry(func, { maxAttempts: 2 })).rejects.toThrow("Error occurred");
        expect(func).toHaveBeenCalledTimes(2);
    });
});
