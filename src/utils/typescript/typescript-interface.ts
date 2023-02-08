import { AbstractTypeScriptNode } from "./abstract-typescript-node";
import { getIndentation, TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { TypeScriptObject } from "./typescript-object";

/**
 * Represents an interface in a TypeScript module.
 */
export class TypeScriptInterface extends AbstractTypeScriptNode {
    /**
     * The name of the interface.
     */
    private readonly _name: string;

    /**
     * The object definition of the interface.
     */
    private readonly _definition: TypeScriptObject;

    /**
     * Constructs a new {@link TypeScriptInterface} instance.
     *
     * @param name - The name of the interface.
     * @param definition - The object definition of the interface.
     */
    private constructor(name: string, definition: TypeScriptObject) {
        super();
        this._name = name;
        this._definition = definition;
    }

    /**
     * Creates a new {@link TypeScriptInterface} instance.
     *
     * @param name - The name of the interface.
     * @param definition - The object definition of the interface.
     *
     * @returns A new {@link TypeScriptInterface} instance.
     */
    static create(name: string, definition?: TypeScriptObject): TypeScriptInterface {
        return new TypeScriptInterface(name, definition || TypeScriptObject.create());
    }

    /**
     * Gets the name of the interface.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Gets the object definition of the interface.
     */
    get definition(): TypeScriptObject {
        return this._definition;
    }

    /**
     * @inheritdoc
     */
    formatContent(options?: TypeScriptFormattingOptions): string {
        const indent = getIndentation(options);

        const formattedName = this._name;
        const formattedDefinition = this._definition.format(options).trimStart();
        const formattedInterface = `${indent}interface ${formattedName} ${formattedDefinition}`;

        return formattedInterface;
    }
}
