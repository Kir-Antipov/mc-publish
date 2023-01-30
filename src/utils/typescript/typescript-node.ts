import { TypeScriptFormattingOptions } from "./typescript-formatting-options";

/**
 * Represents a TypeScript node that can be formatted as a string.
 */
export interface TypeScriptNode {
    /**
     * Formats the TypeScript node as a string with the specified options.
     *
     * @param options - The formatting options to apply.
     *
     * @returns The formatted string representation of the node.
     */
    format(options?: TypeScriptFormattingOptions): string;
}
