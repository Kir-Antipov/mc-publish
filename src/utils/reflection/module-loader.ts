import { ACTION_MODULE_LOADER } from "./module-loader.g";

/**
 * Represents a function that loads a module by its name.
 */
export interface ModuleLoader {
    /**
     * Loads a module by its name.
     *
     * @param name - The name of the module to load.
     *
     * @returns A promise that resolves with the loaded module.
     */
    (name: string): Promise<unknown>;
}

/**
 * A module loader implementation that loads modules using Node.js dynamic `import` syntax.
 */
/* eslint-disable-next-line no-new-func */
export const NODE_MODULE_LOADER: ModuleLoader = new Function("x", "return import(x).catch(() => undefined)") as (name: string) => Promise<unknown>;

/**
 * Represents a dynamic module loader that is capable of loading modules by their source path (e.g., `"utils/string-utils"`).
 */
export const DYNAMIC_MODULE_LOADER: ModuleLoader = ACTION_MODULE_LOADER;
