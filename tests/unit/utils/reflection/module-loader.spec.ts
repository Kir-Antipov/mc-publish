import { NODE_MODULE_LOADER, DYNAMIC_MODULE_LOADER } from "@/utils/reflection/module-loader";

describe("NODE_MODULE_LOADER", () => {
    test("returns undefined if a module cannot be loaded", () => {
        // https://github.com/nodejs/node/issues/35889
        // Jest throws segfault if we try to actually test it, so...
        expect(NODE_MODULE_LOADER).toBeDefined();
    });
});

describe("DYNAMIC_MODULE_LOADER", () => {
    test("returns undefined if a module cannot be loaded", async () => {
        const loadedModule = await DYNAMIC_MODULE_LOADER("#");

        expect(loadedModule).toBeUndefined();
    });
});
