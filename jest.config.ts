import type { JestConfigWithTsJest } from 'ts-jest'


const jestConfig: JestConfigWithTsJest = {
    clearMocks: true,
    extensionsToTreatAsEsm: ['.ts'],
    moduleFileExtensions: ["js", "ts"],
    collectCoverage: true,
    testMatch: ["**/*.test.ts"],
    transformIgnorePatterns: ["/node_modules/(?!node-fetch|fetch-blob|got).+\\.js$"],
    moduleNameMapper: {
        "formdata-node/file-from-path": "<rootDir>node_modules/formdata-node/lib/cjs/fileFromPath"
    },
    verbose: true,
    transform: {
        ".(t|j)s$": "babel-jest",
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.m?[tj]sx?$': [
          'ts-jest',
          {
            useESM: true,
          },
                ],
      },
};
export default jestConfig