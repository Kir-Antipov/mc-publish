import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { computeHash } from "../src/utils/hash-utils";
import fs from "fs";

describe("computeHash", () => {
    beforeAll(() => new Promise(resolve => {
        fs.writeFile("hello-world.txt", "Hello world!", resolve);
    }));

    afterAll(() => new Promise(resolve => fs.unlink("hello-world.txt", resolve)));

    test("sha1 is supported", async () => {
        const algorithm = "sha1";
        expect((await computeHash("hello-world.txt", algorithm)).digest("hex")).toBe("d3486ae9136e7856bc42212385ea797094475802");
    });

    test("sha256 is supported", async () => {
        const algorithm = "sha256";
        expect((await computeHash("hello-world.txt", algorithm)).digest("hex")).toBe("c0535e4be2b79ffd93291305436bf889314e4a3faec05ecffcbb7df31ad9e51a");
    });

    test("sha512 is supported", async () => {
        const algorithm = "sha512";
        expect((await computeHash("hello-world.txt", algorithm)).digest("hex")).toBe("f6cde2a0f819314cdde55fc227d8d7dae3d28cc556222a0a8ad66d91ccad4aad6094f517a2182360c9aacf6a3dc323162cb6fd8cdffedb0fe038f55e85ffb5b6");
    });
});
