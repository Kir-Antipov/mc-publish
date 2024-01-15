import { zipFile } from "@/../tests/utils/zip-utils";
import { LoaderType } from "@/loaders/loader-type";
import mockFs from "mock-fs";
import {
    LoaderMetadataReader,
    combineLoaderMetadataReaders,
    createLoaderMetadataReader,
    createDefaultLoaderMetadataReader,
} from "@/loaders/loader-metadata-reader";

beforeEach(async () => {
    mockFs({
        "fabric.jar": await zipFile([__dirname, "../../content/fabric/fabric.mod.json"]),
        "quilt.jar": await zipFile([__dirname, "../../content/quilt/quilt.mod.json"]),
        "forge.jar": await zipFile([__dirname, "../../content/forge/mods.toml"], "META-INF/mods.toml"),
        "neoforge.jar": await zipFile([__dirname, "../../content/neoforge/mods.toml"], "META-INF/mods.toml"),
        "text.txt": "",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("combineLoaderMetadataReaders", () => {
    test("combined reader returns metadata from the first underlying reader that successfully reads the metadata", async () => {
        const reader1 = { readMetadataFile: jest.fn().mockImplementation(x => x === "1" ? Promise.resolve({ id: "1" }) : Promise.reject(new Error("Unknown id"))) } as LoaderMetadataReader;
        const reader2 = { readMetadataFile: jest.fn().mockImplementation(x => Promise.resolve(x === "2" ? { id: "2" } : undefined)) } as LoaderMetadataReader;

        const combined = combineLoaderMetadataReaders([reader1, reader2]);

        const metadata1 = await combined.readMetadataFile("1");
        expect(metadata1).toEqual({ id: "1" });
        expect(reader1.readMetadataFile).toHaveBeenCalledTimes(1);
        expect(reader1.readMetadataFile).toHaveBeenCalledWith("1");
        expect(reader2.readMetadataFile).not.toHaveBeenCalled();

        const metadata2 = await combined.readMetadataFile("2");
        expect(metadata2).toEqual({ id: "2" });
        expect(reader1.readMetadataFile).toHaveBeenCalledTimes(2);
        expect(reader1.readMetadataFile).toHaveBeenCalledWith("2");
        expect(reader2.readMetadataFile).toHaveBeenCalledTimes(1);
        expect(reader2.readMetadataFile).toHaveBeenCalledWith("2");
    });

    test("combined reader throws when no reader can read the metadata", async () => {
        const combined = combineLoaderMetadataReaders([]);

        await expect(combined.readMetadataFile("test")).rejects.toThrow();
    });

    test("combined reader throws if all underlying readers throw", async () => {
        const reader1 = { readMetadataFile: jest.fn().mockRejectedValue(new Error("Cannot read the metadata file")) } as LoaderMetadataReader;

        const combined = combineLoaderMetadataReaders([reader1]);

        await expect(combined.readMetadataFile("test")).rejects.toThrow();
    });
});

describe("createLoaderMetadataReader", () => {
    test("creates a reader for every known loader", () => {
        for (const loader of LoaderType.values()) {
            expect(createLoaderMetadataReader(loader)).toBeDefined();
        }
    });

    test("created reader is able to read metadata of its supported loader", async () => {
        for (const loader of LoaderType.values()) {
            const reader = createLoaderMetadataReader(loader);
            const metadata = await reader.readMetadataFile(`${loader}.jar`);

            expect(metadata).toBeDefined();
            expect(metadata.version).toBe("0.1.0");
        }
    });

    test("created reader throws for unsupported metadata files", async () => {
        for (const loader of LoaderType.values()) {
            const reader = createLoaderMetadataReader(loader);

            await expect(reader.readMetadataFile("text.txt")).rejects.toThrow();
        }
    });

    test("created reader throws for non-existing files", async () => {
        for (const loader of LoaderType.values()) {
            const reader = createLoaderMetadataReader(loader);

            await expect(reader.readMetadataFile("text.json")).rejects.toThrow();
        }
    });

    test("throws an error when unknown loader is provided", () => {
        expect(() => createLoaderMetadataReader("unknown" as LoaderType)).toThrow("Unknown mod loader 'unknown'.");
    });
});

describe("createDefaultLoaderMetadataReader", () => {
    test("creates a reader that can read metadata from all known loaders", async () => {
        const reader = createDefaultLoaderMetadataReader();
        for (const loader of LoaderType.values()) {
            const metadata = await reader.readMetadataFile(`${loader}.jar`);

            expect(metadata).toBeDefined();
            expect(metadata.version).toBe("0.1.0");
        }
    });
});
