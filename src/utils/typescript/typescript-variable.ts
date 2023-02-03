import { TypeScriptNode } from "./typescript-node";
import { AbstractTypeScriptNode } from "./abstract-typescript-node";
import { getIndentation, getNewline, TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { isCommentableTypeScriptNode } from "./commentable-typescript-node";

/**
 * Represents the `const` keyword in TypeScript variable declaration.
 */
const CONST_DECLARATION = "const";

/**
 * Represents the `let` keyword in TypeScript variable declaration.
 */
const LET_DECLARATION = "let";

/**
 * Represents the `var` keyword in TypeScript variable declaration.
 */
const VAR_DECLARATION = "var";

/**
 * Represents a TypeScript variable declaration type.
 */
type TypeScriptVariableDeclaration = typeof CONST_DECLARATION | typeof LET_DECLARATION | typeof VAR_DECLARATION;

/**
 * Represents a TypeScript variable.
 */
export class TypeScriptVariable extends AbstractTypeScriptNode {
    /**
     * The name of the variable.
     */
    private readonly _name: string;

    /**
     * The value assigned to the TypeScript variable.
     */
    private readonly _value: TypeScriptNode;

    /**
     * The declaration type of the TypeScript variable (const, let, or var).
     */
    private readonly _declaration: TypeScriptVariableDeclaration;

    /**
     * Constructs a new {@link TypeScriptVariable} instance with the specified name, value, and declaration type.
     *
     * @param name - The name of the variable.
     * @param value - The value assigned to the variable.
     * @param declaration - The declaration type of the variable (const, let, or var). Defaults to `const`.
     */
    private constructor(name: string, value: TypeScriptNode, declaration?: TypeScriptVariableDeclaration) {
        super();
        this._name = name;
        this._value = value;
        this._declaration = declaration || CONST_DECLARATION;
    }

    /**
     * Creates a new {@link TypeScriptVariable} instance with the specified name, value, and declaration type.
     *
     * @param name - The name of the variable.
     * @param node - The value assigned to the variable.
     * @param declaration - The declaration type of the variable (const, let, or var). Defaults to `const`.
     *
     * @returns A new {@link TypeScriptVariable} instance.
     */
    static create(name: string, node: TypeScriptNode, declaration?: TypeScriptVariableDeclaration): TypeScriptVariable {
        return new TypeScriptVariable(name, node, declaration);
    }

    /**
     * Gets the declaration type of the TypeScript variable (const, let, or var).
     */
    get declaration(): TypeScriptVariableDeclaration {
        return this._declaration;
    }

    /**
     * Gets the name of the TypeScript variable.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Gets the value assigned to the TypeScript variable.
     */
    get value(): TypeScriptNode {
        return this._value;
    }

    /**
     * @inheritdoc
     */
    formatComments(options?: TypeScriptFormattingOptions): string {
        const newline = getNewline(options);
        const node = this._value;

        const thisComments = super.formatComments(options);
        const nodeComments = isCommentableTypeScriptNode(node) ? node.formatComments(options) : "";
        if (!thisComments) {
            return nodeComments;
        }
        if (!nodeComments) {
            return thisComments;
        }
        return `${thisComments}${newline}${nodeComments}`;
    }

    /**
     * @inheritdoc
     */
    formatContent(options?: TypeScriptFormattingOptions): string {
        const indent = getIndentation(options);

        const value = this._value;
        const formattedValue = (isCommentableTypeScriptNode(value) ? value.formatContent(options) : value.format(options)).trimStart();
        const formattedExport = `${indent}${this._declaration} ${this._name} = ${formattedValue}${formattedValue.endsWith(";") ? "" : ";"}`;

        return formattedExport;
    }
}
