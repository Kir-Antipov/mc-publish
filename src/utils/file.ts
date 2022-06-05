import fs from "fs";
import path from "path";

export class File {
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
}
