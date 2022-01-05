import { describe, test, expect } from "@jest/globals";
import { computeHash } from "../src/utils/hash-utils";

describe("computeHash", () => {
    test("sha1 is supported", async () => {
        const algorithm = "sha1";
        expect((await computeHash("./test/content/fabric.mod.json", algorithm)).digest("hex")).toBe("be90f16aa5c806e2bbcf151efee4ebce7899256b");
        expect((await computeHash("./test/content/mods.toml", algorithm)).digest("hex")).toBe("bf13f9ca36d5a5ebd55a3bda0b432ab4a007791a");
    });

    test("sha256 is supported", async () => {
        const algorithm = "sha256";
        expect((await computeHash("./test/content/fabric.mod.json", algorithm)).digest("hex")).toBe("583334cd90510cdc5c5068dd7cc3423adc9674abf8e200b3a165216bb0f6346d");
        expect((await computeHash("./test/content/mods.toml", algorithm)).digest("hex")).toBe("c420fd754f32553dde2a5118c27ca83b644ba73d230baf723fa00d5cb5b1aaac");
    });

    test("sha512 is supported", async () => {
        const algorithm = "sha512";
        expect((await computeHash("./test/content/fabric.mod.json", algorithm)).digest("hex")).toBe("18582ba1fbec5ab05d5b5679f6d5fa157792959fd22ac091f1be264fc709996d900c8514265f0d24e533c1174da2919fdd7441d1215bbf6866e68f71114979af");
        expect((await computeHash("./test/content/mods.toml", algorithm)).digest("hex")).toBe("b15c84290a1f9fad17fa4f3429fbb67d2555feafd617a5399ba95d5b6745659bc50e16e810d3bfe5bbdd4b66720b85daafd5ad78ece9a484c356c358d7b295ec");
    });
});
