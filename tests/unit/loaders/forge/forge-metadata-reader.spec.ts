import { zipFile } from "@/../tests/utils/zip-utils";
import mockFs from "mock-fs";
import { ForgeMetadata } from "@/loaders/forge/forge-metadata";
import { ForgeMetadataReader } from "@/loaders/forge/forge-metadata-reader";

beforeEach(async () => {
    mockFs({
        "forge.mod.jar": await zipFile([__dirname, "../../../content/forge/mods.toml"], "META-INF/mods.toml"),
        "text.txt": "",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("ForgeMetadataReader", () => {
    test("successfully reads mods.toml", async () => {
        const reader = new ForgeMetadataReader();

        const metadata = await reader.readMetadataFile("forge.mod.jar");

        expect(metadata).toBeInstanceOf(ForgeMetadata);
    });

    test("throws if file is not a Forge mod", async () => {
        const reader = new ForgeMetadataReader();

        await expect(reader.readMetadataFile("text.txt")).rejects.toThrow();
    });

    test("throws if file does not exist", async () => {
        const reader = new ForgeMetadataReader();

        await expect(reader.readMetadataFile("text.json")).rejects.toThrow();
    });
});
