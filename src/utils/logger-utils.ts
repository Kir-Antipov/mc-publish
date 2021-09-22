import * as actions from "@actions/core";
import * as console from "console";
import Logger from "./logger";

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
