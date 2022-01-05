import crypto from "crypto";
import fs from "fs";

export function computeHash(path: string, algorithm: string): Promise<crypto.Hash> {
    const hash = crypto.createHash(algorithm);
    return new Promise(resolve => fs.createReadStream(path).on("data", data => hash.update(data)).on("end", () => resolve(hash)));
}
