import { $i } from "@/utils/collections";
import { FileNotFoundError } from "@/utils/errors";
import glob from "fast-glob";
import StreamZip from "node-stream-zip";
import { PathLike, ReadStream, createReadStream, existsSync, readFileSync as readFileNodeSync, statSync } from "node:fs";
import { readFile as readFileNode } from "node:fs/promises";
import { basename, dirname } from "node:path";

/**
 * Represents a file and provides utility methods to access its properties.
 */
export class FileInfo {
    /**
     * The file path.
     */
    private readonly _path: string;

    /**
     * Constructs a new {@link FileInfo} instance.
     *
     * @param path - The file path.
     */
    constructor(path: string) {
        this._path = path;
    }

    /**
     * Casts the given value to a {@link FileInfo} instance.
     *
     * @param file - The file path, or a {@link FileInfo} instance.
     *
     * @returns A {@link FileInfo} instance, or `undefined` if the input could not be casted to such.
     */
    static of(file: string | FileInfo): FileInfo {
        if (file instanceof FileInfo) {
            return file;
        }

        return new FileInfo(String(file));
    }

    /**
     * Gets the file name.
     */
    get name(): string {
        return basename(this._path);
    }

    /**
     * Gets the directory name of the file.
     */
    get directoryName(): string {
        return dirname(this._path);
    }

    /**
     * Gets the file path.
     */
    get path(): string {
        return this._path;
    }

    /**
     * Checks if the file exists in the file system.
     */
    get exists(): boolean {
        return existsSync(this._path);
    }

    /**
     * Returns the size of the file in bytes.
     */
    get size(): number {
        return statSync(this._path).size;
    }

    /**
     * Gets the file path.
     *
     * Used to automatically convert this instance to a `Blob`.
     */
    get [Symbol.for("path")](): string {
        return this._path;
    }

    /**
     * Creates a readable stream from the file.
     *
     * @param encoding - The character encoding for the file.
     *
     * @returns A `ReadStream` instance.
     */
    stream(encoding?: BufferEncoding): ReadStream {
        return createReadStream(this._path, encoding);
    }

    /**
     * Reads the file and returns its content as a buffer.
     *
     * @returns A `Promise` that resolves to a `Buffer` containing the file content.
     */
    buffer(): Promise<Buffer> {
        return readFileNode(this._path);
    }

    /**
     * Reads the file and returns its content as a string.
     *
     * @param encoding - The character encoding for the file.
     *
     * @returns A `Promise` that resolves to a string containing the file content.
     */
    async text(encoding?: BufferEncoding): Promise<string> {
        return (await this.buffer()).toString(encoding);
    }

    /**
     * Reads the file and returns its content as a JSON object.
     *
     * @template T - The type of the object.
     *
     * @param encoding - The character encoding for the file.
     *
     * @returns A `Promise` that resolves to a JSON object containing the file content.
     */
    async json<T = unknown>(encoding?: BufferEncoding): Promise<T> {
        return JSON.parse(await this.text(encoding));
    }

    /**
     * Returns the file path.
     *
     * @returns The file path.
     */
    toString() {
        return this._path;
    }

    /**
     * Returns the file path.
     *
     * @returns The file path.
     */
    toJSON() {
        return this._path;
    }
}

/**
 * Compares two {@link FileInfo} objects or file paths for equality.
 *
 * @param left - {@link FileInfo} object or file path.
 * @param right - {@link FileInfo} object or file path.
 *
 * @returns `true` if both {@link FileInfo} objects or file paths are equal; otherwise, `false`.
 */
export function fileEquals(left: FileInfo | string, right: FileInfo | string): boolean {
    const leftPath = typeof left === "string" ? left : left?.path;
    const rightPath = typeof right === "string" ? right : right?.path;

    return leftPath === rightPath;
}

/**
 * Asynchronously finds files that match the given pattern(s).
 *
 * @param pattern - A glob pattern or an array of glob patterns to match.
 *
 * @returns A `Promise` that resolves to an array of {@link FileInfo} objects.
 */
export async function findFiles(pattern: string | string[]): Promise<FileInfo[]> {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const files = await Promise.all(patterns.map(x => glob(x)));
    return $i(files).flatMap(x => x).distinct().map(x => new FileInfo(x)).toArray();
}

/**
 * Synchronously finds files that match the given pattern(s).
 *
 * @param pattern - A glob pattern or an array of glob patterns to match.
 *
 * @returns An array of {@link FileInfo} objects.
 */
