import { statSync } from "node:fs";
import mockFs from "mock-fs";
import { zipContent } from "../../../utils/zip-utils";
import {
    FileInfo,
    fileEquals,
    findFiles,
    findFilesSync,
    readAllText,
    readAllTextSync,
    readAllZippedText,
    readFile,
    readFileSync,
    readZippedFile,
} from "@/utils/io/file-info";

beforeEach(async () => {
    mockFs({
        "path/to": {
            "test.txt": "test",
            "test.json": JSON.stringify({ foo: 42 }),
            "test.zip": await zipContent("test", "test.txt"),
        },
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("FileInfo", () => {
    describe("constructor", () => {
        test("constructs a new instance with the given path", () => {
            const info = new FileInfo("path/to/test.txt");

            expect(info.path).toBe("path/to/test.txt");
        });
    });

    describe("of", () => {
        test("constructs a new instance from the given path", () => {
            const info = FileInfo.of("test.txt");

            expect(info).toBeInstanceOf(FileInfo);
            expect(info.path).toBe("test.txt");
        });

        test("returns the same instance for a FileInfo object", () => {
            const info1 = new FileInfo("test.txt");
            const info2 = FileInfo.of(info1);

            expect(info2).toBe(info1);
        });
    });

    describe("name", () => {
        test("returns the file name", () => {
            const info = new FileInfo("path/to/test.txt");

            expect(info.name).toBe("test.txt");
        });
    });

    describe("directoryName", () => {
        test("returns the directory name of the file", () => {
            const info = new FileInfo("path/to/test.txt");

            expect(info.directoryName).toBe("path/to");
        });
    });

    describe("path", () => {
        test("returns the file path", () => {
            const info = new FileInfo("path/to/test.txt");

            expect(info.path).toBe("path/to/test.txt");
        });
    });

    describe("exists", () => {
        test("returns true for existing files", () => {
            const info = new FileInfo("path/to/test.txt");

            expect(info.exists).toBe(true);
        });

        test("returns false for non-existing files", () => {
            const info = new FileInfo("path/to/not-test.txt");

            expect(info.exists).toBe(false);
        });
    });

    describe("size", () => {
        test("returns the file size", () => {
            const info = new FileInfo("path/to/test.txt");

            expect(info.size).toBe(statSync("path/to/test.txt").size);
        });

        test("throws if the file does not exist", () => {
            const info = new FileInfo("path/to/not-test.txt");

            expect(() => info.size).toThrow();
        });
    });

    describe("stream", () => {
        test("creates a readable stream", () => new Promise(resolve => {
            const info = new FileInfo("path/to/test.txt");
            const stream = info.stream();

            expect(stream).toBeDefined();
            expect(stream.readable).toBe(true);

            stream.close(resolve);
        }));
    });

    describe("buffer", () => {
        test("returns a promise that resolves to a buffer", async () => {
            const info = new FileInfo("path/to/test.txt");
            const buffer = await info.buffer();

            expect(Buffer.isBuffer(buffer)).toBe(true);
            expect(buffer.toString()).toBe("test");
        });

        test("throws if the file does not exist", async () => {
            const info = new FileInfo("path/to/not-test.txt");

            await expect(info.buffer()).rejects.toThrow();
        });
    });

    describe("text", () => {
        test("returns a promise that resolves to a string", async () => {
            const info = new FileInfo("path/to/test.txt");
            const text = await info.text();

            expect(text).toBe("test");
        });

        test("throws if the file does not exist", async () => {
            const info = new FileInfo("path/to/not-test.txt");

            await expect(info.text()).rejects.toThrow();
        });
    });

    describe("json", () => {
        test("returns a promise that resolves to a json object", async () => {
            const info = new FileInfo("path/to/test.json");
            const json = await info.json();

            expect(json).toEqual({ foo: 42 });
        });

        test("throws if the file does not exist", async () => {
            const info = new FileInfo("path/to/not-test.json");

            await expect(info.json()).rejects.toThrow();
        });
    });

    describe("toString", () => {
        test("returns the file path", () => {
            const info = new FileInfo("path/to/test.txt");

            expect(info.toString()).toBe("path/to/test.txt");
        });
    });

    test("should be converted to JSON as a file path string", () => {
        const info = new FileInfo("path/to/test.txt");

        expect(JSON.stringify(info)).toBe("\"path/to/test.txt\"");
    });
});

describe("fileEquals", () => {
    test("returns true for equal file paths", () => {
        expect(fileEquals("path/to/test.txt", "path/to/test.txt")).toBe(true);
        expect(fileEquals(FileInfo.of("path/to/test.txt"), "path/to/test.txt")).toBe(true);
        expect(fileEquals("path/to/test.txt", FileInfo.of("path/to/test.txt"))).toBe(true);
        expect(fileEquals(FileInfo.of("path/to/test.txt"), FileInfo.of("path/to/test.txt"))).toBe(true);
    });

    test("returns false for different file paths", () => {
        expect(fileEquals("path/to/test.txt", "path/to/not-test.txt")).toBe(false);
        expect(fileEquals(FileInfo.of("path/to/test.txt"), "path/to/not-test.txt")).toBe(false);
        expect(fileEquals("path/to/test.txt", FileInfo.of("path/to/not-test.txt"))).toBe(false);
        expect(fileEquals(FileInfo.of("path/to/test.txt"), FileInfo.of("path/to/not-test.txt"))).toBe(false);
    });
});

describe("findFiles", () => {
    test("returns matching files for given pattern", async () => {
        const files = await findFiles("path/to/test.*");
        const paths = files.map(file => file.path);

        expect(paths).toEqual(expect.arrayContaining([
            "path/to/test.txt",
            "path/to/test.json",
        ]));
    });

    test("respects the order of the given patterns", async () => {
        const paths = ["path/to/test.json", "path/to/test.txt"];
        const variants = [paths, [...paths].reverse()];
        for (const variant of variants) {
            const files = await findFiles(variant);
            expect(files.map(x => x.path)).toEqual(variant);
        }
    });
});

describe("findFilesSync", () => {
    test("returns matching files for given pattern", () => {
        const files = findFilesSync("path/to/test.*");
        const paths = files.map(file => file.path);

        expect(paths).toEqual(expect.arrayContaining([
            "path/to/test.txt",
            "path/to/test.json",
        ]));
    });

    test("respects the order of the given patterns", () => {
        const paths = ["path/to/test.json", "path/to/test.txt"];
        const variants = [paths, [...paths].reverse()];
        for (const variant of variants) {
            const files = findFilesSync(variant);
            expect(files.map(x => x.path)).toEqual(variant);
        }
    });
});

describe("readFile", () => {
    test("reads the contents of the first matching file", async () => {
        const content = await readFile("path/to/*.txt");

        expect(Buffer.isBuffer(content)).toBe(true);
        expect(content.toString()).toEqual("test");
    });

    test("throws if no files were found", async () => {
        await expect(readFile("path/from/*.txt")).rejects.toThrow(/path\/from\/\*\.txt/);
    });
});

describe("readFileSync", () => {
    test("reads the contents of the first matching file", () => {
        const content = readFileSync("path/to/*.txt");

        expect(Buffer.isBuffer(content)).toBe(true);
        expect(content.toString()).toEqual("test");
    });

    test("throws if no files were found", () => {
        expect(() => readFileSync("path/from/*.txt")).toThrow(/path\/from\/\*\.txt/);
    });
});

describe("readAllText", () => {
    test("reads the contents of the first matching file as text", async () => {
        const content = await readAllText("path/to/*.txt");

        expect(content).toEqual("test");
    });

    test("throws if no files were found", async () => {
        await expect(readAllText("path/from/*.txt")).rejects.toThrow(/path\/from\/\*\.txt/);
    });
});

describe("readAllTextSync", () => {
    test("reads the contents of the first matching file as text", () => {
        const content = readAllTextSync("path/to/*.txt");

        expect(content).toEqual("test");
    });

    test("throws if no files were found", () => {
        expect(() => readAllTextSync("path/from/*.txt")).toThrow(/path\/from\/\*\.txt/);
    });
});

describe("readZippedFile", () => {
    test("reads the contents of the first matching file", async () => {
        const content = await readZippedFile("path/to/*.zip", "test.txt");

        expect(Buffer.isBuffer(content)).toBe(true);
        expect(content.toString()).toEqual("test");
    });

    test("throws if no files were found", async () => {
        await expect(readZippedFile("path/from/*.zip", "")).rejects.toThrow(/path\/from\/\*\.zip/);
    });

    test("throws if the entry does not exist within the zip", async () => {
        await expect(readZippedFile("path/to/test.zip", "not-test.txt")).rejects.toThrow(/Entry not found/);
    });
});

describe("readAllZippedText", () => {
    test("reads the contents of the first matching file", async () => {
        const content = await readAllZippedText("path/to/*.zip", "test.txt");

        expect(content).toEqual("test");
    });

    test("throws if no files were found", async () => {
        await expect(readAllZippedText("path/from/*.zip", "")).rejects.toThrow(/path\/from\/\*\.zip/);
    });

    test("throws if the entry does not exist within the zip", async () => {
        await expect(readAllZippedText("path/to/test.zip", "not-test.txt")).rejects.toThrow(/Entry not found/);
    });
});
