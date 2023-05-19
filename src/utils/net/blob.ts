import { ConstructorReturnType } from "@/utils/types";

/* eslint-disable-next-line no-restricted-imports */
import { Blob as BlobPolyfill, blobFrom, blobFromSync } from "node-fetch";

/**
 * A `Blob` encapsulates immutable, raw data that can be safely shared across multiple worker threads.
 */
export const Blob = BlobPolyfill;

/**
 * A `Blob` encapsulates immutable, raw data that can be safely shared across multiple worker threads.
 */
export type Blob = ConstructorReturnType<typeof BlobPolyfill>;

/**
 * Checks if an object is a `Blob`.
 *
 * @param blob - The object to check.
 *
 * @returns `true` if the object is a `Blob`; otherwise, `false`.
 */
export function isBlob(blob: unknown): blob is Blob {
    const name = blob?.[Symbol.toStringTag];
    return name === "Blob" || name === "File";
}

/**
 * Reads a file from the given path and returns its content as a `Blob`.
 *
 * @param path - The file path to read the content from.
 *
 * @returns A `Promise` that resolves to a `Blob` containing the file content.
 */
export function readBlob(path: string): Promise<Blob> {
    return blobFrom(path);
}

/**
 * Synchronously reads a file from the given path and returns its content as a `Blob`.
 *
 * @param path - The file path to read the content from.
 *
 * @returns A `Blob` containing the file content.
 */
export function readBlobSync(path: string): Blob {
    return blobFromSync(path);
}
