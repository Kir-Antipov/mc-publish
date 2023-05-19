import { asString } from "@/utils/string-utils";
import { EOL } from "node:os";

/**
 * An object containing environment variables as key-value pairs.
 */
export const ENVIRONMENT: Record<string, string> = process.env;

/**
 * The Windows-style line break character sequence.
 */
export const WINDOWS_NEWLINE = "\r\n";

/**
 * The Unix-style line break character sequence.
 */
export const UNIX_NEWLINE = "\n";

/**
 * The default line break character sequence based on the operating system.
 */
export const DEFAULT_NEWLINE = EOL;

/**
 * Retrieves the environment variable with the specified `name`.
 *
 * @param name - The name of the environment variable to retrieve.
 * @param env - An optional set of the environment variables to search within. Defaults to `process.env`.
 *
 * @returns The value of the specified environment variable, if any; otherwise, `undefined`.
 */
export function getEnvironmentVariable(name: string, env?: Record<string, string>): string {
    env ||= ENVIRONMENT;

    const variable = env[name];
    return variable === undefined ? undefined : asString(variable);
}

/**
 * Returns an iterable that yields all environment variables as name/value key-value pairs.
 *
 * @param env - An optional set of the environment variables to search within. Defaults to `process.env`.
 *
 * @returns An iterable that yields all environment variables as name/value key-value pairs.
 */
export function* getAllEnvironmentVariables(env?: Record<string, string>): Iterable<[string, string]> {
    env ||= ENVIRONMENT;

    for (const [name, variable] of Object.entries(env)) {
        if (variable === undefined) {
            continue;
        }

        yield [name, asString(variable)];
    }
}

/**
 * Updates the value of an environment variable with the specified name.
 *
 * @param name - The name of the environment variable to update.
 * @param value - The new value for the environment variable.
 * @param env - An optional set of the environment variables to update. Defaults to `process.env`.
 */
export function setEnvironmentVariable(name: string, value: unknown, env?: Record<string, string>): void {
    env ||= ENVIRONMENT;

    if (value === undefined) {
        delete env[name];
    } else {
        env[name] = asString(value);
    }
}

/**
 * Determines whether the current environment is in debug mode.
 *
 * @param env - An optional set of the environment variables to check. Defaults to `process.env`.
 *
 * @returns `true` if the environment is in debug mode; otherwise, `false`.
 */
export function isDebug(env?: Record<string, string>): boolean {
    // Why in the world is this "1" instead of "true"?
    // https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
    return getEnvironmentVariable("RUNNER_DEBUG", env) === "1";
}

/**
 * Determines whether the current environment is running on GitHub Actions.
 *
 * @param env - An optional set of the environment variables to check. Defaults to `process.env`.
 *
 * @returns `true` if the current environment is running on GitHub Actions; otherwise, `false`.
 */
export function isGitHubAction(env?: Record<string, string>): boolean {
    // https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
    return getEnvironmentVariable("GITHUB_ACTIONS", env) === "true";
}

/**
 * Determines whether the specified platform is Windows.
 *
 * @param platformName - An optional string that represents the platform to check. If not provided, the current platform will be used as the default.
 *
 * @returns `true` if the specified platform is Windows; otherwise, `false`.
 */
export function isWindows(platformName?: string): boolean {
    platformName ??= process.platform;
    return (platformName as typeof process.platform) === "win32";
}

/**
 * Determines whether the current platform is macOS.
 *
 * @param platformName - An optional string that represents the platform to check. If not provided, the current platform will be used as the default.
 *
 * @returns `true` if the current platform is macOS; otherwise, `false`.
 */
export function isMacOs(platformName?: string): boolean {
    platformName ??= process.platform;
    return (platformName as typeof process.platform) === "darwin";
}

/**
 * Determines whether the current platform is Linux.
 *
 * @param platformName - An optional string that represents the platform to check. If not provided, the current platform will be used as the default.
 *
 * @returns `true` if the current platform is Linux; otherwise, `false`.
 */
export function isLinux(platformName?: string): boolean {
    platformName ??= process.platform;
    return (platformName as typeof process.platform) === "linux";
}
