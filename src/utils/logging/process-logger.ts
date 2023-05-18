import { DEFAULT_NEWLINE } from "@/utils/environment";
import { Logger } from "./logger";

/**
 * Represents a delegate type that consumes log messages.
 */
interface LogConsumer {
    /**
     * Processes a given log message.
     *
     * @param message - A log message to process.
     */
    (message: string): void;
}

/**
 * The `process` object provides information about, and control over, the current Node.js process.
 */
interface Process {
    /**
     * A stream connected to `stdout` (fd `1`).
     */
    stdout?: {
        /**
         * Sends data on the socket.
         */
        write: LogConsumer;
    };
}

/**
 * A logger implementation that dumps formatted log messages to `stdout`.
 *
 * Compatible with GitHub Actions.
 *
 * @remarks
 *
 * https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-debug-message
 */
export class ProcessLogger implements Logger {
    /**
     * A function to consume produced log messages.
     */
    private readonly _logConsumer: LogConsumer;

    /**
     * The newline sequence to use when writing logs.
     */
    private readonly _newline: string;

    /**
     * Constructs a new {@link ProcessLogger} instance.
     *
     * @param process - The process this logger is attached to. Defaults to `globalThis.process`.
     * @param newline - The newline sequence to use when writing logs. Defaults to `os.EOL`.
     */
    constructor(process?: Process, newline?: string);

    /**
     * Constructs a new {@link ProcessLogger} instance.
     *
     * @param logConsumer - The function to consume log messages.
     * @param newline - The newline sequence to use when writing logs. Defaults to `os.EOL`.
     */
    constructor(logConsumer: LogConsumer, newline?: string);

    /**
     * Constructs a new {@link ProcessLogger} instance.
     *
     * @param processOrLogConsumer - A process this logger is attached to, or a function to consume log messages.
     * @param newline - The newline sequence to use when writing logs. Defaults to `os.EOL`.
     */
    constructor(processOrLogConsumer: Process | LogConsumer, newline?: string) {
        if (typeof processOrLogConsumer === "function") {
            this._logConsumer = processOrLogConsumer;
        } else {
            const process = processOrLogConsumer ?? globalThis.process;
            this._logConsumer =
                typeof process.stdout?.write === "function"
                    ? msg => process.stdout.write(msg)
                    : (() => {});
        }
        this._newline = newline ?? DEFAULT_NEWLINE;
    }

    /**
     * @inheritdoc
     */
    fatal(message: string | Error): void {
        this.error(message);
    }

    /**
     * @inheritdoc
     */
    error(message: string | Error): void {
        this.log(message, "error");
    }

    /**
     * @inheritdoc
     */
    warn(message: string | Error): void {
        this.log(message, "warning");
    }

    /**
     * @inheritdoc
     */
    info(message: string | Error): void {
        this.log(message);
    }

    /**
     * @inheritdoc
     */
    debug(message: string | Error): void {
        this.log(message, "debug");
    }

    /**
     * Logs a message with an optional log level.
     *
     * @param message - The message to log.
     * @param level - Optional log level string.
     */
    private log(message: string | Error, level?: string): void {
        const cmd = level ? `::${level}::` : "";
        this._logConsumer(`${cmd}${message}${this._newline}`);
    }
}
