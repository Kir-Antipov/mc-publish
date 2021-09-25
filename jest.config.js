module.exports = {
    clearMocks: true,
    moduleFileExtensions: ["js", "ts"],
    testMatch: ["**/*.test.ts"],
    transform: { ".(t|j)s$": "babel-jest" },
    transformIgnorePatterns: ["/node_modules/(?!node-fetch|fetch-blob).+\\.js$"],
    moduleNameMapper: {
        "formdata-node/file-from-path": "<rootDir>node_modules/formdata-node/lib/cjs/fileFromPath"
    },
    verbose: true
};
