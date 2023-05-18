import { ArgumentError } from "@/utils/errors";
import { AbstractTypeScriptNode } from "./abstract-typescript-node";
import { getIndentation, getQuotes, TypeScriptFormattingOptions } from "./typescript-formatting-options";

/**
 * Represents a TypeScript import statement.
 */
export class TypeScriptImport extends AbstractTypeScriptNode {
    /**
     * The path or module specifier of the imported module.
     */
    private readonly _path: string;

    /**
     * Set of named imports, if any.
     */
    private _namedImports?: Set<string>;

    /**
     * The name of the default import, if any.
     */
    private _defaultImportName?: string;

    /**
     * The name used to refer to a wildcard import, if any.
     */
    private _wildcardImportName?: string;

    /**
     * Constructs a new {@link TypeScriptImport} instance with the specified parameters.
     *
     * @param path - The path or module specifier of the imported module.
     * @param namedImports - Set of named imports, if any.
     * @param defaultImportName - The name of the default import, if any.
     * @param wildcardImportName - The name used to refer to a wildcard import, if any.
     */
    private constructor(path: string, namedImports?: Set<string>, defaultImportName?: string, wildcardImportName?: string) {
        super();
        this._path = path;
        this._namedImports = namedImports;
        this._defaultImportName = defaultImportName;
        this._wildcardImportName = wildcardImportName;
        this.assertIsValidImport();
    }

    /**
     * Creates a new instance of {@link TypeScriptImport}.
     *
     * @param path - The path or module specifier of the imported module.
     * @param options - An optional set of configuration options for the import, such as named imports or a default import name.
     *
     * @returns A new {@link TypeScriptImport} instance.
     */
    static create(path: string, options?: TypeScriptImportOptions): TypeScriptImport {
        return new TypeScriptImport(
            path,
            options?.namedImports ? new Set(options.namedImports) : undefined,
            options?.defaultImportName,
            options?.wildcardImportName
        );
    }

    /**
     * Creates a new {@link TypeScriptImport} instance representing a wildcard import.
     *
     * @param path - The path or module specifier of the imported module.
     * @param wildcardImportName - The name used to refer to a wildcard import.
     *
     * @returns A new {@link TypeScriptImport} instance.
     */
    static createWildcardImport(path: string, wildcardImportName: string): TypeScriptImport {
        return new TypeScriptImport(path, undefined, undefined, wildcardImportName);
    }

    /**
     * Creates a new {@link TypeScriptImport} instance representing a default import.
     *
     * @param path - The path or module specifier of the imported module.
     * @param defaultImportName - The name of the default import.
     *
     * @returns A new {@link TypeScriptImport} instance.
     */
    static createDefaultImport(path: string, defaultImportName: string): TypeScriptImport {
        return new TypeScriptImport(path, undefined, defaultImportName);
    }

    /**
     * Creates a new {@link TypeScriptImport} instance representing a named import.
     *
     * @param path - The path or module specifier of the imported module.
     * @param namedImports - The set of named imports.
     *
     * @returns A new {@link TypeScriptImport} instance.
     */
    static createNamedImport(path: string, namedImports: Iterable<string>): TypeScriptImport {
        return new TypeScriptImport(path, new Set(namedImports));
    }

    /**
     * Creates a new {@link TypeScriptImport} instance representing an empty import.
     *
     * @param path - The path or module specifier of the imported module.
     *
     * @returns A new {@link TypeScriptImport} instance.
     */
    static createEmptyImport(path: string): TypeScriptImport {
        return new TypeScriptImport(path);
    }

    /**
     * Gets the path or module specifier of the imported module.
     */
    get path(): string {
        return this._path;
    }

    /**
     * Gets the iterable list of named imports, if any.
     */
    namedImports(): Iterable<string> {
        return this._namedImports || [];
    }

