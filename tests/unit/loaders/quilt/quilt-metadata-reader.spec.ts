import { zipFile } from "@/../tests/utils/zip-utils";
import mockFs from "mock-fs";
import { QuiltMetadata } from "@/loaders/quilt/quilt-metadata";
import { QuiltMetadataReader } from "@/loaders/quilt/quilt-metadata-reader";

beforeEach(async () => {
    mockFs({
        "quilt.mod.jar": await zipFile([__dirname, "../../../content/quilt/quilt.mod.json"]),
        "text.txt": "",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("QuiltMetadataReader", () => {
    test("successfully reads quilt.mod.json", async () => {
        const reader = new QuiltMetadataReader();

        const metadata = await reader.readMetadataFile("quilt.mod.jar");

        expect(metadata).toBeInstanceOf(QuiltMetadata);
    });

    test("throws if file is not a Quilt mod", async () => {
        const reader = new QuiltMetadataReader();

        await expect(reader.readMetadataFile("text.txt")).rejects.toThrow();
    });

    test("throws if file does not exist", async () => {
        const reader = new QuiltMetadataReader();

        await expect(reader.readMetadataFile("text.json")).rejects.toThrow();
    });
});
