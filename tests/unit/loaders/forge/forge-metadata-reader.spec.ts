import { zipFile } from "@/../tests/utils/zip-utils";
import mockFs from "mock-fs";
import { ForgeMetadata } from "@/loaders/forge/forge-metadata";
import { ForgeMetadataReader } from "@/loaders/forge/forge-metadata-reader";

beforeEach(async () => {
    mockFs({
        "forge.mod.jar": await zipFile([__dirname, "../../../content/forge/mods.toml"], "META-INF/mods.toml"),
        "neoforge.mod.jar": await zipFile([__dirname, "../../../content/neoforge/mods.toml"], "META-INF/mods.toml"),
        "text.txt": "",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("ForgeMetadataReader", () => {
    test("successfully reads forge/mods.toml", async () => {
        const reader = new ForgeMetadataReader();

        const metadata = await reader.readMetadataFile("forge.mod.jar");

        expect(metadata).toBeInstanceOf(ForgeMetadata);
    });

    test("successfully reads neoforge/mods.toml", async () => {
        const reader = new ForgeMetadataReader();

        const metadata = await reader.readMetadataFile("neoforge.mod.jar");

        expect(metadata).toBeInstanceOf(ForgeMetadata);
    });

    test("returns undefined if file is not a Forge mod", async () => {
        const reader = new ForgeMetadataReader();

        const metadata = await reader.readMetadataFile("text.txt");

        expect(metadata).toBeUndefined();
    });

    test("returns undefined if file does not exist", async () => {
        const reader = new ForgeMetadataReader();

        const metadata = await reader.readMetadataFile("text.json");

        expect(metadata).toBeUndefined();
    });
});