    /**
     * Adds a named import to the list of named imports.
     *
     * @param name - The name of the named import to add.
     *
     * @throws An error if the specified import name is an empty string.
     */
    addNamedImport(name: string): void {
        ArgumentError.throwIfNullOrEmpty(name, "name");

        this._namedImports ??= new Set();
        this._namedImports.add(name);
        this.assertIsValidImport();
    }

    /**
     * Adds multiple named imports to the list of named imports.
     *
     * @param names - An iterable list of named imports to add.
     *
     * @throws An error if any of the specified import names is an empty string.
     */
    addNamedImports(names: Iterable<string>): void {
        for (const name of names) {
            this.addNamedImport(name);
        }
    }

    /**
     * Deletes the specified named import from this instance's list of named imports.
     *
     * @param name - The name of the named import to delete.
     *
     * @returns `true` if the named import was deleted; otherwise, `false`.
     */
    deleteNamedImport(name: string): boolean {
        return !!this._namedImports?.delete(name);
    }

    /**
     * Gets the name of the default import, if any.
     */
    get defaultImportName(): string | undefined {
        return this._defaultImportName;
    }

    /**
     * Sets the name of the default import.
     *
     * @param name - The new name of the default import.
     */
    set defaultImportName(name: string | undefined) {
        this._defaultImportName = name;
        this.assertIsValidImport();
    }

    /**
     * Gets the name used to refer to a wildcard import, if any.
     */
    get wildcardImportName(): string | undefined {
        return this._wildcardImportName;
    }

    /**
     * Sets the name used to refer to a wildcard import.
     *
     * @param name - The new name used to refer to a wildcard import.
     */
    set wildcardImportName(name: string | undefined) {
        this._wildcardImportName = name;
        this.assertIsValidImport();
    }

    /**
     * Gets a value indicating whether this instance has any named imports.
     */
    get isNamedImport(): boolean {
        return !!this._namedImports?.size;
    }

    /**
     * Gets a value indicating whether this instance has a default import.
     */
    get isDefaultImport(): boolean {
        return !!this._defaultImportName;
    }

    /**
     * Gets a value indicating whether this instance is a wildcard import.
     */
    get isWildcardImport(): boolean {
        return !!this._wildcardImportName;
    }

    /**
     * Gets a value indicating whether this instance is an empty import
     * (i.e. has no named, default, or wildcard imports).
     */
    get isEmptyImport(): boolean {
        return !this.isWildcardImport && !this.isDefaultImport && !this.isNamedImport;
    }

    /**
     * Asserts that this instance is valid.
     *
     * @throws An error if this instance is invalid (i.e. a wildcard import cannot be mixed with default/named imports).
     */
    private assertIsValidImport(): void | never {
        if (this.isWildcardImport && (this.isDefaultImport || this.isNamedImport)) {
            throw new Error("Mixing wildcard import with default and/or named imports is not allowed.");
        }
    }

    /**
     * @inheritdoc
     */
    formatContent(options?: TypeScriptFormattingOptions): string {
        const indent = getIndentation(options);
        const quotes = getQuotes(options);

        if (this.isEmptyImport) {
            return `${indent}// import { } from ${quotes}${this._path}${quotes};`;
        }

        let formatted = `${indent}import `;
        if (this.isWildcardImport) {
            formatted += `* as ${this._wildcardImportName}`;
        }
        if (this.isDefaultImport) {
            formatted += this.defaultImportName;
        }
        if (this.isNamedImport) {
            const formattedNamedImports = (
                `{ ${
                    [...this._namedImports].join(", ")
                } }`
            );

            formatted += this.isDefaultImport ? ", " : "";
            formatted += formattedNamedImports;
        }
        formatted += ` from ${quotes}${this._path}${quotes};`;

        return formatted;
    }
}

/**
 * Options for creating a new TypeScriptImport instance.
 */
export interface TypeScriptImportOptions {
    /**
     * An iterable of named imports to include in the import statement.
     */
    namedImports?: Iterable<string>;

    /**
     * The name of the default import.
     */
    defaultImportName?: string;

    /**
     * The name to use when referring to a wildcard import.
     */
    wildcardImportName?: string;
}
