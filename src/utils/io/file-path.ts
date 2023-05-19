import { PathLike } from "node:fs";
import { FileHandle } from "node:fs/promises";

/**
 * Represents a file path for asynchronous (non-blocking) operations.
 */
export type AsyncFilePath = PathLike | FileHandle;

/**
 * Represents a file path for synchronous (blocking) operations.
 */
export type SyncFilePath = PathLike | number;

/**
 * Represents a file path.
 */
export type FilePath = AsyncFilePath | SyncFilePath;

/**
 * Determines if the provided value is a valid {@link FilePath}.
 *
 * @param path - The value to check.
 *
 * @returns `true` if the value is a valid {@link FilePath}; otherwise, `false`.
 */
export function isFilePath(path: unknown): path is FilePath {
    return (
        typeof path === "string" ||
        typeof path === "number" ||
        typeof (path as URL)?.pathname === "string" ||
        Buffer.isBuffer(path) ||
        isFileHandle(path)
    );
}

/**
 * Determines if the provided value is a valid {@link AsyncFilePath}.
 *
 * @param path - The value to check.
 *
 * @returns `true` if the value is a valid {@link AsyncFilePath}; otherwise, `false`.
 */
export function isAsyncFilePath(path: unknown): path is AsyncFilePath {
    return isFilePath(path) && typeof path !== "number";
}

/**
 * Determines if the provided value is a valid {@link SyncFilePath}.
 *
 * @param path - The value to check.
 *
 * @returns `true` if the value is a valid {@link SyncFilePath}; otherwise, `false`.
 */
export function isSyncFilePath(path: unknown): path is SyncFilePath {
    return isFilePath(path) && !isFileHandle(path);
}

/**
 * Determines if the provided value is a valid {@link FileHandle}.
 *
 * @param path - The value to check.
 *
 * @returns `true` if the value is a valid {@link FileHandle}; otherwise, `false`.
 */
function isFileHandle(handle: unknown): handle is FileHandle {
    return typeof (handle as FileHandle)?.fd === "number";
}
