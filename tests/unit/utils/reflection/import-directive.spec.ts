import {
    formatImportDirective,
    parseImportDirective,
    executeImportDirective,
} from "@/utils/reflection/import-directive";

describe("formatImportDirective", () => {
    test("formats an import directive correctly", () => {
        expect(formatImportDirective({ name: "myFunction", module: "myModule", isDefault: false })).toEqual("myModule->{myFunction}");
        expect(formatImportDirective({ name: "myClass", module: "@my-org/my-package", isDefault: true })).toEqual("@my-org/my-package->myClass");
        expect(formatImportDirective({ name: "myFunction", isDefault: false })).toEqual("{myFunction}");
        expect(formatImportDirective({ name: "myFunction", isDefault: true })).toEqual("myFunction");
        expect(formatImportDirective({ name: "" })).toEqual("{}");
    });

    test("returns undefined for a null or undefined directive", () => {
        expect(formatImportDirective(null)).toBeUndefined();
        expect(formatImportDirective(undefined)).toBeUndefined();
    });
});

describe("parseImportDirective", () => {
    test("parses a stringified import directive correctly", () => {
        expect(parseImportDirective("@my-org/my-package->{MyClass}")).toEqual({ name: "MyClass", module: "@my-org/my-package", isDefault: false });
        expect(parseImportDirective("@my-org/my-package->MyClass")).toEqual({ name: "MyClass", module: "@my-org/my-package", isDefault: true });
        expect(parseImportDirective("myFunction")).toEqual({ name: "myFunction", module: undefined, isDefault: true });
        expect(parseImportDirective("{myFunction}")).toEqual({ name: "myFunction", module: undefined, isDefault: false });
    });

    test("returns undefined for an invalid directive", () => {
        expect(parseImportDirective(null)).toEqual(undefined);
        expect(parseImportDirective(undefined)).toEqual(undefined);
        expect(parseImportDirective("")).toEqual(undefined);
    });
});

describe("executeImportDirective", () => {
    test("successfully executes an import directive", async () => {
        const mockModule = { myFunction: jest.fn() };
        const mockModuleLoader = jest.fn().mockResolvedValue(mockModule);
        const directive = { name: "myFunction", module: "myModule", isDefault: false };

        const result = await executeImportDirective(directive, { moduleLoader: mockModuleLoader });

        expect(result).toEqual({ value: mockModule.myFunction, module: mockModule });
        expect(mockModuleLoader).toHaveBeenCalledTimes(1);
        expect(mockModuleLoader).toHaveBeenCalledWith("myModule");
    });

    test("successfully executes an import directive for a default import", async () => {
        const mockModule = { default: jest.fn() };
        const mockModuleLoader = jest.fn().mockResolvedValue(mockModule);
        const directive = { name: "myFunction", module: "myModule", isDefault: true };

        const result = await executeImportDirective(directive, { moduleLoader: mockModuleLoader });

        expect(result).toEqual({ value: mockModule.default, module: mockModule });
        expect(mockModuleLoader).toHaveBeenCalledTimes(1);
        expect(mockModuleLoader).toHaveBeenCalledWith("myModule");
    });

    test("returns undefined instead of a missing non-required value in an existing module", async () => {
        const mockModule = {};
        const mockModuleLoader = jest.fn().mockResolvedValue(mockModule);
        const directive = { name: "nonExistentValue", module: "myModule", isDefault: false };

        const result = await executeImportDirective(directive, { moduleLoader: mockModuleLoader });

        expect(result).toEqual({ value: undefined, module: mockModule });
        expect(mockModuleLoader).toHaveBeenCalledWith("myModule");
        expect(mockModuleLoader).toHaveBeenCalledTimes(1);
    });

    test("returns undefined instead a missing non-required module", async () => {
        const nonExistentModuleLoader = jest.fn().mockResolvedValue(undefined);
        const directive = { name: "nonExistentValue", module: "nonExistentModule", isDefault: false };

        const result = await executeImportDirective(directive, { moduleLoader: nonExistentModuleLoader });

        expect(nonExistentModuleLoader).toHaveBeenCalledWith("nonExistentModule");
        expect(result).toBeUndefined();
    });

    test("throws an error when a required value is missing from an existing module", async () => {
        const mockModuleLoader = jest.fn().mockResolvedValue({});
        const directive = { name: "nonExistentValue", module: "myModule", isDefault: false };

        await expect(executeImportDirective(directive, { required: true, moduleLoader: mockModuleLoader })).rejects.toThrow(`Cannot find value "${directive.name}" in the imported module "${directive.module}".`);
        expect(mockModuleLoader).toHaveBeenCalledWith("myModule");
        expect(mockModuleLoader).toHaveBeenCalledTimes(1);
    });

    test("throws an error when a required module is missing", async () => {
        const nonExistentModuleLoader = jest.fn().mockResolvedValue(undefined);
        const directive = { name: "nonExistentValue", module: "nonExistentModule", isDefault: false };

        await expect(executeImportDirective(directive, { required: true, moduleLoader: nonExistentModuleLoader })).rejects.toThrow(`Cannot find module "${directive.module}".`);
        expect(nonExistentModuleLoader).toHaveBeenCalledWith("nonExistentModule");
        expect(nonExistentModuleLoader).toHaveBeenCalledTimes(1);
    });
});
