import { basename, resolve as resolvePath } from "node:path";
import { ZipFile } from "yazl";

export async function zipFile(path: string | string[], zipPath?: string): Promise<Buffer> {
    const realPath = typeof path === "string" ? path : resolvePath(...path);
    zipPath ||= basename(realPath);

    const zip = new ZipFile();
    zip.addFile(realPath, zipPath);
    zip.end();

    const chunks = [] as Buffer[];
    for await (const chunk of zip.outputStream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
}

export async function zipContent(content: string | Buffer, zipPath: string): Promise<Buffer> {
    const zip = new ZipFile();
    zip.addBuffer(Buffer.from(content), zipPath);
    zip.end();

    const chunks = [] as Buffer[];
    for await (const chunk of zip.outputStream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
}
