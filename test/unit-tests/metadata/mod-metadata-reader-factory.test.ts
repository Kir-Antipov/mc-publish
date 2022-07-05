import { describe, test, expect } from "@jest/globals";
import ModLoaderType from "../../../src/metadata/mod-loader-type";
import ModMetadataReaderFactory from "../../../src/metadata/mod-metadata-reader-factory";

describe("ModMetadataReaderFactory.create", () => {
    test("factory can create metadata reader for every ModLoaderType value", () => {
        const factory = new ModMetadataReaderFactory();
        for (const target of ModLoaderType.getValues()) {
            const reader = factory.create(target);
            expect(reader).toHaveProperty("readMetadata");
        }
    });

    test("the method throws on invalid ModLoaderType value", () => {
        const factory = new ModMetadataReaderFactory();
        expect(() => factory.create(-1)).toThrow();
    });
});
