import { ModuleLoader, NODE_MODULE_LOADER } from "./module-loader";

/**
 * Represents an import directive.
 */
export interface ImportDirective {
    /**
     * The name of the value to import.
     */
    name: string;

    /**
     * The module to import the value from.
     */
    module?: string;

    /**
     * Whether the value to import is the default export of the module or not.
     *
     * Defaults to `false`.
     */
    isDefault?: boolean;
}

/**
 * Represents a result of executing an import directive.
 *
 * @template T - The type of value being imported.
 */
export interface ExecutedImportDirective<T = unknown> {
    /**
     * The imported value.
     */
    value?: T;

    /**
     * The module the value was imported from.
     */
    module: Record<string, unknown>;
}

/**
 * Options for executing an import directive.
 */
export interface ImportDirectiveExecutionOptions {
    /**
     * Determines whether the imported module is required or not.
     * If required and not present, will throw.
     *
     * Defaults to `false`.
     */
    required?: boolean;

    /**
     * A function for loading a module.
     */
    moduleLoader?: ModuleLoader;

    /**
     * A function that provides a default module.
     *
     * @param directive - The import directive to use when loading the default module.
     *
     * @returns A Promise resolving to the default module.
     */
    defaultModuleProvider?: (directive: ImportDirective) => Promise<unknown>;
}

/**
 * A default module provider.
 *
 * @returns The `globalThis` object.
 */
const DEFAULT_MODULE_PROVIDER = () => Promise.resolve(globalThis);

/**
 * The name of the default export.
 */
const DEFAULT_EXPORT_NAME = "default";

/**
 * Returns a string representation of an import directive.
 *
 * @param directive - The import directive to stringify.
 *
 * @returns A string representation of the import directive, or `undefined` if the input is invalid.
 *
 * @example
 *
 * ```
 * // "myModule->{myFunction}"
 * formatImportDirective({ name: "myFunction", module: "myModule", isDefault: false });
 *
 * // "@my-org/my-package->myClass"
 * formatImportDirective({ name: "myClass", module: "@my-org/my-package", isDefault: true });
 * ```
 */
export function formatImportDirective(directive: ImportDirective): string | undefined {
    if (!directive) {
        return undefined;
    }

    const path = directive.module ? `${directive.module}->` : "";
    const wrappedName = directive.isDefault ? directive.name : `{${directive.name}}`;
    return `${path}${wrappedName}`;
}

/**
 * Parses a stringified import directive into its constituent parts.
 *
 * @param stringifiedDirective - The stringified import directive to parse.
 *
 * @returns The parsed import directive, or `undefined` if the input is invalid.
 *
 * @example
 *
 * ```
 * // { name: "MyClass", module: "@my-org/my-package", isDefault: false }
 * parseImportDirective("@my-org/my-package->{MyClass}");
 *
 * // { name: "myFunction", module: undefined, isDefault: true }
 * parseImportDirective("myFunction");
 * ```
 */
export function parseImportDirective(stringifiedDirective: string): ImportDirective | undefined {
    if (!stringifiedDirective) {
        return undefined;
    }

    const parts = stringifiedDirective.split("->");
    const module = parts.length > 1 ? parts[0] : undefined;
    const wrappedName = parts[parts.length - 1];
    const isDefault = !wrappedName.startsWith("{") && !wrappedName.endsWith("}");
    const name = wrappedName.replaceAll(/^{|}$/g, "").trim();
    return { name, module, isDefault };
}

/**
 * Executes the given import directive and returns an object containing the imported value and the module it was imported from.
 *
 * @template T - The type of value being imported.
 *
 * @param directive - The import directive to execute.
 * @param options - Options for executing the import directive.
 *
 * @returns A Promise resolving to an object containing the imported value and the module it was imported from, if any; otherwise, `undefined`.
 */
export async function executeImportDirective<T = unknown>(directive: string | ImportDirective, options?: ImportDirectiveExecutionOptions): Promise<ExecutedImportDirective<T> | undefined> {
    directive = typeof directive === "string" ? parseImportDirective(directive) : directive;
    const moduleLoader = options?.moduleLoader || NODE_MODULE_LOADER;
    const defaultModuleProvider = options?.defaultModuleProvider || DEFAULT_MODULE_PROVIDER;

    const targetModule = await (directive.module ? moduleLoader(directive.module) : defaultModuleProvider(directive));
    if (options?.required && !targetModule) {
        throw new Error(`Cannot find module "${directive.module}".`);
    }
    if (!targetModule) {
        return undefined;
    }

    const importName = normalizeImportName(directive.name);
    const value = targetModule[directive.isDefault ? DEFAULT_EXPORT_NAME : importName] ?? targetModule[importName] ?? targetModule[directive.name];
    if (options?.required && value === undefined) {
        throw new Error(`Cannot find value "${directive.name}" in the imported module${directive.module ? ` "${directive.module}"` : ""}.`);
    }

    return { value, module: targetModule as Record<string, unknown> };
}

/**
 * Normalizes an import name.
 *
 * @param name - The import name to normalize.
 *
 * @returns A normalized import name.
 */
function normalizeImportName(name: string): string {
    /**
     * Trims whitespace from the name, if present.
     */
    name = name?.trim();

    /**
     * If the name is empty, return the default export name.
     */
    if (!name) {
        return DEFAULT_EXPORT_NAME;
    }

    /**
     * If the name starts with "[" or ends with "]" (i.e., points to the Array type),
     * return "Array".
     */
    if (name.startsWith("[") || name.endsWith("]")) {
        return Array.name;
    }

    /**
     * If the name contains generics, strip them and recursively call this function on the result.
     */
    if (name.includes("<") && name.includes(">")) {
        const nameWithoutGenerics = name.replaceAll(/<.*>/g, "");
        return normalizeImportName(nameWithoutGenerics);
    }

    /**
     * Otherwise, return the name as-is.
     */
    return name;
}
