import { splitLines } from "@/utils/string-utils";
import { getIndentation, getNewline, TypeScriptFormattingOptions, UNIX_NEWLINE } from "./typescript-formatting-options";
import { TypeScriptNode } from "./typescript-node";

/**
 * Represents a TypeScript comment.
 */
export class TypeScriptComment implements TypeScriptNode {
    /**
     * The text of the comment.
     */
    private readonly _text: string;

    /**
     * Constructs a new {@link TypeScriptComment} instance with the given text.
     *
     * @param text - The text of the comment.
     */
    private constructor(text: string) {
        this._text = text;
    }

    /**
     * Gets the text of the comment.
     */
    get text(): string {
        return this._text;
    }

    /**
     * Determines whether the comment is a single-line comment.
     */
    get isSingleline(): boolean {
        return isSinglelineComment(this._text);
    }

    /**
     * Determines whether the comment is a directive comment.
     */
    get isDirective(): boolean {
        return isDirectiveComment(this._text);
    }

    /**
     * Determines whether the comment is a multi-line comment.
     */
    get isMultiline(): boolean {
        return isMultilineComment(this._text);
    }

    /**
     * Determines whether the comment is a TSDoc comment.
     */
    get isTSDoc(): boolean {
        return isTSDocComment(this._text);
    }

    /**
     * Creates a {@link TypeScriptComment} from the given text or text lines and optional template.
     *
     * @param text - The text or text lines to create the comment from.
     * @param template - The template to use when formatting the comment, if any.
     *
     * @returns A new {@link TypeScriptComment} created from the given text.
     */
    static create(text: string | Iterable<string>, template?: TypeScriptCommentTemplate): TypeScriptComment {
        const lines = typeof text === "string" ? splitLines(text) : [...text];
        template ||= lines.length > 1 ? MULTILINE_TEMPLATE : SINGLELINE_TEMPLATE;

        const commentedLines = lines.map(x => template.prefix + x.trim());
        if (typeof template.startDelimiter === "string") {
            commentedLines.unshift(template.startDelimiter);
        }
        if (typeof template.endDelimiter === "string") {
            commentedLines.push(template.endDelimiter);
        }

        const commentText = commentedLines.join(UNIX_NEWLINE);
        return new TypeScriptComment(commentText);
    }

    /**
     * Creates a single-line {@link TypeScriptComment} from the given text or text lines.
     *
     * @param text - The text or text lines to create the comment from.
     *
     * @returns A new single-line {@link TypeScriptComment} created from the given text.
     */
    static createSingleline(text: string | Iterable<string>): TypeScriptComment {
        return TypeScriptComment.create(text, SINGLELINE_TEMPLATE);
    }

    /**
     * Creates a directive {@link TypeScriptComment} from the given text or text lines.
     *
     * @param text - The text or text lines to create the comment from.
     *
     * @returns A new directive {@link TypeScriptComment} created from the given text.
     */
    static createDirective(text: string | Iterable<string>): TypeScriptComment {
        return TypeScriptComment.create(text, DIRECTIVE_TEMPLATE);
    }

    /**
     * Creates a multi-line {@link TypeScriptComment} from the given text or text lines.
     *
     * @param text - The text or text lines to create the comment from.
     *
     * @returns A new multi-line {@link TypeScriptComment} created from the given text.
     */
    static createMultiline(text: string | Iterable<string>): TypeScriptComment {
        return TypeScriptComment.create(text, MULTILINE_TEMPLATE);
    }

    /**
     * Creates a TSDoc {@link TypeScriptComment} from the given text or text lines.
     *
     * @param text - The text or text lines to create the comment from.
     *
     * @returns A new TSDoc {@link TypeScriptComment} created from the given text.
     */
    static createTSDoc(text: string | Iterable<string>): TypeScriptComment {
        return TypeScriptComment.create(text, TSDOC_TEMPLATE);
    }

    /**
     * Parses the given text as a comment.
     *
     * @param text - The text to parse.
     *
     * @returns A {@link TypeScriptComment} created from the given text.
     */
    static parse(text: string): TypeScriptComment {
        return isComment(text) ? new TypeScriptComment(text) : TypeScriptComment.create(text);
    }

    /**
     * @inheritdoc
     */
    format(options?: TypeScriptFormattingOptions): string {
        const indent = getIndentation(options);
        const newline = getNewline(options);

        const lines = splitLines(this._text);
        const comment = lines.map(x => indent + x).join(newline);

        return comment;
    }
}

/**
 * Determines whether the given text represents a single-line comment.
 *
 * @param text - The text to check.
 *
 * @returns `true` if the text represents a single-line comment; otherwise, `false`.
 */
export function isSinglelineComment(text: string): boolean {
    return /^\s*\/\//.test(text);
}

/**
 * Determines whether the given text represents a directive comment.
 *
 * @param text - The text to check.
 *
 * @returns `true` if the text represents a directive comment; otherwise, `false`.
 */
export function isDirectiveComment(text: string): boolean {
    return /^\s*\/\/\//.test(text);
}

/**
 * Determines whether the given text represents a multi-line comment.
 *
 * @param text - The text to check.
 *
 * @returns `true` if the text represents a multi-line comment; otherwise, `false`.
 */
export function isMultilineComment(text: string): boolean {
    return /^\s*\/\*/.test(text);
}

/**
 * Determines whether the given text represents a TSDoc comment.
 *
 * @param text - The text to check.
 *
 * @returns `true` if the text represents a TSDoc comment; otherwise, `false`.
 */
export function isTSDocComment(text: string): boolean {
    return /^\s*\/\*\*/.test(text);
}

/**
 * Determines whether the given text represents a comment.
 *
 * @param text - The text to check.
 *
 * @returns `true` if the text represents a comment; otherwise, `false`.
 */
export function isComment(text: string): boolean {
    return /^\s*\/[/*]/.test(text);
}

/**
 * Represents a template for formatting TypeScript comments.
 */
export interface TypeScriptCommentTemplate {
    /**
     * The starting delimiter of the comment, if any.
     */
    startDelimiter?: string;

    /**
     * The prefix used to start each line of the comment.
     */
    prefix: string;

    /**
     * The ending delimiter of the comment, if any.
     */
    endDelimiter?: string;
}

/**
 * A pre-defined {@link TypeScriptCommentTemplate} for single-line comments.
 */
export const SINGLELINE_TEMPLATE: TypeScriptCommentTemplate = { prefix: "// " };

/**
 * A pre-defined {@link TypeScriptCommentTemplate} for directive comments.
 */
export const DIRECTIVE_TEMPLATE: TypeScriptCommentTemplate = { prefix: "/// " };

/**
 * A pre-defined {@link TypeScriptCommentTemplate} for multi-line comments.
 */
export const MULTILINE_TEMPLATE: TypeScriptCommentTemplate = { startDelimiter: "/*", prefix: " * ", endDelimiter: " */" };

/**
 * A pre-defined {@link TypeScriptCommentTemplate} for TSDoc comments.
 */
export const TSDOC_TEMPLATE: TypeScriptCommentTemplate = { startDelimiter: "/**", prefix: " * ", endDelimiter: " */" };
