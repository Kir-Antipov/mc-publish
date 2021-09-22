import fs from "fs";
import path from "path";
import glob from "fast-glob";

export class File {
    public name: string;
    public path: string;

    public constructor(filePath: string) {
        this.name = path.basename(filePath);
        this.path = filePath;
        Object.freeze(this);
    }

    public async getBuffer(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.path, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            })
        });
    }

    public getStats(): Promise<fs.Stats> {
        return new Promise((resolve, reject) => fs.stat(this.path, (error, stats) => {
            if (error) {
                reject(error);
            } else {
                resolve(stats);
            }
        }));
    }

    public equals(file: unknown): boolean {
        return file instanceof File && file.path === this.path;
    }
}

export async function getFiles(files: string | { primary?: string, secondary?: string }): Promise<File[]> {
    if (!files || typeof files !== "string" && !files.primary && !files.secondary) {
        return [];
    }

    if (typeof files === "string") {
        return (await glob(files)).map(x => new File(x));
    }

    let results = [];
    if (files.primary) {
        results = (await glob(files.primary)).map(x => new File(x));
    }
    if (files.secondary) {
        results = results.concat((await glob(files.secondary)).map(x => new File(x)));
    }
    return results.filter((x, i, self) => self.findIndex(y => x.equals(y)) === i);
}

export function parseVersionFromFilename(filename: string): string {
    filename = path.parse(filename).name;
    const match = filename.match(/[a-z]{0,2}\d+\.\d+.*/i);
    return match ? match[0] : filename;
}

export function parseVersionTypeFromFilename(filename: string): "alpha" | "beta" | "release" {
    filename = path.parse(filename).name;
    if (filename.match(/[+-_]alpha/i)) {
        return "alpha";
    } else if (filename.match(/[+-_]beta/i)) {
        return "beta";
    } else {
        return "release";
    }
}
