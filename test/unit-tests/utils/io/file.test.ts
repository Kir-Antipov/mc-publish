import { describe, test, expect } from "@jest/globals";
import File from "../../../../src/utils/io/file";

describe("File", () => {
    describe("getFiles", () => {
        test("all files matching the given pattern are returned", async () => {
            expect(await File.getFiles("(README|LICENSE|FOO).md")).toHaveLength(2);
        });

        test("files matching the primary pattern are returned first", async () => {
            const files = await File.getFiles({ primary: "README.md", secondary: "(README|LICENSE|FOO).md" });
            expect(files).toHaveLength(2);
            expect(files[0]).toHaveProperty("name", "README.md");

            const inversedFiles = await File.getFiles({ primary: "LICENSE.md", secondary: "(README|LICENSE|FOO).md" });
            expect(inversedFiles).toHaveLength(2);
            expect(inversedFiles[0]).toHaveProperty("name", "LICENSE.md");
        });
    });

    describe("getRequiredFiles", () => {
        test("all files matching the given pattern are returned", async () => {
            expect(await File.getRequiredFiles("(README|LICENSE|FOO).md")).toHaveLength(2);
        });

        test("an error is thrown if no files are found", async () => {
            await expect(File.getRequiredFiles("FOO.md")).rejects.toBeInstanceOf(Error);
        });
    });
});
