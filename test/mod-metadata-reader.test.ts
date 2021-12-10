import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import Dependency from "../src/metadata/dependency";
import DependencyKind from "../src/metadata/dependency-kind";
import ModMetadataReader from "../src/metadata/mod-metadata-reader";
import PublisherTarget from "../src/publishing/publisher-target";
import { ZipFile } from "yazl";
import fs from "fs";

describe("ModMetadataReader.readMetadata", () => {
    describe("Fabric", () => {
        beforeAll(() => new Promise(resolve => {
            const zip = new ZipFile();
            zip.addFile("./test/content/fabric.mod.json", "fabric.mod.json");
            zip.end();
            zip.outputStream.pipe(fs.createWriteStream("example-mod.fabric.jar")).on("close", resolve);
        }));

        afterAll(() => new Promise(resolve => fs.unlink("example-mod.fabric.jar", resolve)));

        test("the format can be read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.fabric.jar");
            expect(metadata).toBeTruthy();
        });

        test("mod info can be read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.fabric.jar");
            expect(metadata.id).toBe("example-mod");
            expect(metadata.name).toBe("Example Mod");
            expect(metadata.version).toBe("0.1.0");
            expect(metadata.loaders).toMatchObject(["fabric"]);
        });

        test("project ids can be specified in the config file", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.fabric.jar");
            expect(metadata.getProjectId(PublisherTarget.Modrinth)).toBe("AANobbMI");
            expect(metadata.getProjectId(PublisherTarget.CurseForge)).toBe("394468");
            expect(metadata.getProjectId(PublisherTarget.GitHub)).toBe("mc1.18-0.4.0-alpha5");
        });

        test("all dependencies are read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.fabric.jar");
            expect(metadata.dependencies).toHaveLength(9);
            const dependencies = metadata.dependencies.reduce((agg, x) => { agg[x.id] = x; return agg; }, <Record<string, Dependency>>{});
            expect(dependencies["fabricloader"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["fabric"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["minecraft"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["java"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["recommended-mod"]?.kind).toBe(DependencyKind.Recommends);
            expect(dependencies["included-mod"]?.kind).toBe(DependencyKind.Includes);
            expect(dependencies["suggested-mod"]?.kind).toBe(DependencyKind.Suggests);
            expect(dependencies["conflicting-mod"]?.kind).toBe(DependencyKind.Conflicts);
            expect(dependencies["breaking-mod"]?.kind).toBe(DependencyKind.Breaks);
        });

        test("dependency info can be read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.fabric.jar");
            const fabric = metadata.dependencies.find(x => x.id === "fabric");
            expect(fabric).toBeTruthy();
            expect(fabric.id).toBe("fabric");
            expect(fabric.kind).toBe(DependencyKind.Depends);
            expect(fabric.version).toBe(">=0.40.0");
            expect(fabric.ignore).toBe(false);
            for (const project of PublisherTarget.getValues()) {
                expect(fabric.getProjectSlug(project)).toBe(fabric.id);
            }
        });

        test("custom metadata can be attached to dependency entry", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.fabric.jar");
            const recommended = metadata.dependencies.find(x => x.id === "recommended-mod");
            expect(recommended).toBeTruthy();
            expect(recommended.id).toBe("recommended-mod");
            expect(recommended.kind).toBe(DependencyKind.Recommends);
            expect(recommended.version).toBe("0.2.0");
            expect(recommended.ignore).toBe(true);
            expect(recommended.getProjectSlug(PublisherTarget.Modrinth)).toBe("AAAA");
            expect(recommended.getProjectSlug(PublisherTarget.CurseForge)).toBe("42");
            expect(recommended.getProjectSlug(PublisherTarget.GitHub)).toBe("v0.2.0");
        });

        test("special case dependencies (minecraft, java and fabricloader) are ignored by default", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.fabric.jar");
            expect(metadata.dependencies.find(x => x.id === "minecraft").ignore).toBe(true);
            expect(metadata.dependencies.find(x => x.id === "java").ignore).toBe(true);
            expect(metadata.dependencies.find(x => x.id === "fabricloader").ignore).toBe(true);
        });
    });

    describe("Forge", () => {
        beforeAll(() => new Promise(resolve => {
            const zip = new ZipFile();
            zip.addFile("./test/content/mods.toml", "META-INF/mods.toml");
            zip.end();
            zip.outputStream.pipe(fs.createWriteStream("example-mod.forge.jar")).on("close", resolve);
        }));

        afterAll(() => new Promise(resolve => fs.unlink("example-mod.forge.jar", resolve)));

        test("the format can be read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.forge.jar");
            expect(metadata).toBeTruthy();
        });

        test("mod info can be read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.forge.jar");
            expect(metadata.id).toBe("example-mod");
            expect(metadata.name).toBe("Example Mod");
            expect(metadata.version).toBe("0.1.0");
            expect(metadata.loaders).toMatchObject(["forge"]);
        });

        test("project ids can be specified in the config file", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.forge.jar");
            expect(metadata.getProjectId(PublisherTarget.Modrinth)).toBe("AANobbMI");
            expect(metadata.getProjectId(PublisherTarget.CurseForge)).toBe("394468");
            expect(metadata.getProjectId(PublisherTarget.GitHub)).toBe("mc1.18-0.4.0-alpha5");
        });

        test("all dependencies are read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.forge.jar");
            expect(metadata.dependencies).toHaveLength(6);
            const dependencies = metadata.dependencies.reduce((agg, x) => { agg[x.id] = x; return agg; }, <Record<string, Dependency>>{});
            expect(dependencies["forge"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["minecraft"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["java"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["recommended-mod"]?.kind).toBe(DependencyKind.Recommends);
            expect(dependencies["included-mod"]?.kind).toBe(DependencyKind.Includes);
            expect(dependencies["breaking-mod"]?.kind).toBe(DependencyKind.Breaks);
        });

        test("dependency info can be read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.forge.jar");
            const included = metadata.dependencies.find(x => x.id === "included-mod");
            expect(included).toBeTruthy();
            expect(included.id).toBe("included-mod");
            expect(included.kind).toBe(DependencyKind.Includes);
            expect(included.version).toBe("[0.40.0, )");
            expect(included.ignore).toBe(false);
            for (const project of PublisherTarget.getValues()) {
                expect(included.getProjectSlug(project)).toBe(included.id);
            }
        });

        test("custom metadata can be attached to dependency entry", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.forge.jar");
            const recommended = metadata.dependencies.find(x => x.id === "recommended-mod");
            expect(recommended).toBeTruthy();
            expect(recommended.id).toBe("recommended-mod");
            expect(recommended.kind).toBe(DependencyKind.Recommends);
            expect(recommended.version).toBe("0.2.0");
            expect(recommended.ignore).toBe(true);
            expect(recommended.getProjectSlug(PublisherTarget.Modrinth)).toBe("AAAA");
            expect(recommended.getProjectSlug(PublisherTarget.CurseForge)).toBe("42");
            expect(recommended.getProjectSlug(PublisherTarget.GitHub)).toBe("v0.2.0");
        });

        test("special case dependencies (minecraft, java and forge) are ignored by default", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.forge.jar");
            expect(metadata.dependencies.find(x => x.id === "minecraft").ignore).toBe(true);
            expect(metadata.dependencies.find(x => x.id === "java").ignore).toBe(true);
            expect(metadata.dependencies.find(x => x.id === "forge").ignore).toBe(true);
        });
    });

    describe("unsupported mod formats", () => {
        test("null is returned when the format is not supported or specified file does not exist", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.unknown.jar");
            expect(metadata).toBeNull();
        });
    });
});
