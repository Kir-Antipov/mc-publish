import { AbstractTypeScriptNode } from "./abstract-typescript-node";
import { TypeScriptImport } from "./typescript-import";
import { getNewline, TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { $i } from "@/utils/collections/iterable";

/**
 * Represents a collection of {@link TypeScriptImport} instances.
 */
export class TypeScriptImports extends AbstractTypeScriptNode implements Iterable<TypeScriptImport> {
    /**
     * A Map containing {@link TypeScriptImport} instances, keyed by their import path.
     */
    private readonly _imports: Map<string, TypeScriptImport>;

    /**
     * Constructs a new {@link TypeScriptImports} instance.
     *
     * @param imports - An optional iterable containing {@link TypeScriptImport} instances to add to this object.
     */
    private constructor(imports?: Iterable<TypeScriptImport>) {
        super();
        this._imports = new Map(Array.from(imports || []).map(x => [x.path, x]));
    }

    /**
     * Creates a new {@link TypeScriptImports} instance.
     *
     * @param imports - An optional iterable containing {@link TypeScriptImport} instances to add to this object.
     *
     * @returns A new {@link TypeScriptImports} instance.
     */
    static create(imports?: Iterable<TypeScriptImport>): TypeScriptImports {
        return new TypeScriptImports(imports);
    }

    /**
     * Returns an iterable containing all {@link TypeScriptImport} instances in this object.
     */
    imports(): Iterable<TypeScriptImport> {
        return this._imports.values();
    }

    /**
     * Gets the {@link TypeScriptImport} instance associated with the specified path.
     *
     * @param path - The path of the import to retrieve.
     *
     * @returns The {@link TypeScriptImport} instance associated with the specified path, or `undefined` if no such import exists.
     */
    getImport(path: string): TypeScriptImport | undefined {
        return this._imports.get(path);
    }

    /**
     * Gets the {@link TypeScriptImport} instance associated with the specified path, creating it if necessary.
     *
     * @param path - The path of the import to retrieve or create.
     *
     * @returns The {@link TypeScriptImport} instance associated with the specified path.
     */
    getOrCreateImport(path: string): TypeScriptImport {
        if (!this._imports.has(path)) {
            this._imports.set(path, TypeScriptImport.createEmptyImport(path));
        }
        return this._imports.get(path);
    }

    /**
     * Adds an import to this instance.
     *
     * @param importNode - The {@link TypeScriptImport} instance to add.
     *
     * @returns The {@link TypeScriptImport} instance that was added or merged.
     *
     * @remarks
     *
     * If an import already exists for the given path, its information will be merged with the specified import node.
     */
    addImport(importNode: TypeScriptImport): TypeScriptImport {
        const existingImportNode = this._imports.get(importNode.path);
        this._imports.set(importNode.path, importNode);
        if (existingImportNode) {
            importNode.addNamedImports(existingImportNode.namedImports());
            importNode.defaultImportName ||= existingImportNode.defaultImportName;
            importNode.wildcardImportName ||= existingImportNode.wildcardImportName;
        }
        return importNode;
    }

    /**
     * Deletes an import from this instance.
     *
     * @param importNode - The import to delete.
     *
     * @returns `true` if the import was deleted; otherwise, `false`.
     */
    deleteImport(importNode: TypeScriptImport): boolean;

    /**
     * Deletes an import from this instance.
     *
     * @param path - The path of the import to delete.
     *
     * @returns `true` if the import was deleted; otherwise, `false`.
     */
    deleteImport(path: string): boolean;

    /**
     * Deletes an import from this instance.
     *
     * @param importNodeOrPath - The import to delete.
     *
     * @returns `true` if the import was deleted; otherwise, `false`.
     */
    deleteImport(importNodeOrPath: TypeScriptImport | string): boolean {
        const path = typeof importNodeOrPath === "string" ? importNodeOrPath : importNodeOrPath.path;
        return this._imports.delete(path);
    }

    /**
     * Adds a wildcard import to the {@link TypeScriptImport} instance associated with the specified path.
     *
     * @param path - The path of the import to add the wildcard import to.
     * @param wildcardImportName - The name to use when referring to the wildcard import.
     *
     * @returns The {@link TypeScriptImport} instance that was added or merged.
     */
    addWildcardImport(path: string, wildcardImportName: string): TypeScriptImport {
        const importNode = this.getOrCreateImport(path);
        importNode.wildcardImportName = wildcardImportName;
        return importNode;
    }

    /**
     * Adds a default import to the {@link TypeScriptImport} instance associated with the specified path.
     *
     * @param path - The path of the import to add the default import to.
     * @param defaultImportName - The name to use when referring to the default import.
     *
     * @returns The {@link TypeScriptImport} instance that was added or merged.
     */
    addDefaultImport(path: string, defaultImportName: string): TypeScriptImport {
        const importNode = this.getOrCreateImport(path);
        importNode.defaultImportName = defaultImportName;
        return importNode;
    }

    /**
     * Adds a named import to the {@link TypeScriptImport} instance associated with the specified path.
     *
     * @param path - The path of the import to add the named import to.
     * @param namedImport - The name of the named import to add.
     *
     * @returns The {@link TypeScriptImport} instance that was added or merged.
     */
    addNamedImport(path: string, namedImport: string): TypeScriptImport {
        const importNode = this.getOrCreateImport(path);
        importNode.addNamedImport(namedImport);
        return importNode;
    }

    /**
     * Adds multiple named imports to the {@link TypeScriptImport} instance associated with the specified path.
     *
     * @param path - The path of the import to add the named imports to.
     * @param namedImports - The iterable of named imports to add.
     *
     * @returns The {@link TypeScriptImport} instance that was added or merged.
     */
    addNamedImports(path: string, namedImports: Iterable<string>): TypeScriptImport {
        const importNode = this.getOrCreateImport(path);
        importNode.addNamedImports(namedImports);
        return importNode;
    }

    /**
     * @inheritdoc
     */
    formatContent(options?: TypeScriptFormattingOptions): string {
        const newline = getNewline(options);
        const formattedImports = $i(this).map(x => x.format(options)).join(newline);
        return formattedImports;
    }

    /**
     * Returns an iterable containing all {@link TypeScriptImport} instances in this object.
     */
    [Symbol.iterator](): Iterator<TypeScriptImport> {
        return this.imports()[Symbol.iterator]();
    }
}
