import { AbstractTypeScriptNode } from "./abstract-typescript-node";
import { getIndentation, TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { TypeScriptTypeDefinition } from "./typescript-type-definition";

/**
 * Represents a type alias in a TypeScript module.
 */
export class TypeScriptTypeAlias extends AbstractTypeScriptNode implements TypeScriptTypeDefinition {
    /**
     * The name of the type alias.
     */
    private readonly _name: string;

    /**
     * The type definition of the type alias.
     */
    private readonly _type: TypeScriptTypeDefinition;

    /**
     * Constructs a new {@link TypeScriptTypeAlias} instance.
     *
     * @param name - The name of the type alias.
     * @param type - The type definition of the type alias.
     */
    private constructor(name: string, type: TypeScriptTypeDefinition) {
        super();
        this._name = name;
        this._type = type;
    }

    /**
     * Creates a new {@link TypeScriptTypeAlias} instance.
     *
     * @param name - The name of the type alias.
     * @param type - The type definition of the type alias.
     *
     * @returns A new {@link TypeScriptTypeAlias} instance.
     */
    static create(name: string, type: TypeScriptTypeDefinition): TypeScriptTypeAlias {
        return new TypeScriptTypeAlias(name, type);
    }

    /**
     * Gets the name of the type alias.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Gets the type definition of the type alias.
     */
    get type(): TypeScriptTypeDefinition {
        return this._type;
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
    get isIntersection(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    get isAlias(): true {
        return true;
    }

    /**
     * @inheritdoc
     */
    composingTypes(): Iterable<TypeScriptTypeDefinition> {
        return [this._type];
    }

    /**
     * @inheritdoc
     */
    formatContent(options?: TypeScriptFormattingOptions): string {
        const indent = getIndentation(options);

        const formattedName = this._name;
        const formattedType = this._type.format(options).trimStart();
        const formattedTypeAlias = `${indent}type ${formattedName} = ${formattedType};`;

        return formattedTypeAlias;
    }
}
