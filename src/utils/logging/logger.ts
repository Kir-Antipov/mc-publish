import * as actions from "@actions/core";
import * as console from "console";

export default interface Logger {
    fatal(message: string | Error): void;
    error(message: string | Error): void;
    warn(message: string | Error): void;
    info(message: string | Error): void;
    debug(message: string | Error): void;
}

export function getDefaultLogger(): Logger {
    return {
        fatal: actions.setFailed,
        error: actions.warning,
        warn: actions.warning,
        info: actions.info,
        debug: actions.debug
    };
}

export function getConsoleLogger(): Logger {
    return {
        fatal: console.error,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug
    };
}

export function getEmptyLogger(): Logger {
    return {
        fatal: () => {},
        error: () => {},
        warn: () => {},
        info: () => {},
        debug: () => {}
    };
}
