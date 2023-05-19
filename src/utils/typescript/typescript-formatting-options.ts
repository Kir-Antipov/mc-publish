import { DEFAULT_NEWLINE } from "@/utils/environment";

/**
 * Represents options for formatting TypeScript code as a string.
 */
export interface TypeScriptFormattingOptions {
    /**
     * The character(s) to use for a single indentation level.
     *
     * If not specified, the value of {@link DEFAULT_TAB} (4 spaces) will be used.
     */
    tab?: string;

    /**
     * The number of spaces to use for a single indentation level.
     *
     * If not specified, the value of {@link DEFAULT_TAB_SIZE} (`4`) will be used.
     */
    tabSize?: number;

    /**
     * The number of indentation levels to apply.
     *
     * If not specified, no indentation will be applied.
     */
    indent?: number;

    /**
     * The characters to use for line breaks.
     *
     * If not specified, the value of {@link DEFAULT_NEWLINE} (`\r\n` on Windows, `\n` on Unix) will be used.
     */
    newline?: string;

    /**
     * The preferred style for quoting strings in the formatted code.
     *
     * If not specified, the value of {@link DEFAULT_QUOTES} (double quotes, `"`) will be used.
     */
    preferredQuotes?: string;
}

/**
 * The default string to use for a single indentation level.
 */
export const DEFAULT_TAB = "    ";

/**
 * The default number of spaces to use for a single indentation level.
 */
export const DEFAULT_TAB_SIZE = 4;

/**
 * The default style for quoting strings in the formatted code.
 */
export const DEFAULT_QUOTES = "\"";

export { DEFAULT_NEWLINE, UNIX_NEWLINE, WINDOWS_NEWLINE } from "@/utils/environment";

/**
 * Returns the string to use for a single indentation level, based on the given formatting options.
 *
 * @param options - The formatting options to use. If not provided, default values will be used.
 *
 * @returns The string to use for a single indentation level.
 */
export function getTab(options?: TypeScriptFormattingOptions): string {
    // If a specific tab character is specified, use it.
    if (typeof options?.tab === "string") {
        return options.tab;
    }

    // If a specific tab size is specified and it's not the same as the default, generate a new tab string from it.
    if (typeof options?.tabSize === "number" && options.tabSize !== DEFAULT_TAB_SIZE) {
        return createTab(options.tabSize);
    }

    // Otherwise, use the default tab string.
    return DEFAULT_TAB;
}

/**
 * Returns the indentation string to use based on the given formatting options.
 *
 * @param options - The formatting options to use. If not provided, default values will be used.
 *
 * @returns The indentation string to use.
 */
export function getIndentation(options?: TypeScriptFormattingOptions): string {
    const tab = getTab(options);
    return createIndentation(tab, options?.indent || 0);
}

/**
 * Returns the string to use for line breaks based on the given formatting options.
 *
 * @param options - The formatting options to use. If not provided, default values will be used.
 * @returns The string to use for line breaks.
 */
export function getNewline(options?: TypeScriptFormattingOptions): string {
    // If a specific newline character sequence is specified, use it.
    // Otherwise, use the default line break character sequence based on the current operating system.
    return typeof options?.newline === "string" ? options.newline : DEFAULT_NEWLINE;
}

/**
 * Returns the preferred style for quoting strings based on the given formatting options.
 *
 * @param options - The formatting options to use. If not provided, default values will be used.
 *
 * @returns The preferred style for quoting strings.
 */
export function getQuotes(options?: TypeScriptFormattingOptions): string {
    // If a specific quote style is specified, use it.
    // Otherwise, use the default quote string.
    return typeof options?.preferredQuotes === "string" ? options.preferredQuotes : DEFAULT_QUOTES;
}

/**
 * Returns a new set of formatting options with the indentation level incremented by the given amount.
 *
 * @param options - The formatting options to use as the starting point. If not provided, default values will be used.
 * @param step - The number of indentation levels to add. Defaults to `1` if not provided.
 *
 * @returns A new set of formatting options with the incremented indentation level.
 */
export function incrementIndent(options?: TypeScriptFormattingOptions, step?: number): TypeScriptFormattingOptions {
    const indent = (options?.indent || 0) + (step ?? 1);
    return { ...options, indent };
}

/**
 * A cache of previously generated tab strings, keyed by their length.
 */
const CACHED_TABS = new Map<number, string>([
    [DEFAULT_TAB_SIZE, DEFAULT_TAB],
]);

/**
 * Generates a string of spaces with the given width to use as an indentation level.
 *
 * @param tabSize - The number of spaces for a single indentation level.
 *
 * @returns The generated tab string.
 */
function createTab(tabSize: number): string {
    const cachedTab = CACHED_TABS.get(tabSize);
    if (cachedTab !== undefined) {
        return cachedTab;
    }

    const generatedTab = " ".repeat(tabSize);
    CACHED_TABS.set(tabSize, generatedTab);
    return generatedTab;
}

/**
 * A cache of previously generated indentation strings, keyed by the combination of their `tab` and `indent` values.
 */
const CACHED_INDENTATION = new Map<string, Map<number, string>>();

/**
 * Generates a string of spaces using the provided tab string and indent count.
 *
 * @param tab - The string to use for a single indentation level.
 * @param indent - The number of indentation levels to apply.
 *
 * @returns The generated indentation string.
 */
function createIndentation(tab: string, indent: number): string {
    if (!indent) {
        return "";
    }

    if (indent === 1) {
        return tab;
    }

    const cachedIndentationsByTab = CACHED_INDENTATION.get(tab) || new Map<number, string>();
    if (!cachedIndentationsByTab.size) {
        CACHED_INDENTATION.set(tab, cachedIndentationsByTab);
    }

    const cachedIndentation = cachedIndentationsByTab.get(indent);
    if (cachedIndentation !== undefined) {
        return cachedIndentation;
    }

    const generatedIndentation = tab.repeat(indent);
    cachedIndentationsByTab.set(indent, generatedIndentation);
    return generatedIndentation;
}
