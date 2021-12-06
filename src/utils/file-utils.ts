import glob from "fast-glob";
import { File } from "./file";

export type FileSelector = string | { primary?: string, secondary?: string };

export const gradleOutputSelector: FileSelector = {
    primary: "build/libs/!(*-@(dev|sources)).jar",
    secondary: "build/libs/*-@(dev|sources).jar"
};

export async function getRequiredFiles(files: FileSelector): Promise<File[] | never> {
    const foundFiles = await getFiles(files);
    if (foundFiles && foundFiles.length) {
        return foundFiles;
    }
    throw new Error(`Specified files ('${typeof files === "string" ? files : [files.primary, files.secondary].filter(x => x).join(", ")}') were not found`);
}

export async function getFiles(files: FileSelector): Promise<File[]> {
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
