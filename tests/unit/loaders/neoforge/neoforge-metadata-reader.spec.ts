import { zipFile } from "@/../tests/utils/zip-utils";
import mockFs from "mock-fs";
import { NeoForgeMetadata } from "@/loaders/neoforge/neoforge-metadata";
import { NeoForgeMetadataReader } from "@/loaders/neoforge/neoforge-metadata-reader";

beforeEach(async () => {
    mockFs({
        "neoforge.mod.jar": await zipFile([__dirname, "../../../content/neoforge/mods.toml"], "META-INF/mods.toml"),
        "text.txt": "",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("NeoForgeMetadataReader", () => {
    test("successfully reads mods.toml", async () => {
        const reader = new NeoForgeMetadataReader();

        const metadata = await reader.readMetadataFile("neoforge.mod.jar");

        expect(metadata).toBeInstanceOf(NeoForgeMetadata);
    });

    test("throws if file is not a NeoForge mod", async () => {
        const reader = new NeoForgeMetadataReader();

        await expect(reader.readMetadataFile("text.txt")).rejects.toThrow();
    });

    test("throws if file does not exist", async () => {
        const reader = new NeoForgeMetadataReader();

        await expect(reader.readMetadataFile("text.json")).rejects.toThrow();
    });
});
