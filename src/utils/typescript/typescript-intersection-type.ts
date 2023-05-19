import { TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { TypeScriptTypeDefinition } from "./typescript-type-definition";
import { TypeScriptTypeLiteral } from "./typescript-type-literal";

/**
 * Represents a TypeScript intersection type definition.
 */
export class TypeScriptIntersectionType implements TypeScriptTypeDefinition {
    /**
     * An array of types that compose this intersection type.
     */
    private readonly _composingTypes: readonly TypeScriptTypeDefinition[];

    /**
     * Constructs a new {@link TypeScriptIntersectionType} instance.
     *
     * @param composingTypes - The iterable of types composing the intersection.
     */
    private constructor(composingTypes: readonly TypeScriptTypeDefinition[]) {
        this._composingTypes = composingTypes;
    }

    /**
     * Creates a new {@link TypeScriptIntersectionType} instance.
     *
     * @param composingTypes - The iterable of types composing the intersection.
     *
     * @returns A new {@link TypeScriptIntersectionType} instance.
     */
    static create(composingTypes: Iterable<TypeScriptTypeDefinition>): TypeScriptIntersectionType {
        const composingTypesArray = [...composingTypes];
        if (!composingTypesArray.length) {
            composingTypesArray.push(TypeScriptTypeLiteral.NEVER);
        }

        return new TypeScriptIntersectionType(composingTypesArray);
    }

    /**
     * @inheritdoc
     */
    get isComposite(): true {
        return true;
    }

    /**
     * @inheritdoc
     */
    get isUnion(): false {
        return false;
    }

    /**
     * @inheritdoc
     */
    get isIntersection(): true {
        return true;
    }

    /**
     * @inheritdoc
     */
    get isAlias(): false {
        return false;
    }

    /**
     * @inheritdoc
     */
    composingTypes(): Iterable<TypeScriptTypeDefinition> {
        return this._composingTypes;
    }

    /**
     * @inheritdoc
     */
    format(options?: TypeScriptFormattingOptions): string {
        const formattedTypes = this._composingTypes.map(x => `(${x.format(options).trim()})`).join(" & ");
        return formattedTypes;
    }
}
