import { zipFile } from "@/../tests/utils/zip-utils";
import mockFs from "mock-fs";
import { FabricMetadata } from "@/loaders/fabric/fabric-metadata";
import { FabricMetadataReader } from "@/loaders/fabric/fabric-metadata-reader";

beforeEach(async () => {
    mockFs({
        "fabric.mod.jar": await zipFile([__dirname, "../../../content/fabric/fabric.mod.json"]),
        "text.txt": "",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("FabricMetadataReader", () => {
    test("successfully reads fabric.mod.json", async () => {
        const reader = new FabricMetadataReader();

        const metadata = await reader.readMetadataFile("fabric.mod.jar");

        expect(metadata).toBeInstanceOf(FabricMetadata);
    });

    test("returns undefined if file is not a Fabric mod", async () => {
        const reader = new FabricMetadataReader();

        const metadata = await reader.readMetadataFile("text.txt");

        expect(metadata).toBeUndefined();
    });

    test("returns undefined if file does not exist", async () => {
        const reader = new FabricMetadataReader();

        const metadata = await reader.readMetadataFile("text.json");

        expect(metadata).toBeUndefined();
    });
});
