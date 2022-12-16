import {
    CONSOLE_LOGGER,
    PROCESS_LOGGER,
    getDefaultLogger,
} from "@/utils/logging/logger";

describe("getDefaultLogger", () => {
    test("returns PROCESS_LOGGER if we are in a GitHub Actions environment", () => {
        expect(getDefaultLogger({ GITHUB_ACTIONS: "true" })).toBe(PROCESS_LOGGER);
    });

    test("returns CONSOLE_LOGGER if we are not in a GitHub Actions environment", () => {
        expect(getDefaultLogger({})).toBe(CONSOLE_LOGGER);
    });
});
