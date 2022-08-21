import fs from "fs";
import path from "path";
import glob from "fast-glob";

export type FileSelector = string | { primary?: string, secondary?: string };

export const gradleOutputSelector = {
    primary: "build/libs/!(*-@(dev|sources|javadoc)).jar",
    secondary: "build/libs/*-@(dev|sources|javadoc).jar"
};

export default class File {
    public name: string;
    public path: string;

    public constructor(filePath: string) {
        this.name = path.basename(filePath);
        this.path = filePath;
        Object.freeze(this);
    }

    public getStream(): fs.ReadStream {
        return fs.createReadStream(this.path);
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

    public equals(file: unknown): boolean {
        return file instanceof File && file.path === this.path;
    }

    public static async getFiles(files: FileSelector): Promise<File[]> {
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

    public static async getRequiredFiles(files: FileSelector): Promise<File[] | never> {
        const foundFiles = await File.getFiles(files);
        if (foundFiles && foundFiles.length) {
            return foundFiles;
        }
        throw new Error(`Specified files ('${typeof files === "string" ? files : [files.primary, files.secondary].filter(x => x).join(", ")}') were not found`);
    }
}
