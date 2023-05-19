import { TypeScriptComment } from "./typescript-comment";
import { CommentableTypeScriptNode } from "./commentable-typescript-node";
import { getNewline, TypeScriptFormattingOptions } from "./typescript-formatting-options";

/**
 * Provides basic functionality for formatting TypeScript nodes with comments.
 */
export abstract class AbstractTypeScriptNode implements CommentableTypeScriptNode {
    /**
     * An array of `TypeScriptComment` instances representing the comments associated with this node.
     */
    private _comments?: TypeScriptComment[];

    /**
     * Returns an iterable of comments associated with this node.
     */
    comments(): Iterable<TypeScriptComment> {
        return this._comments || [];
    }

    /**
     * @inheritdoc
     */
    addComment(comment: TypeScriptComment): TypeScriptComment;

    /**
     * @inheritdoc
     */
    addComment(comment: string): TypeScriptComment;

    /**
     * @inheritdoc
     */
    addComment(comment: string | TypeScriptComment): TypeScriptComment {
        const commentNode = typeof comment === "string" ? TypeScriptComment.parse(comment) : comment;
        this._comments ??= [];
        this._comments.push(commentNode);
        return commentNode;
    }

    /**
     * Adds a TSDoc comment to this node.
     *
     * @param comment - The TSDoc comment to add to this node.
     *
     * @returns A new instance of {@link TypeScriptComment} representing the added TSDoc comment.
     */
    addTSDoc(comment: string): TypeScriptComment {
        return this.addComment(TypeScriptComment.createTSDoc(comment));
    }

    /**
     * @inheritdoc
     */
    deleteComment(comment: TypeScriptComment): boolean {
        const i = this._comments?.indexOf(comment) ?? -1;
        if (i === -1) {
            return false;
        }

        this._comments.splice(i, 1);
        return true;
    }

    /**
     * @inheritdoc
     */
    formatComments(options?: TypeScriptFormattingOptions): string {
        const newline = getNewline(options);
        const formattedComments = this._comments?.map(x => x.format(options)).join(newline) || "";
        return formattedComments;
    }

    /**
     * @inheritdoc
     */
    abstract formatContent(options?: TypeScriptFormattingOptions): string;

    /**
     * @inheritdoc
     */
    format(options?: TypeScriptFormattingOptions): string {
        const newline = getNewline(options);

        const formattedComments = this.formatComments(options);
        const formattedContent = this.formatContent(options);
        const formattedNode = `${formattedComments}${formattedComments ? newline : ""}${formattedContent}`;

        return formattedNode;
    }
}
