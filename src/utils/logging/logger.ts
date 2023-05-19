import { isGitHubAction } from "@/utils/environment";
import { ConsoleLogger } from "./console-logger";
import { NullLogger } from "./null-logger";
import { ProcessLogger } from "./process-logger";

/**
 * Interface describing an object capable of logging user-provided information.
 */
export interface Logger {
    /**
     * Logs a message or error as fatal level log.
     *
     * @param message - The message or error to log.
     */
    fatal(message: string | Error): void;

    /**
     * Logs a message or error as error level log.
     *
     * @param message - The message or error to log.
     */
    error(message: string | Error): void;

    /**
     * Logs a message or error as warning level log.
     *
     * @param message - The message or error to log.
     */
    warn(message: string | Error): void;

    /**
     * Logs a message or error as informational level log.
     *
     * @param message - The message or error to log.
     */
    info(message: string | Error): void;

    /**
     * Logs a message or error as debug level log.
     *
     * @param message - The message or error to log.
     */
    debug(message: string | Error): void;
}

/**
 * A constant representing the {@link NullLogger} instance, which does not log any message.
 */
export const NULL_LOGGER: Logger = new NullLogger();

/**
 * A constant representing the {@link ConsoleLogger} instance, which logs messages to the console.
 */
export const CONSOLE_LOGGER: Logger = new ConsoleLogger();

/**
 * A constant representing the {@link ProcessLogger} instance, which dumps log messages to the `stdout`.
 */
export const PROCESS_LOGGER: Logger = new ProcessLogger();

/**
 * Returns a logger instance that is the most suitable for the current environment.
 *
 * - If we are currently in a GitHub Actions environment, the logger will write to `process.stdout`.
 * - Otherwise, logs will be written to the console.
 *
 * @param env - An optional set of the environment variables to check. Defaults to `process.env`.
 *
 * @returns A logger instance suitable for the current environment.
 */
export function getDefaultLogger(env?: Record<string, string>): Logger {
    return isGitHubAction(env) ? PROCESS_LOGGER : CONSOLE_LOGGER;
}
