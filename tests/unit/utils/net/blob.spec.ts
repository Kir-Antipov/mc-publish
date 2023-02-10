import mockFs from "mock-fs";
import { Blob, isBlob, readBlob, readBlobSync } from "@/utils/net/blob";

beforeEach(() => {
    mockFs({
        "test.txt": "test",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("isBlob", () => {
    test("returns true for Blob instances", () => {
        expect(isBlob(new Blob([]))).toBe(true);
    });

    test("returns false for non-Blob objects", () => {
        expect(isBlob({})).toBe(false);
    });

    test("returns false for null and undefined", () => {
        expect(isBlob(null)).toBe(false);
        expect(isBlob(undefined)).toBe(false);
    });
});

describe("readBlob", () => {
    test("reads a file and returns its content as a Blob", async () => {
        const blob = await readBlob("test.txt");

        expect(isBlob(blob)).toBe(true);
        expect(await blob.text()).toBe("test");
    });

    test("throws an error for non-existent file", async () => {
        await expect(readBlob("non-existent.txt")).rejects.toThrow();
    });
});

describe("readBlobSync", () => {
    test("reads a file synchronously and returns its content as a Blob", async () => {
        const blob = readBlobSync("test.txt");

        expect(isBlob(blob)).toBe(true);
        expect(await blob.text()).toBe("test");
    });

    test("throws an error for non-existent file", () => {
        expect(() => readBlobSync("non-existent.txt")).toThrow();
    });
});
