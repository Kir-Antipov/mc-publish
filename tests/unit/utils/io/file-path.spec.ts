import { isAsyncFilePath, isFilePath, isSyncFilePath } from "@/utils/io/file-path";
import { FileHandle } from "node:fs/promises";

describe("isFilePath", () => {
    test("returns true for string file paths", () => {
        expect(isFilePath("path/to/file.txt")).toBe(true);
    });

    test("returns true for file descriptors", () => {
        expect(isFilePath(123)).toBe(true);
    });

    test("returns true for URL file paths", () => {
        expect(isFilePath(new URL("file:///path/to/file.txt"))).toBe(true);
    });

    test("returns true for Buffer file paths", () => {
        expect(isFilePath(Buffer.from("path/to/file.txt"))).toBe(true);
    });

    test("returns true for file handles", () => {
        expect(isFilePath({ fd: 1 } as FileHandle)).toBe(true);
    });

    test("returns false for invalid file paths", () => {
        expect(isFilePath(null)).toBe(false);
        expect(isFilePath(undefined)).toBe(false);
        expect(isFilePath({})).toBe(false);
        expect(isFilePath([])).toBe(false);
    });
});

describe("isAsyncFilePath", () => {
    test("returns true for string file paths", () => {
        expect(isAsyncFilePath("path/to/file.txt")).toBe(true);
    });

    test("returns true for URL file paths", () => {
        expect(isAsyncFilePath(new URL("file:///path/to/file.txt"))).toBe(true);
    });

    test("returns true for Buffer file paths", () => {
        expect(isAsyncFilePath(Buffer.from("path/to/file.txt"))).toBe(true);
    });

    test("returns true for file handles", () => {
        expect(isAsyncFilePath({ fd: 1 } as FileHandle)).toBe(true);
    });

    test("returns false for invalid file paths", () => {
        expect(isAsyncFilePath(null)).toBe(false);
        expect(isAsyncFilePath(undefined)).toBe(false);
        expect(isAsyncFilePath({})).toBe(false);
        expect(isAsyncFilePath([])).toBe(false);
        expect(isAsyncFilePath(1)).toBe(false);
    });
});

describe("isSyncFilePath", () => {
    test("returns true for string file paths", () => {
        expect(isSyncFilePath("path/to/file.txt")).toBe(true);
    });

    test("returns true for file descriptors", () => {
        expect(isSyncFilePath(123)).toBe(true);
    });

    test("returns true for URL file paths", () => {
        expect(isSyncFilePath(new URL("file:///path/to/file.txt"))).toBe(true);
    });

    test("returns true for Buffer file paths", () => {
        expect(isSyncFilePath(Buffer.from("path/to/file.txt"))).toBe(true);
    });

    test("returns false for file handles", () => {
        expect(isSyncFilePath({ fd: 1 } as FileHandle)).toBe(false);
    });

    test("returns false for invalid file paths", () => {
        expect(isSyncFilePath(null)).toBe(false);
        expect(isSyncFilePath(undefined)).toBe(false);
        expect(isSyncFilePath({})).toBe(false);
        expect(isSyncFilePath([])).toBe(false);
    });
});
