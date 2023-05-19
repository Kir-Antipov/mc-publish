import { Logger } from "./logger";
import { error, warn, info, debug } from "node:console";

/**
 * Represents a console-like object.
 */
type Console = Omit<Logger, "fatal">;

/**
 * Default console instance.
 */
const CONSOLE_INSTANCE: Console = { error, warn, info, debug };

/**
 * A logger that writes log messages to the console.
 */
export class ConsoleLogger implements Logger {
    /**
     * A console instance to log messages to.
     */
    private readonly _console: Console;

    /**
     * Constructs a new {@link ConsoleLogger} instance.
     *
     * @param console - Optional custom console object to use for logging.
     */
    constructor(console?: Console) {
        this._console = console || CONSOLE_INSTANCE;
    }

    /**
     * @inheritdoc
     */
    fatal(message: string | Error): void {
        this._console.error(message);
    }

    /**
     * @inheritdoc
     */
    error(message: string | Error): void {
        this._console.error(message);
    }

    /**
     * @inheritdoc
     */
    warn(message: string | Error): void {
        this._console.warn(message);
    }

    /**
     * @inheritdoc
     */
    info(message: string | Error): void {
        this._console.info(message);
    }

    /**
     * @inheritdoc
     */
    debug(message: string | Error): void {
        this._console.debug(message);
    }
}
