import { writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";

/**
 * Options that can be used with `fs.writeFile()` to write a file asynchronously.
 */
export type AsyncWriteFileOptions = Parameters<typeof writeFile>[2];

/**
 * Options that can be used with `fs.writeFileSync()` to write a file synchronously.
 */
export type SyncWriteFileOptions = Parameters<typeof writeFileSync>[2];

/**
 * All possible options that can be passed to `fs.writeFile()` and `fs.writeFileSync()`.
 */
export type WriteFileOptions = AsyncWriteFileOptions | SyncWriteFileOptions;

/**
 * Object-style options that can be used with `fs.writeFile()` to write a file asynchronously.
 */
export type AsyncWriteFileOptionsObject = Exclude<AsyncWriteFileOptions, string>;

/**
 * Object-style options that can be used with `fs.writeFileSync()` to write a file synchronously.
 */
export type SyncWriteFileOptionsObject = Exclude<SyncWriteFileOptions, string>;

/**
 * All possible object-style options that can be passed to `fs.writeFile()` and `fs.writeFileSync()`.
 */
export type WriteFileOptionsObject = AsyncWriteFileOptionsObject | SyncWriteFileOptionsObject;
