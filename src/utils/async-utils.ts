import { isError } from "@/utils/errors";
import { Awaitable } from "@/utils/types";

/**
 * Checks if the given object is a {@link Promise}.
 *
 * @template T - The type of value that the `Promise` would return upon resolution.
 *
 * @param obj - The object to check.
 *
 * @returns `true` if the object is a `Promise`; otherwise, `false`.
 */
export function isPromise<T>(obj: unknown): obj is Promise<T> {
    return typeof (obj as Promise<T>)?.then === "function";
}

/**
 * Sleep for the specified amount of time in milliseconds.
 *
 * @param ms - The time in milliseconds to sleep.
 *
 * @returns A {@link Promise} that resolves after the specified time.
 */
export function sleep(ms: number): Promise<void> {
    // Technically, it's the HTML Standard,
    // but this rule is also **mostly** true for the NodeJS environment.
    // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
    const MIN_DELAY = 4;
    if (ms < MIN_DELAY) {
        return Promise.resolve();
    }

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

/**
 * Runs a function asynchronously and returns its result.
 *
 * @template T - The type of value returned by the function.
 *
 * @param func - A function to execute asynchronously.
 *
 * @returns A promise that resolves with the return value of the executed function.
 */
export async function run<T>(func: () => Awaitable<T>): Promise<T> {
    return await func();
}

/**
 * Safely executes the provided function, returning both the result and error as a tuple.
 *
 * @template T - The type of value returned by the function.
 * @template E - The type of the returned error.
 *
 * @param func - A function or async function to execute safely.
 *
 * @returns A promise resolving to a tuple containing the result and error.
 *
 *  - The result is at index 0 and the error is at index 1.
 *  - If the function succeeds, the error will be `undefined`.
 *  - If the function fails, the result will be `undefined`.
 */
export async function runSafely<T, E = unknown>(func: () => Awaitable<T>): Promise<[T, E]> {
    return await run(func)
        .then(value => [value, undefined] as [T, E])
        .catch(error => [undefined, error] as [T, E]);
}

/**
 * Options for the `retry` function.
 */
interface RetryOptions {
    /**
     * The time in milliseconds to wait before retrying.
     *
     * Default is `0`.
     */
    delay?: number;

    /**
     * The maximum number of attempts. If negative, will retry indefinitely.
     *
     * Default is `-1`.
     */
    maxAttempts?: number;

    /**
     * A callback function that can be used to log errors and/or determine if the error is recoverable.
     *
     *  - If `onError` returns `true` or nothing at all, the error is considered recoverable.
     *  - If `onError` returns `false`, the error is considered unrecoverable and the retry loop will terminate.
     *
     * @param error - The error that was thrown during the execution of the `func` in `retry`.
     */
    onError?: ErrorHandler;
}

/**
 * Represents an error handler.
 */
interface ErrorHandler {
    /**
     * Handles the given error.
     *
     * @param error - The error that should be handled.
     *
     * @returns A boolean or a `Promise` resolving to a boolean that represents if the error was successfully handled.
     */
    (error: Error): Awaitable<boolean | void>;
}

/**
 * Executes a given function `func` and retries it if an error occurs.
 *
 * @template T - The type of value returned by the function.
 *
 * @param func - The function to execute and potentially retry.
 * @param options - The options for the retry function.
 *
 * @returns The result of a successful execution of `func`.
 */
export async function retry<T>(func: () => Awaitable<T>, options?: RetryOptions): Promise<T> {
    const delay = options?.delay ?? 0;
    const maxAttempts = options?.maxAttempts ?? -1;
    const onError = options?.onError;

    let attempts = 0;
    while (true) {
        ++attempts;

        try {
            return await func();
        } catch (e: unknown) {
            const isNumberOfAttemptsExceeded = maxAttempts >= 0 && attempts >= maxAttempts;
            const isRecoverable = !isNumberOfAttemptsExceeded && await isErrorHandled(e, onError);
            if (!isRecoverable) {
                throw e;
            }
        }

        await sleep(delay);
    }
}

/**
 * Checks if an error was handled by the provided error handler function.
 *
 * @param error - The error to check if it's handled.
 * @param handler - The error handler function.
 *
 * @returns A `Promise` resolving to a boolean that represents if the error was handled.
 */
async function isErrorHandled(error: unknown, handler?: ErrorHandler): Promise<boolean> {
    if (!isError(error)) {
        return false;
    }

    const handlerOutput = await handler?.(error);
    return handlerOutput || handlerOutput === undefined;
}
