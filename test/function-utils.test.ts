import { describe, test, expect } from "@jest/globals";
import { retry } from "../src/utils/function-utils";
import SoftError from "../src/utils/soft-error";

function createThrowingFunc(attempts: number): () => true {
    let counter = 0;
    return () => {
        if (++counter !== attempts) {
            throw new SoftError(true);
        }
        return true;
    };
}

function createAsyncThrowingFunc(attempts: number): () => Promise<true> {
    const func = createThrowingFunc(attempts);
    return async () => func();
}

describe("retry", () => {
    test("function resolves after several attempts", async () => {
        expect(await retry({ func: createThrowingFunc(5), maxAttempts: 5 })).toBe(true);
    });

    test("delay is applied between the attempts", async () => {
        const start = new Date();
        expect(await retry({ func: createThrowingFunc(2), maxAttempts: 2, delay: 100 })).toBe(true);
        const end = new Date();
        const duration = end.getTime() - start.getTime();
        expect(duration > 50 && duration < 200).toBe(true);
    });

    test("the original error is thrown if retry function didn't succeed", async () => {
        await expect(retry({ func: createThrowingFunc(5), maxAttempts: 1 })).rejects.toThrow(<any>SoftError);
    });

    test("softErrorPredicate is used to determine whether the error is soft or not", async () => {
        await expect(retry({ func: createThrowingFunc(5), maxAttempts: 5, softErrorPredicate: _ => false })).rejects.toThrow(<any>SoftError);
    });

    test("errorCallback is called whenever an error occurs", async () => {
        await expect(retry({ func: createThrowingFunc(5), maxAttempts: 5, errorCallback: e => { throw e; } })).rejects.toThrow(<any>SoftError);
    });
});

describe("retry (async)", () => {
    test("function resolves after several attempts", async () => {
        expect(await retry({ func: createAsyncThrowingFunc(5), maxAttempts: 5 })).toBe(true);
    });

    test("delay is applied between the attempts", async () => {
        const start = new Date();
        expect(await retry({ func: createAsyncThrowingFunc(2), maxAttempts: 2, delay: 100 })).toBe(true);
        const end = new Date();
        const duration = end.getTime() - start.getTime();
        expect(duration > 50 && duration < 200).toBe(true);
    });

    test("the original error is thrown if retry function didn't succeed", async () => {
        await expect(retry({ func: createAsyncThrowingFunc(5), maxAttempts: 1 })).rejects.toThrow(<any>SoftError);
    });

    test("softErrorPredicate is used to determine whether the error is soft or not", async () => {
        await expect(retry({ func: createAsyncThrowingFunc(5), maxAttempts: 5, softErrorPredicate: _ => false })).rejects.toThrow(<any>SoftError);
    });

    test("errorCallback is called whenever an error occurs", async () => {
        await expect(retry({ func: createAsyncThrowingFunc(5), maxAttempts: 5, errorCallback: e => { throw e; } })).rejects.toThrow(<any>SoftError);
    });
});
