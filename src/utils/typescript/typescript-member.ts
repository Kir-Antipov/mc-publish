import { TypeScriptNode } from "./typescript-node";
import { DEFAULT_QUOTES } from "./typescript-formatting-options";

/**
 * Represents a member in a TypeScript object.
 */
export interface TypeScriptMember extends TypeScriptNode {
    /**
     * Gets the name of the member.
     */
    get name(): string;
}

/**
 * Determines whether a name is a valid TypeScript member name.
 *
 * @param name - The name to check.
 *
 * @returns `true` if the name is a valid TypeScript member name; otherwise, `false`.
 */
export function isValidMemberName(name: string): boolean {
    return /^[\p{L}_][\p{L}0-9_]*$/u.test(name);
}

/**
 * Escapes a member name so that it can be used safely in TypeScript code.
 *
 * @param name - The name of the member to escape.
 * @param quotes - Quotes to use around the escaped name. Defaults to {@link DEFAULT_QUOTES}.
 *
 * @returns The escaped member name.
 */
export function escapeMemberName(name: string, quotes?: string): string {
    if (isValidMemberName(name)) {
        return name;
    }

    quotes ||= DEFAULT_QUOTES;
    const escapedName = JSON.stringify(name).slice(1, -1).replaceAll(/[`']/g, "\\$&");
    return `[${quotes}${escapedName}${quotes}]`;
}
