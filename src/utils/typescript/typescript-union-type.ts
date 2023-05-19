import { TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { TypeScriptTypeDefinition } from "./typescript-type-definition";
import { TypeScriptTypeLiteral } from "./typescript-type-literal";

/**
 * Represents a TypeScript union type definition.
 */
export class TypeScriptUnionType implements TypeScriptTypeDefinition {
    /**
     * An array of types that compose this union type.
     */
    private readonly _composingTypes: readonly TypeScriptTypeDefinition[];

    /**
     * Constructs a new {@link TypeScriptUnionType} instance.
     *
     * @param composingTypes - The iterable of types composing the union.
     */
    private constructor(composingTypes: readonly TypeScriptTypeDefinition[]) {
        this._composingTypes = composingTypes;
    }

    /**
     * Creates a new {@link TypeScriptUnionType} instance.
     *
     * @param composingTypes - The iterable of types composing the union.
     *
     * @returns A new {@link TypeScriptUnionType} instance.
     */
    static create(composingTypes: Iterable<TypeScriptTypeDefinition>): TypeScriptUnionType {
        const composingTypesArray = [...composingTypes];
        if (!composingTypesArray.length) {
            composingTypesArray.push(TypeScriptTypeLiteral.NEVER);
        }

        return new TypeScriptUnionType(composingTypesArray);
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
    get isUnion(): true {
        return true;
    }

    /**
     * @inheritdoc
     */
    get isIntersection(): false {
        return false;
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
        const formattedTypes = this._composingTypes.map(x => `(${x.format(options).trim()})`).join(" | ");
        return formattedTypes;
    }
}
