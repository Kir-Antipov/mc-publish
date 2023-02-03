import { TypeScriptNode } from "./typescript-node";

/**
 * Represents a TypeScript type definition.
 */
export interface TypeScriptTypeDefinition extends TypeScriptNode {
    /**
     * Indicates whether this type definition represents a composite type.
     *
     * @returns `true` if the type definition is a composite type; otherwise, `false`.
     */
    get isComposite(): boolean;

    /**
     * Indicates whether this type definition represents a union type.
     *
     * @returns `true` if the type definition is a union type; otherwise, `false`.
     */
    get isUnion(): boolean;

    /**
     * Indicates whether this type definition represents an intersection type.
     *
     * @returns `true` if the type definition is an intersection type; otherwise, `false`.
     */
    get isIntersection(): boolean;

    /**
     * Gets a value indicating whether this type definition represents an alias.
     *
     * @returns `true` if this type definition represents an alias; otherwise, `false`.
     */
    get isAlias(): boolean;

    /**
     * Returns an iterable of TypeScriptTypeDefinition objects representing the composing types of this type definition.
     */
    composingTypes(): Iterable<TypeScriptTypeDefinition>;
}

/**
 * Yields all the composing types of a given TypeScript type.
 *
 * @param type - The input TypeScriptTypeDefinition to decompose.
 *
 * @yields The next composing type of the input type.
 */
export function* decomposeType(type: TypeScriptTypeDefinition): Iterable<TypeScriptTypeDefinition> {
    if (!type.isComposite) {
        yield type;
        return;
    }

    for (const composingType of type.composingTypes()) {
        yield* decomposeType(composingType);
    }
}