export function findFilesSync(pattern: string | string[]): FileInfo[] {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const files = patterns.map(x => glob.sync(x));
    return $i(files).flatMap(x => x).distinct().map(x => new FileInfo(x)).toArray();
}

/**
 * Reads the contents of the first file matching the specified glob pattern asynchronously.
 *
 * @param pattern - The glob pattern to match.
 *
 * @returns A promise that resolves to a Buffer containing the file contents.
 *
 * @throws {FileNotFoundError} - If no files matching the pattern are found.
 */
export async function readFile(pattern: PathLike): Promise<Buffer> {
    const file = await getFileName(pattern);
    return await readFileNode(file);
}

/**
 * Reads the contents of the first file matching the specified glob pattern asynchronously and returns it as a string.
 *
 * @param pattern - The glob pattern to match.
 * @param encoding - The optional encoding to use for reading the file. Defaults to `utf8`.
 *
 * @returns A promise that resolves to a string containing the file contents.
 *
 * @throws {FileNotFoundError} - If no files matching the pattern are found.
 */
export async function readAllText(pattern: PathLike, encoding?: BufferEncoding): Promise<string> {
    return (await readFile(pattern)).toString(encoding);
}

/**
 * Reads a zipped file and returns its content as a Buffer.
 *
 * @param pattern - The glob pattern used to locate the zip archive.
 * @param entry - The entry name of the file within the zip archive.
 *
 * @returns A promise that resolves to a Buffer containing the file contents.
 */
export async function readZippedFile(pattern: PathLike, entry: string) : Promise<Buffer> {
    const file = await getFileName(pattern);

    let zip = undefined as StreamZip.StreamZipAsync;
    try {
        // Dude, it's not my constructor, calm down.
        // eslint-disable-next-line new-cap
        zip = new StreamZip.async({ file });
        return await zip.entryData(entry);
    } finally {
        await zip?.close().catch(() => undefined);
    }
}

/**
 * Reads a zipped file and returns its content as a string.
 *
 * @param pattern - The glob pattern used to locate the zip archive.
 * @param entry - The entry name of the file within the zip archive.
 * @param encoding - The optional encoding to use for reading the file. Defaults to `utf8`.
 *
 * @returns A promise that resolves to a string containing the file contents.
 */
export async function readAllZippedText(pattern: PathLike, entry: string, encoding?: BufferEncoding) : Promise<string> {
    return (await readZippedFile(pattern, entry)).toString(encoding);
}

/**
 * Reads the contents of the first file matching the specified glob pattern synchronously.
 *
 * @param pattern - The glob pattern to match.
 *
 * @returns A Buffer containing the file contents.
 *
 * @throws {FileNotFoundError} - If no files matching the pattern are found.
 */
export function readFileSync(pattern: PathLike): Buffer {
    const file = getFileNameSync(pattern);
    return readFileNodeSync(file);
}

/**
 * Reads the contents of the first file matching the specified glob pattern synchronously and returns it as a string.
 *
 * @param pattern - The glob pattern to match.
 * @param encoding - The optional encoding to use for reading the file. Defaults to `utf-8`.
 *
 * @returns A string containing the file contents.
 *
 * @throws {FileNotFoundError} - If no files matching the pattern are found.
 */
export function readAllTextSync(pattern: PathLike, encoding?: BufferEncoding): string {
    return readFileSync(pattern).toString(encoding);
}

/**
 * Retrieves the name of the first file that matches the specified glob pattern.
 *
 * @param pattern - The file path or glob pattern.
 *
 * @returns The name of the first matching file.
 *
 * @throws {FileNotFoundError} - If no matching file is found.
 */
async function getFileName(pattern: PathLike): Promise<string> {
    if (existsSync(pattern)) {
        return pattern.toString();
    }

    const files = await glob(pattern.toString());
    if (files?.[0]) {
        return files[0];
    }

    throw new FileNotFoundError(pattern.toString());
}

/**
 * Synchronously retrieves the name of the first file that matches the specified glob pattern.
 *
 * @param pattern - The file path or glob pattern.
 *
 * @returns The name of the first matching file.
 *
 * @throws {FileNotFoundError} - If no matching file is found.
 */
function getFileNameSync(pattern: PathLike): string {
    if (existsSync(pattern)) {
        return pattern.toString();
    }

    const files = glob.sync(pattern.toString());
    if (files?.[0]) {
        return files[0];
    }

    throw new FileNotFoundError(pattern.toString());
}
