import { describe, test, expect } from "@jest/globals";
import { getFiles, getRequiredFiles } from "../src/utils/file-utils";

describe("getFiles", () => {
    test("all files matching the given pattern are returned", async () => {
        expect(await getFiles("(README|LICENSE|FOO).md")).toHaveLength(2);
    });

    test("files matching the primary pattern are returned first", async () => {
        const files = await getFiles({ primary: "README.md", secondary: "(README|LICENSE|FOO).md" });
        expect(files).toHaveLength(2);
        expect(files[0]).toHaveProperty("name", "README.md");

        const inversedFiles = await getFiles({ primary: "LICENSE.md", secondary: "(README|LICENSE|FOO).md" });
        expect(inversedFiles).toHaveLength(2);
        expect(inversedFiles[0]).toHaveProperty("name", "LICENSE.md");
    });
});

describe("getRequiredFiles", () => {
    test("all files matching the given pattern are returned", async () => {
        expect(await getRequiredFiles("(README|LICENSE|FOO).md")).toHaveLength(2);
    });

    test("an error is thrown if no files are found", async () => {
        await expect(getRequiredFiles("FOO.md")).rejects.toBeInstanceOf(Error);
    });
});
