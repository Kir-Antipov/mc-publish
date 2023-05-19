import { zipContent } from "@/../tests/utils/zip-utils";
import { LoaderMetadata } from "@/loaders/loader-metadata";
import mockFs from "mock-fs";
import { ZippedLoaderMetadataReader, ZippedTextLoaderMetadataReader } from "@/loaders/zipped-loader-metadata-reader";

class MockZippedLoaderMetadataReader extends ZippedLoaderMetadataReader<LoaderMetadata, string> {
    constructor(entry: string) {
        super(entry);
    }

    protected readRawMetadata(buffer: Buffer): Promise<string> {
        return Promise.resolve(buffer.toString());
    }

    protected createMetadata(config: string): Promise<LoaderMetadata> {
        return Promise.resolve({ id: config } as LoaderMetadata);
    }
}

class MockZippedTextLoaderMetadataReader extends ZippedTextLoaderMetadataReader<LoaderMetadata, string> {
    constructor(entry: string, factory: (raw: string) => LoaderMetadata, parser: (text: string) => string) {
        super(entry, factory, parser);
    }
}

beforeEach(async () => {
    mockFs({
        "test.zip": await zipContent("Test", "test.txt"),
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("ZippedLoaderMetadataReader", () => {
    test("reads metadata file from a zipped file at the given path", async () => {
        const reader = new MockZippedLoaderMetadataReader("test.txt");

        const metadata = await reader.readMetadataFile("test.zip");

        expect(metadata).toMatchObject({ id: "Test" });
    });

    test("returns undefined if the given path does not exist", async () => {
        const reader = new MockZippedLoaderMetadataReader("test.txt");

        const metadata = await reader.readMetadataFile("");

        expect(metadata).toBeUndefined();
    });

    test("returns undefined if the zip entry does not exist", async () => {
        const reader = new MockZippedLoaderMetadataReader("test");

        const metadata = await reader.readMetadataFile("test.zip");

        expect(metadata).toBeUndefined();
    });
});

describe("ZippedTextLoaderMetadataReader", () => {
    test("reads metadata file from a zipped file at the given path", async () => {
        const factory = jest.fn().mockImplementation(x => ({ id: x }));
        const parse = jest.fn().mockImplementation(x => [...String(x)].reverse().join(""));
        const reader = new MockZippedTextLoaderMetadataReader("test.txt", factory, parse);

        const metadata = await reader.readMetadataFile("test.zip");

        expect(metadata).toMatchObject({ id: "tseT" });
        expect(factory).toHaveBeenCalledTimes(1);
        expect(factory).toHaveBeenCalledWith("tseT");
        expect(parse).toHaveBeenCalledTimes(1);
        expect(parse).toHaveBeenCalledWith("Test");
    });

    test("returns undefined if the given path does not exist", async () => {
        const factory = jest.fn();
        const parse = jest.fn();
        const reader = new MockZippedTextLoaderMetadataReader("test.txt", factory, parse);

        const metadata = await reader.readMetadataFile("");

        expect(metadata).toBeUndefined();
        expect(factory).not.toHaveBeenCalled();
        expect(parse).not.toHaveBeenCalled();
    });

    test("returns undefined if the zip entry does not exist", async () => {
        const factory = jest.fn();
        const parse = jest.fn();
        const reader = new MockZippedTextLoaderMetadataReader("test", factory, parse);

        const metadata = await reader.readMetadataFile("test.zip");

        expect(metadata).toBeUndefined();
        expect(factory).not.toHaveBeenCalled();
        expect(parse).not.toHaveBeenCalled();
    });
});
