import { TypeScriptComment } from "./typescript-comment";
import { TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { TypeScriptNode } from "./typescript-node";

/**
 * Represents a TypeScript node that can contain comments.
 */
export interface CommentableTypeScriptNode extends TypeScriptNode {
    /**
     * Returns an iterable of comments associated with this node.
     */
    comments(): Iterable<TypeScriptComment>;

    /**
     * Adds a comment to this node.
     *
     * @param comment - The comment to add to this node.
     *
     * @returns The comment that was added.
     */
    addComment(comment: TypeScriptComment): TypeScriptComment;

    /**
     * Deletes a previously added comment from this node.
     *
     * @param comment - The comment to delete from this node.
     *
     * @returns `true` if the comment was deleted successfully; otherwise, `false`.
     */
    deleteComment(comment: TypeScriptComment): boolean;

    /**
     * Formats the comments associated with this node as a string according to the specified formatting options.
     *
     * @param options - Formatting options that determine how the output should be formatted.
     *
     * @returns A string representation of the comments associated with this node.
     */
    formatComments(options?: TypeScriptFormattingOptions): string;

    /**
     * Formats the content of this node as a string according to the specified formatting options.
     *
     * @param options - Formatting options that determine how the output should be formatted.
     *
     * @returns A string representation of the content of this node.
     */
    formatContent(options?: TypeScriptFormattingOptions): string;
}

/**
 * Determines whether the given node is a {@link CommentableTypeScriptNode}.
 *
 * @param node - The node to check.
 *
 * @returns `true` if the given node is a {@link CommentableTypeScriptNode}; otherwise, `false`.
 */
export function isCommentableTypeScriptNode(node: TypeScriptNode): node is CommentableTypeScriptNode {
    return typeof (node as CommentableTypeScriptNode).comments === "function";
}
