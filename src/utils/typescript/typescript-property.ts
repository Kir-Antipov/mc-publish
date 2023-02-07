import { AbstractTypeScriptNode } from "./abstract-typescript-node";
import { escapeMemberName, TypeScriptMember } from "./typescript-member";
import { getIndentation, getQuotes, TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { TypeScriptTypeDefinition } from "./typescript-type-definition";
import { TypeScriptAccessModifier } from "./typescript-access-modifier";

/**
 * Represents a property in a TypeScript object type definition.
 */
export class TypeScriptProperty extends AbstractTypeScriptNode implements TypeScriptMember {
    /**
     * The name of the property.
     */
    private readonly _name: string;

    /**
     * The type definition of the property.
     */
    private readonly _type: TypeScriptTypeDefinition;

    /**
     * The set of configuration options for the property, such as whether it is read-only, optional, or abstract.
     */
    private readonly _options?: TypeScriptPropertyOptions;

    /**
     * Constructs a new {@link TypeScriptProperty} instance.
     *
     * @param name - The name of the property.
     * @param type - The type definition of the property.
     * @param options - An optional set of configuration options for the property, such as whether it is read-only, optional, or abstract.
     */
    private constructor(name: string, type: TypeScriptTypeDefinition, options?: TypeScriptPropertyOptions) {
        super();
        this._name = name;
        this._type = type;
        this._options = options;
    }

    /**
     * Creates a new {@link TypeScriptProperty} instance.
     *
     * @param name - The name of the property.
     * @param type - The type definition of the property.
     * @param options - An optional set of configuration options for the property, such as whether it is read-only, optional, or abstract.
     *
     * @returns A new {@link TypeScriptProperty} instance.
     */
    static create(name: string, type: TypeScriptTypeDefinition, options?: TypeScriptPropertyOptions): TypeScriptProperty {
        return new TypeScriptProperty(name, type, options);
    }

    /**
     * Gets the name of the property.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Gets the type definition of the property.
     */
    get type(): TypeScriptTypeDefinition {
        return this._type;
    }

    /**
     * Indicates whether this property is optional or not.
     */
    get isOptional(): boolean {
        return !!this._options?.isOptional;
    }

    /**
     * The access modifier for this property.
     */
    get accessModifier(): TypeScriptAccessModifier | undefined {
        return this._options?.accessModifier;
    }

    /**
     * Indicates whether this property is read-only or not.
     */
    get isReadOnly(): boolean {
        return !!this._options?.isReadOnly;
    }

    /**
     * Indicates whether this property is abstract or not.
     */
    get isAbstract(): boolean {
        return !!this._options?.isAbstract;
    }

    /**
     * Indicates whether this property is static or not.
     */
    get isStatic(): boolean {
        return !!this._options?.isStatic;
    }

    /**
     * Returns a new {@link TypeScriptProperty} instance with the specified properties.
     *
     * @param properties - An object containing one or more properties to update.
     *
     * @returns A new {@link TypeScriptProperty} instance.
     */
    with(properties?: TypeScriptPropertyLike): TypeScriptProperty {
        const name = properties?.name ?? this._name;
        const type = properties?.type ?? this._type;
        const options = { ...this._options, ...properties };
        const copiedProperty = TypeScriptProperty.create(name, type, options);
        for (const comment of this.comments()) {
            copiedProperty.addComment(comment);
        }
        return copiedProperty;
    }

    /**
     * @inheritdoc
     */
    formatContent(options?: TypeScriptFormattingOptions): string {
        const indent = getIndentation(options);
        const quotes = getQuotes(options);

        const formattedName = escapeMemberName(this._name, quotes);
        const formattedType = this._type.format(options).trimStart();
        const accessModifier = this.accessModifier ? `${this.accessModifier} ` : "";
        const staticModifier = this.isAbstract ? "static " : "";
        const abstractModifier = this.isAbstract ? "abstract " : "";
        const readonlyModifier = this.isReadOnly ? "readonly " : "";
        const optionalModifier = this.isOptional ? "?" : "";
        const formattedProperty = `${indent}${accessModifier}${staticModifier}${abstractModifier}${readonlyModifier}${formattedName}${optionalModifier}: ${formattedType};`;

        return formattedProperty;
    }
}

/**
 * Options for creating a new TypeScript property.
 */
export interface TypeScriptPropertyOptions {
    /**
     * Indicates whether this property is optional or not.
     */
    isOptional?: boolean;

    /**
     * The access modifier for this property.
     */
    accessModifier?: TypeScriptAccessModifier;

    /**
     * Indicates whether this property is read-only or not.
     */
    isReadOnly?: boolean;

    /**
     * Indicates whether this property is abstract or not.
     */
    isAbstract?: boolean;

    /**
     * Indicates whether this property is static or not.
     */
    isStatic?: boolean;
}

/**
 * Describes the properties of a {@link TypeScriptProperty} instance.
 */
interface TypeScriptPropertyLike extends TypeScriptPropertyOptions {
    /**
     * The name of the property.
     */
    name?: string;

    /**
     * The type definition of the property.
     */
    type?: TypeScriptTypeDefinition;
}
