module.exports = {
    preset: "ts-jest/presets/js-with-ts-esm",
    transform: {
        "\\.ts$": ["ts-jest", {
            useESM: true,
            diagnostics: false,
            isolatedModules: true,
        }],
        "\\.js$": "babel-jest",
    },
    testEnvironment: "node",
    testMatch: ["**/tests/**/*/*.spec.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    transformIgnorePatterns: [],
};
