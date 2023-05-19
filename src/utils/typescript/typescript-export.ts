import { TypeScriptNode } from "./typescript-node";
import { AbstractTypeScriptNode } from "./abstract-typescript-node";
import { getIndentation, getNewline, TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { isCommentableTypeScriptNode } from "./commentable-typescript-node";

/**
 * Represents a TypeScript export statement.
 */
export class TypeScriptExport extends AbstractTypeScriptNode {
    /**
     * The exported node.
     */
    private readonly _exportedNode: TypeScriptNode;

    /**
     * Indicates whether this is a default export.
     */
    private readonly _isDefault: boolean;

    /**
     * Constructs a new {@link TypeScriptExport} instance with the specified exported node and default export flag.
     *
     * @param exportedNode - The exported node.
     * @param isDefault - Indicates whether this is a default export. Defaults to `false`.
     */
    private constructor(exportedNode: TypeScriptNode, isDefault?: boolean) {
        super();
        this._exportedNode = exportedNode;
        this._isDefault = isDefault || false;
    }

    /**
     * Creates a new {@link TypeScriptExport} instance with the specified exported node.
     *
     * @param exportedNode - The exported node.
     * @param isDefault - Indicates whether this is a default export. Defaults to `false`.
     *
     * @returns A new {@link TypeScriptExport} instance representing a non-default export.
     */
    static create(exportedNode: TypeScriptNode, isDefault?: boolean): TypeScriptExport {
        return new TypeScriptExport(exportedNode, isDefault);
    }

    /**
     * Gets the exported node.
     */
    get exportedNode(): TypeScriptNode {
        return this._exportedNode;
    }

    /**
     * Gets a value indicating whether this is a default export.
     */
    get isDefault(): boolean {
        return this._isDefault;
    }

    /**
     * @inheritdoc
     */
    formatComments(options?: TypeScriptFormattingOptions): string {
        const newline = getNewline(options);
        const node = this._exportedNode;

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

        const node = this._exportedNode;
        const formattedExportedNode = (isCommentableTypeScriptNode(node) ? node.formatContent(options) : node.format(options)).trimStart();
        const formattedExport = `${indent}export ${this._isDefault ? "default " : ""}${formattedExportedNode}${formattedExportedNode.endsWith(";") ? "" : ";"}`;

        return formattedExport;
    }
}
