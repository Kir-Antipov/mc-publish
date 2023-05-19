import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

/**
 * Options that can be used with `fs.readFile()` to read a file asynchronously.
 */
export type AsyncReadFileOptions = Parameters<typeof readFile>[1];

/**
 * Options that can be used with `fs.readFileSync()` to read a file synchronously.
 */
export type SyncReadFileOptions = Parameters<typeof readFileSync>[1];

/**
 * All possible options that can be passed to `fs.readFile()` and `fs.readFileSync()`.
 */
export type ReadFileOptions = AsyncReadFileOptions | SyncReadFileOptions;

/**
 * Object-style options that can be used with `fs.readFile()` to read a file asynchronously.
 */
export type AsyncReadFileOptionsObject = Exclude<AsyncReadFileOptions, string>;

/**
 * Object-style options that can be used with `fs.readFileSync()` to read a file synchronously.
 */
export type SyncReadFileOptionsObject = Exclude<SyncReadFileOptions, string>;

/**
 * All possible object-style options that can be passed to `fs.readFile()` and `fs.readFileSync()`.
 */
export type ReadFileOptionsObject = AsyncReadFileOptionsObject | SyncReadFileOptionsObject;
