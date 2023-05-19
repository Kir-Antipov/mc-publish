import { TypeScriptNode } from "./typescript-node";
import { AbstractTypeScriptNode } from "./abstract-typescript-node";
import { TypeScriptExport } from "./typescript-export";
import { TypeScriptImport } from "./typescript-import";
import { TypeScriptImports } from "./typescript-imports";
import { getNewline, TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { $i } from "@/utils/collections/iterable";
import { PathLike, PathOrFileDescriptor, WriteFileOptions, writeFileSync } from "node:fs";
import { FileHandle, writeFile } from "node:fs/promises";

/**
 * Represents a TypeScript document, containing a collection of import and export statements and other nodes.
 */
export class TypeScriptDocument extends AbstractTypeScriptNode implements Iterable<TypeScriptNode> {
    /**
     * An instance of TypeScriptImports containing all import statements in this document.
     */
    private readonly _imports: TypeScriptImports;

    /**
     * An array of all nodes other than imports in this document.
     */
    private readonly _nodes: TypeScriptNode[];

    /**
     * Constructs a new {@link TypeScriptDocument} instance.
     */
    private constructor() {
        super();
        this._imports = TypeScriptImports.create();
        this._nodes = [];
    }

    /**
     * Creates a new {@link TypeScriptDocument} instance.
     */
    static create(): TypeScriptDocument {
        return new TypeScriptDocument();
    }

    /**
     * Returns an iterable of all import statements in this document.
     */
    imports(): Iterable<TypeScriptNode> {
        return this._imports;
    }

    /**
     * Returns an iterable of all nodes in this document.
     */
    nodes(): Iterable<TypeScriptNode> {
        return $i<TypeScriptNode>(this._nodes).unshift(this._imports);
    }

    /**
     * Gets the import associated with the specified path.
     *
     * @param path - The path of the import to retrieve.
     *
     * @returns The {@link TypeScriptImport} instance associated with the specified path, or `undefined` if no such import exists.
     */
    getImport(path: string): TypeScriptImport | undefined {
        return this._imports.getImport(path);
    }

    /**
     * Gets the import associated with the specified path, creating it if necessary.
     *
     * @param path - The path of the import to retrieve or create.
     *
     * @returns The {@link TypeScriptImport} instance associated with the specified path.
     */
    getOrCreateImport(path: string): TypeScriptImport {
        return this._imports.getOrCreateImport(path);
    }

    /**
     * Adds an import to this document.
     *
     * @param importNode - The import to add.
     *
     * @returns The {@link TypeScriptImport} instance that was added or merged.
     *
     * @remarks
     *
     * If an import already exists for the given path, its information will be merged with the specified import node.
     */
    addImport(importNode: TypeScriptImport): TypeScriptImport {
        return this._imports.addImport(importNode);
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
        return this._imports.addWildcardImport(path, wildcardImportName);
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
        return this._imports.addDefaultImport(path, defaultImportName);
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
        return this._imports.addNamedImport(path, namedImport);
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
        return this._imports.addNamedImports(path, namedImports);
    }

    /**
     * Adds an export statement to this document.
     *
     * @param exportedNode - The node to export.
     *
     * @returns The {@link TypeScriptExport} instance that was added to this document.
     */
    addExport(exportedNode: TypeScriptNode): TypeScriptExport {
        return this.addNode(TypeScriptExport.create(exportedNode));
    }

    /**
     * Adds a default export statement to this document.
     *
     * @param exportedNode - The node to export as the default export.
     *
     * @returns The {@link TypeScriptExport} instance that was added to this document.
     */
    addDefaultExport(exportedNode: TypeScriptNode): TypeScriptExport {
        return this.addNode(TypeScriptExport.create(exportedNode, true));
    }

    /**
     * Adds a node to this document.
     *
     * @param node - The node to add.
     *
     * @returns The node that was added to this document.
     */
    addNode<T extends TypeScriptNode>(node: T): T {
        if (node instanceof TypeScriptImport) {
            return this.addImport(node) as unknown as T;
        }

        if (node instanceof TypeScriptImports) {
            for (const importNode of node) {
                this.addImport(importNode);
            }
            return this._imports as unknown as T;
        }

        this._nodes.push(node);
        return node;
    }

    /**
     * Synchronously writes the content of this document to a file.
     *
     * @param file - The path or file descriptor to write to.
     * @param options - The options to use when formatting and writing the file.
     */
    saveSync(file: PathOrFileDescriptor, options?: TypeScriptFormattingOptions & WriteFileOptions): void {
        writeFileSync(file, this.format(options), options);
    }

    /**
     * Asynchronously writes the content of this document to a file.
     *
     * @param file - The path or file descriptor to write to.
     * @param options - The options to use when formatting and writing the file.
     */
    save(file: PathLike | FileHandle, options?: TypeScriptFormattingOptions & WriteFileOptions): Promise<void> {
        return writeFile(file, this.format(options), options);
    }

    /**
     * @inheritdoc
     */
    formatContent(options?: TypeScriptFormattingOptions): string {
        const newline = getNewline(options);

        const formattedNodes = $i(this).map(x => x.format(options)).filter(x => x).join(newline + newline);
        const formattedDocument = formattedNodes + newline;

        return formattedDocument;
    }

    /**
     * Returns an iterator over all nodes in this document.
     */
    [Symbol.iterator](): Iterator<TypeScriptNode> {
        return this.nodes()[Symbol.iterator]();
    }
}
