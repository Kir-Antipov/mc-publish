import { NODE_MODULE_LOADER, DYNAMIC_MODULE_LOADER } from "@/utils/reflection/module-loader";

describe("NODE_MODULE_LOADER", () => {
    test("returns undefined if a module cannot be loaded", async () => {
        const loadedModule = await NODE_MODULE_LOADER("#");

        expect(loadedModule).toBeUndefined();
    });
});

describe("DYNAMIC_MODULE_LOADER", () => {
    test("returns undefined if a module cannot be loaded", async () => {
        const loadedModule = await DYNAMIC_MODULE_LOADER("#");

        expect(loadedModule).toBeUndefined();
    });
});
