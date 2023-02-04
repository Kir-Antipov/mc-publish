import { TypeScriptTypeDefinition } from "./typescript-type-definition";

/**
 * Represents a single type literal in TypeScript.
 */
export class TypeScriptTypeLiteral implements TypeScriptTypeDefinition {
    /**
     * A cached instance of {@link TypeScriptTypeLiteral} representing the `string` type.
     */
    static readonly STRING = new TypeScriptTypeLiteral("string");

    /**
     * A cached instance of {@link TypeScriptTypeLiteral} representing the `number` type.
     */
    static readonly NUMBER = new TypeScriptTypeLiteral("number");

    /**
     * A cached instance of {@link TypeScriptTypeLiteral} representing the `bigint` type.
     */
    static readonly BIGINT = new TypeScriptTypeLiteral("bigint");

    /**
     * A cached instance of {@link TypeScriptTypeLiteral} representing the `boolean` type.
     */
    static readonly BOOLEAN = new TypeScriptTypeLiteral("boolean");

    /**
     * A cached instance of {@link TypeScriptTypeLiteral} representing the `symbol` type.
     */
    static readonly SYMBOL = new TypeScriptTypeLiteral("symbol");

    /**
     * A cached instance of {@link TypeScriptTypeLiteral} representing the `undefined` type.
     */
    static readonly UNDEFINED = new TypeScriptTypeLiteral("undefined");

    /**
     * A cached instance of {@link TypeScriptTypeLiteral} representing the `object` type.
     */
    static readonly OBJECT = new TypeScriptTypeLiteral("object");

    /**
     * A cached instance of {@link TypeScriptTypeLiteral} representing the `function` type.
     */
    static readonly FUNCTION = new TypeScriptTypeLiteral("function");

    /**
     * A cached instance of {@link TypeScriptTypeLiteral} representing the `never` type.
     */
    static readonly NEVER = new TypeScriptTypeLiteral("never");

    /**
     * A cache of previously created {@link TypeScriptTypeLiteral} instances, indexed by their value.
     */
    private static readonly TYPE_CACHE = new Map<string, TypeScriptTypeLiteral>([
        TypeScriptTypeLiteral.STRING,
        TypeScriptTypeLiteral.NUMBER,
        TypeScriptTypeLiteral.BIGINT,
        TypeScriptTypeLiteral.BOOLEAN,
        TypeScriptTypeLiteral.SYMBOL,
        TypeScriptTypeLiteral.UNDEFINED,
        TypeScriptTypeLiteral.OBJECT,
        TypeScriptTypeLiteral.FUNCTION,
        TypeScriptTypeLiteral.NEVER,
    ].map(x => [x.value, x]));

    /**
     * A string value representing the type of this instance.
     */
    private readonly _value: string;

    /**
     * Creates a new instance of the {@link TypeScriptTypeLiteral} class with the specified value.
     *
     * @param value - The string value representing the type of this {@link TypeScriptTypeLiteral} instance.
     */
    private constructor(value: string) {
        this._value = value;
    }

    /**
     * Creates a new instance of the {@link TypeScriptTypeLiteral} class with the specified value.
     *
     * @param value - The string value representing the type of this {@link TypeScriptTypeLiteral} instance.
     *
     * @returns A new instance of the {@link TypeScriptTypeLiteral} class with the specified value.
     */
    static create(value: string): TypeScriptTypeLiteral {
        const cachedType = TypeScriptTypeLiteral.TYPE_CACHE.get(value);
        if (cachedType) {
            return cachedType;
        }
        return new TypeScriptTypeLiteral(value);
    }

    /**
     * @inheritdoc
     */
    get isComposite(): false {
        return false;
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
    composingTypes(): Iterable<this> {
        return [this];
    }

    /**
     * Returns the string value representing the type of this {@link TypeScriptTypeLiteral} instance.
     */
    get value(): string {
        return this._value;
    }

    /**
     * @inheritdoc
     */
    format(): string {
        return this._value;
    }
}
