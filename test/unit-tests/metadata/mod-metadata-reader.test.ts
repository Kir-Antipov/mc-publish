import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import Dependency from "../../../src/metadata/dependency";
import DependencyKind from "../../../src/metadata/dependency-kind";
import ModMetadataReader from "../../../src/metadata/mod-metadata-reader";
import PublisherTarget from "../../../src/publishing/publisher-target";
import { ZipFile } from "yazl";
import fs from "fs";

describe("ModMetadataReader.readMetadata", () => {
    describe("Fabric", () => {
        beforeAll(() => new Promise(resolve => {
            const zip = new ZipFile();
            zip.addFile("./test/content/fabric/fabric.mod.json", "fabric.mod.json");
            zip.end();
            zip.outputStream.pipe(fs.createWriteStream("example-mod.fabric.jar")).on("close", resolve);
        }));

        afterAll(() => new Promise(resolve => fs.unlink("example-mod.fabric.jar", resolve)));

        test("the format can be read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.fabric.jar");
            expect(metadata).toBeTruthy();
        });

        test("mod info can be read", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.fabric.jar"))!;
            expect(metadata.id).toBe("example-mod");
            expect(metadata.name).toBe("Example Mod");
            expect(metadata.version).toBe("0.1.0");
            expect(metadata.loaders).toMatchObject(["fabric"] as any);
        });

        test("project ids can be specified in the config file", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.fabric.jar"))!;
            expect(metadata.getProjectId(PublisherTarget.Modrinth)).toBe("AANobbMI");
            expect(metadata.getProjectId(PublisherTarget.CurseForge)).toBe("394468");
            expect(metadata.getProjectId(PublisherTarget.GitHub)).toBe("mc1.18-0.4.0-alpha5");
        });

        test("all dependencies are read", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.fabric.jar"))!;
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
            const metadata = (await ModMetadataReader.readMetadata("example-mod.fabric.jar"))!;
            const conflicting = metadata.dependencies.find(x => x.id === "conflicting-mod")!;
            expect(conflicting).toBeTruthy();
            expect(conflicting.id).toBe("conflicting-mod");
            expect(conflicting.kind).toBe(DependencyKind.Conflicts);
            expect(conflicting.version).toBe("<0.40.0");
            expect(conflicting.ignore).toBe(false);
            for (const project of PublisherTarget.getValues()) {
                expect(conflicting.getProjectSlug(project)).toBe(conflicting.id);
            }
        });

        test("version array is supported", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.fabric.jar"))!;
            const minecraft = metadata.dependencies.find(x => x.id === "minecraft");
            expect(minecraft.version).toStrictEqual("1.17 || 1.17.1");
        });

        test("custom metadata can be attached to dependency entry", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.fabric.jar"))!;
            const recommended = metadata.dependencies.find(x => x.id === "recommended-mod")!;
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
            const metadata = (await ModMetadataReader.readMetadata("example-mod.fabric.jar"))!;
            expect(metadata.dependencies.find(x => x.id === "minecraft")!.ignore).toBe(true);
            expect(metadata.dependencies.find(x => x.id === "java")!.ignore).toBe(true);
            expect(metadata.dependencies.find(x => x.id === "fabricloader")!.ignore).toBe(true);
        });

        test("special case dependencies (fabric) are replaced with their aliases", async() => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.fabric.jar"))!;
            const fabric = metadata.dependencies.find(x => x.id === "fabric")!;
            for (const target of PublisherTarget.getValues()) {
                expect(fabric.getProjectSlug(target) === "fabric-api");
            }
        });
    });

    describe("Forge", () => {
        beforeAll(() => new Promise(resolve => {
            const zip = new ZipFile();
            zip.addFile("./test/content/forge/mods.toml", "META-INF/mods.toml");
            zip.end();
            zip.outputStream.pipe(fs.createWriteStream("example-mod.forge.jar")).on("close", resolve);
        }));

        afterAll(() => new Promise(resolve => fs.unlink("example-mod.forge.jar", resolve)));

        test("the format can be read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.forge.jar");
            expect(metadata).toBeTruthy();
        });

        test("mod info can be read", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.forge.jar"))!;
            expect(metadata.id).toBe("example-mod");
            expect(metadata.name).toBe("Example Mod");
            expect(metadata.version).toBe("0.1.0");
            expect(metadata.loaders).toMatchObject(["forge"] as any);
        });

        test("project ids can be specified in the config file", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.forge.jar"))!;
            expect(metadata.getProjectId(PublisherTarget.Modrinth)).toBe("AANobbMI");
            expect(metadata.getProjectId(PublisherTarget.CurseForge)).toBe("394468");
            expect(metadata.getProjectId(PublisherTarget.GitHub)).toBe("mc1.18-0.4.0-alpha5");
        });

        test("all dependencies are read", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.forge.jar"))!;
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
            const metadata = (await ModMetadataReader.readMetadata("example-mod.forge.jar"))!;
            const included = metadata.dependencies.find(x => x.id === "included-mod")!;
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
            const metadata = (await ModMetadataReader.readMetadata("example-mod.forge.jar"))!;
            const recommended = metadata.dependencies.find(x => x.id === "recommended-mod")!;
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
            const metadata = (await ModMetadataReader.readMetadata("example-mod.forge.jar"))!;
            expect(metadata.dependencies.find(x => x.id === "minecraft")!.ignore).toBe(true);
            expect(metadata.dependencies.find(x => x.id === "java")!.ignore).toBe(true);
            expect(metadata.dependencies.find(x => x.id === "forge")!.ignore).toBe(true);
        });
    });

    describe("Quilt", () => {
        beforeAll(() => new Promise(resolve => {
            const zip = new ZipFile();
            zip.addFile("./test/content/quilt/quilt.mod.json", "quilt.mod.json");
            zip.end();
            zip.outputStream.pipe(fs.createWriteStream("example-mod.quilt.jar")).on("close", resolve);
        }));

        afterAll(() => new Promise(resolve => fs.unlink("example-mod.quilt.jar", resolve)));

        test("the format can be read", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.quilt.jar");
            expect(metadata).toBeTruthy();
        });

        test("mod info can be read", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.quilt.jar"))!;
            expect(metadata.id).toBe("example-mod");
            expect(metadata.name).toBe("Example Mod");
            expect(metadata.version).toBe("0.1.0");
            expect(metadata.loaders).toMatchObject(["quilt"] as any);
        });

        test("project ids can be specified in the config file", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.quilt.jar"))!;
            expect(metadata.getProjectId(PublisherTarget.Modrinth)).toBe("AANobbMI");
            expect(metadata.getProjectId(PublisherTarget.CurseForge)).toBe("394468");
            expect(metadata.getProjectId(PublisherTarget.GitHub)).toBe("mc1.18-0.4.0-alpha5");
        });

        test("all dependencies are read", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.quilt.jar"))!;
            expect(metadata.dependencies).toHaveLength(8);
            const dependencies = metadata.dependencies.reduce((agg, x) => { agg[x.id] = x; return agg; }, <Record<string, Dependency>>{});
            expect(dependencies["quilt_loader"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["quilt_base"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["minecraft"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["java"]?.kind).toBe(DependencyKind.Depends);
            expect(dependencies["recommended-mod"]?.kind).toBe(DependencyKind.Recommends);
            expect(dependencies["included-mod"]?.kind).toBe(DependencyKind.Includes);
            expect(dependencies["conflicting-mod"]?.kind).toBe(DependencyKind.Conflicts);
            expect(dependencies["breaking-mod"]?.kind).toBe(DependencyKind.Breaks);
        });

        test("dependency info can be read", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.quilt.jar"))!;
            const conflicting = metadata.dependencies.find(x => x.id === "conflicting-mod")!;
            expect(conflicting).toBeTruthy();
            expect(conflicting.id).toBe("conflicting-mod");
            expect(conflicting.kind).toBe(DependencyKind.Conflicts);
            expect(conflicting.version).toBe("<0.40.0");
            expect(conflicting.ignore).toBe(false);
            for (const project of PublisherTarget.getValues()) {
                expect(conflicting.getProjectSlug(project)).toBe(conflicting.id);
            }
        });

        test("version array is supported", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.quilt.jar"))!;
            const minecraft = metadata.dependencies.find(x => x.id === "minecraft");
            expect(minecraft.version).toStrictEqual("1.17 || 1.17.1");
        });

        test("custom metadata can be attached to dependency entry", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.quilt.jar"))!;
            const recommended = metadata.dependencies.find(x => x.id === "recommended-mod")!;
            expect(recommended).toBeTruthy();
            expect(recommended.id).toBe("recommended-mod");
            expect(recommended.kind).toBe(DependencyKind.Recommends);
            expect(recommended.version).toBe("0.2.0");
            expect(recommended.ignore).toBe(true);
            expect(recommended.getProjectSlug(PublisherTarget.Modrinth)).toBe("AAAA");
            expect(recommended.getProjectSlug(PublisherTarget.CurseForge)).toBe("42");
            expect(recommended.getProjectSlug(PublisherTarget.GitHub)).toBe("v0.2.0");
        });

        test("special case dependencies (minecraft, java and quilt_loader) are ignored by default", async () => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.quilt.jar"))!;
            expect(metadata.dependencies.find(x => x.id === "minecraft")!.ignore).toBe(true);
            expect(metadata.dependencies.find(x => x.id === "java")!.ignore).toBe(true);
            expect(metadata.dependencies.find(x => x.id === "quilt_loader")!.ignore).toBe(true);
        });

        test("special case dependencies (quilted_quilt_api) are replaced with their aliases", async() => {
            const metadata = (await ModMetadataReader.readMetadata("example-mod.quilt.jar"))!;
            const quilt = metadata.dependencies.find(x => x.id === "quilt_base")!;
            for (const target of PublisherTarget.getValues()) {
                expect(quilt.getProjectSlug(target) === "qsl");
            }
        });
    });

    describe("unsupported mod formats", () => {
        test("null is returned when the format is not supported or specified file does not exist", async () => {
            const metadata = await ModMetadataReader.readMetadata("example-mod.unknown.jar");
            expect(metadata).toBeNull();
        });
    });
});
