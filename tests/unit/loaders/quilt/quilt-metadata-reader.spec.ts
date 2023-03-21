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

    test("returns undefined if file is not a Quilt mod", async () => {
        const reader = new QuiltMetadataReader();

        const metadata = await reader.readMetadataFile("text.txt");

        expect(metadata).toBeUndefined();
    });

    test("returns undefined if file does not exist", async () => {
        const reader = new QuiltMetadataReader();

        const metadata = await reader.readMetadataFile("text.json");

        expect(metadata).toBeUndefined();
    });
});
