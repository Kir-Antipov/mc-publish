import { Stopwatch } from "@/utils/diagnostics";
import { Logger } from "./logger";

/**
 * A callback function that is called when the {@link LoggingStopwatch} is started.
 */
interface StartCallback {
    /**
     * @param date - The date when the {@link LoggingStopwatch} was started.
     * @param stopwatch - The {@link LoggingStopwatch} instance that was started.
     *
     * @returns The message to log, or `void` if no message should be logged.
     */
    (date: Date, stopwatch: LoggingStopwatch): string | void;
}

/**
 * A callback function that is called when the {@link LoggingStopwatch} is stopped.
 */
interface StopCallback {
    /**
     * @param elapsedTime - The elapsed time in milliseconds since the {@link LoggingStopwatch} was started.
     * @param date - The date when the {@link LoggingStopwatch} was stopped.
     * @param stopwatch - The {@link LoggingStopwatch} instance that was stopped.
     *
     * @returns The message to log, or `void` if no message should be logged.
     */
    (elapsedTime: number, date: Date, stopwatch: LoggingStopwatch): string | void;
}

/**
 * A callback wrapper that always returns void.
 */
type VoidCallback<T> = T extends StartCallback | StopCallback ? (...args: Parameters<T>) => void : () => void;

/**
 * Creates a callback that will log a message if one is returned by the provided `message` callback.
 *
 * @param logger - The {@link Logger} instance to use for logging.
 * @param message - A string or a callback that returns a string or `void` indicating whether to log a message.
 *
 * @returns A callback that takes the same amount of arguments as the original `message` one
 * and logs a message if one is returned by the `message` callback.
 */
function createMessageCallback<T extends string | StartCallback | StopCallback>(logger: Logger, message: T): VoidCallback<T> {
    if (typeof message === "string") {
        return (() => logger.info(message)) as VoidCallback<T>;
    }

    if (!message) {
        return undefined;
    }

    return ((...args: Parameters<Exclude<T, string>>) => {
        const result = (message as (...args: Parameters<Exclude<T, string>>) => string | void)(...args);
        if (typeof result === "string") {
            logger.info(result);
        }
    }) as VoidCallback<T>;
}

/**
 * An extension of the {@link Stopwatch} class that adds logging functionality.
*/
// For God's sake, it's been 8 years!
// https://github.com/microsoft/TypeScript/issues/4628
// eslint-disable-next-line
// @ts-expect-error: ts2417
export class LoggingStopwatch extends Stopwatch {
    /**
     * Creates a new {@link LoggingStopwatch} instance.
     *
     * @param logger - The {@link Logger} instance to use for logging.
     * @param onStart - A string or a callback to be called when the stopwatch is started.
     * @param onStop - A string or a callback to be called when the stopwatch is stopped.
     */
    constructor(logger: Logger, onStart?: string | StartCallback, onStop?: string | StopCallback) {
        const startCallback = createMessageCallback(logger, onStart);
        const stopCallback = createMessageCallback(logger, onStop);

        super(startCallback, stopCallback);
    }

    /**
     * Creates a new {@link LoggingStopwatch} instance and starts it.
     *
     * @param logger - The {@link Logger} instance to use for logging.
     * @param onStart - A string or a callback to be called when the stopwatch is started.
     * @param onStop - A string or a callback to be called when the stopwatch is stopped.
     *
     * @returns The newly created and started {@link LoggingStopwatch} instance.
     */
    static startNew(logger: Logger, onStart?: string | StartCallback, onStop?: string | StopCallback): LoggingStopwatch {
        const stopwatch = new LoggingStopwatch(logger, onStart, onStop);
        stopwatch.start();
        return stopwatch;
    }
}
