import Logger from "./logger";
import Stopwatch from "../diagnostics/stopwatch";

interface StartCallback {
    (currentDate: Date, stopwatch: Stopwatch): string;
}

interface StopCallback {
    (elapsedMilliseconds: number, currentDate: Date, stopwatch: Stopwatch): string;
}

type VoidCallback<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

function toCallback<T extends (...args: any[]) => string>(func: string | T): T {
    if (typeof func === "string") {
        return (() => func) as T;
    }
    return func;
}

function loggingCallbackToVoidCallback<T extends (...args: any[]) => any>(logger: Logger, func: T): VoidCallback<T> {
    if (!func) {
        return func;
    }

    return (...args: any[]) => {
        const msg = func(...args) as string;
        if (typeof msg === "string") {
            logger?.info(msg);
        }
    };
}

// eslint-disable-next-line
// @ts-ignore: ts2417
export default class LoggingStopwatch extends Stopwatch {
    public constructor(logger: Logger, onStart?: string | StartCallback, onStop?: string | StopCallback) {
        super(loggingCallbackToVoidCallback(logger, toCallback(onStart)), loggingCallbackToVoidCallback(logger, toCallback(onStop)));
    }

    public static startNew(logger: Logger, onStart?: string | StartCallback, onStop?: string | StopCallback): LoggingStopwatch {
        const stopwatch = new LoggingStopwatch(logger, onStart, onStop);
        stopwatch.start();
        return stopwatch;
    }
}
