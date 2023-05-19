import {
    getEnvironmentVariable,
    getAllEnvironmentVariables,
    setEnvironmentVariable,
    isDebug,
    isGitHubAction,
    isWindows,
    isMacOs,
    isLinux,
} from "@/utils/environment";

const OLD_ENV = { ...process.env };

const OLD_PLATFORM = Object.getOwnPropertyDescriptor(process, "platform");

beforeEach(() => {
    jest.resetModules();
});

afterEach(() => {
    Object.keys(process.env).forEach(key => delete process.env[key]);
    Object.assign(process.env, OLD_ENV);
    Object.defineProperty(process, "platform", OLD_PLATFORM);
});

describe("getEnvironmentVariable", () => {
    test("gets environment variable", () => {
        const env = { TEST_VAR: "test" };

        const testVar = getEnvironmentVariable("TEST_VAR", env);

        expect(testVar).toBe("test");
    });

    test("always returns a string for existing values", () => {
        const env = { TEST_VAR: 42 as unknown as string };

        const testVar = getEnvironmentVariable("TEST_VAR", env);

        expect(testVar).toBe("42");
    });

    test("always returns undefined for undefined values", () => {
        const env = {};

        const testVar = getEnvironmentVariable("TEST_VAR", env);

        expect(testVar).toBeUndefined();
    });

    test("uses process.env by default", () => {
        process.env.TEST_VAR = "test";

        const testVar = getEnvironmentVariable("TEST_VAR");

        expect(testVar).toBe("test");
    });
});

describe("getAllEnvironmentVariables", () => {
    test("returns all environment variables as name/value key-value pairs", () => {
        const env = {
            VAR1: "value1",
            VAR2: "value2",
            VAR3: "value3",
        };

        const result = Array.from(getAllEnvironmentVariables(env));

        expect(result).toEqual([
            ["VAR1", "value1"],
            ["VAR2", "value2"],
            ["VAR3", "value3"],
        ]);
    });

    test("skips variables with undefined value", () => {
        const env = {
            VAR1: "value1",
            VAR2: undefined,
            VAR3: "value3",
        };

        const result = Array.from(getAllEnvironmentVariables(env));

        expect(result).toEqual([
            ["VAR1", "value1"],
            ["VAR3", "value3"],
        ]);
    });

    test("always returns strings for existing values", () => {
        const env = { TEST_VAR: 42 as unknown as string };

        const result = Array.from(getAllEnvironmentVariables(env));

        expect(result).toEqual([
            ["TEST_VAR", "42"],
        ]);
    });

    test("uses process.env by default", () => {
        process.env.TEST_VAR = "testValue";

        const result = Array.from(getAllEnvironmentVariables()).find(([name]) => name === "TEST_VAR");

        expect(result).toEqual(["TEST_VAR", "testValue"]);
    });
});

describe("setEnvironmentVariable", () => {
    test("sets environment variable", () => {
        const env = {};

        setEnvironmentVariable("TEST_VAR", "test", env);

        expect(env["TEST_VAR"]).toBe("test");
    });

    test("always converts values to strings", () => {
        const env = {};

        setEnvironmentVariable("TEST_VAR", 42, env);

        expect(env["TEST_VAR"]).toBe("42");
    });

    test("uses process.env by default", () => {
        setEnvironmentVariable("TEST_VAR", "test");

        expect(process.env.TEST_VAR).toBe("test");
    });
});

describe("isDebug", () => {
    test("returns true when RUNNER_DEBUG is 1", () => {
        const env = { RUNNER_DEBUG: "1" };

        expect(isDebug(env)).toBe(true);
    });

    test("returns false when RUNNER_DEBUG is not 1", () => {
        const env = { RUNNER_DEBUG: "true" };

        expect(isDebug(env)).toBe(false);
    });

    test("uses process.env by default", () => {
        process.env.RUNNER_DEBUG = "1";

        expect(isDebug()).toBe(true);
    });
});

describe("isGitHubAction", () => {
    test("returns true when GITHUB_ACTIONS is 'true'", () => {
        const env = { GITHUB_ACTIONS: "true" };

        expect(isGitHubAction(env)).toBe(true);
    });

    test("returns false when GITHUB_ACTIONS is not 'true'", () => {
        const env = {};

        expect(isGitHubAction(env)).toBe(false);
    });

    test("uses process.env by default", () => {
        process.env.GITHUB_ACTIONS = "true";

        expect(isGitHubAction()).toBe(true);
    });
});

describe("isWindows", () => {
    test("returns true when platform is Windows", () => {
        expect(isWindows("win32")).toBe(true);
    });

    test("returns false when platform is not Windows", () => {
        expect(isWindows("darwin")).toBe(false);
        expect(isWindows("linux")).toBe(false);
    });

    test("uses process.platform by default", () => {
        Object.defineProperty(process, "platform", { value: "win32" });

        expect(isWindows()).toBe(true);
    });
});

describe("isMacOS", () => {
    test("returns true when platform is macOS", () => {
        expect(isMacOs("darwin")).toBe(true);
    });

    test("returns false when platform is not macOS", () => {
        expect(isMacOs("win32")).toBe(false);
        expect(isMacOs("linux")).toBe(false);
    });

    test("uses process.platform by default", () => {
        Object.defineProperty(process, "platform", { value: "darwin" });

        expect(isMacOs()).toBe(true);
    });
});

describe("isLinux", () => {
    test("returns true when platform is Linux", () => {
        expect(isLinux("linux")).toBe(true);
    });

    test("returns false when platform is not Linux", () => {
        expect(isLinux("win32")).toBe(false);
        expect(isLinux("darwin")).toBe(false);
    });

    test("uses process.platform by default", () => {
        Object.defineProperty(process, "platform", { value: "linux" });

        expect(isLinux()).toBe(true);
    });
});
