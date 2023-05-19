import { TypeScriptMember } from "./typescript-member";
import { TypeScriptProperty, TypeScriptPropertyOptions } from "./typescript-property";
import { getIndentation, getNewline, incrementIndent, TypeScriptFormattingOptions } from "./typescript-formatting-options";
import { $i } from "@/utils/collections/iterable";
import { decomposeType, TypeScriptTypeDefinition } from "./typescript-type-definition";
import { TypeScriptUnionType } from "./typescript-union-type";

/**
 * Represents a TypeScript object type definition.
 */
export class TypeScriptObject implements TypeScriptTypeDefinition, Iterable<TypeScriptMember> {
    /**
     * An internal data structure that stores the members of the TypeScriptObject instance.
     */
    private readonly _members: Map<string, TypeScriptMember>;

    /**
     * Constructs a new {@link TypeScriptObject} instance.
     */
    private constructor() {
        this._members = new Map();
    }

    /**
     * Creates a new {@link TypeScriptObject} instance.
     *
     * @returns A new {@link TypeScriptObject} instance.
     */
    static create(): TypeScriptObject {
        return new TypeScriptObject();
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
    get isAlias(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    composingTypes(): Iterable<this> {
        return [this];
    }

    /**
     * Returns an iterable of all members in this object.
     */
    members(): Iterable<TypeScriptMember> {
        return this._members.values();
    }

    /**
     * Returns an iterable of all properties in this object.
     */
    properties(): Iterable<TypeScriptProperty> {
        return $i(this).filter((x): x is TypeScriptProperty => x instanceof TypeScriptProperty);
    }

    /**
     * Retrieves the specified member from this object.
     *
     * @param name - The name of the member to retrieve.
     *
     * @returns The specified member, or `undefined` if it does not exist.
     */
    getMember(name: string): TypeScriptMember | undefined {
        return this._members.get(name);
    }

    /**
     * Retrieves the specified nested member from this object.
     *
     * @param name - The name or path of the nested member to retrieve.
     *
     * @returns The specified nested member or undefined if it does not exist.
     */
    getNestedMember(name: string | string[]): TypeScriptMember | undefined {
        const path = typeof name === "string" ? name.split(".") : name;
        if (!path || !path.length) {
            return undefined;
        }

        const member = this.getMember(path[0]);
        if (path.length === 1) {
            return member;
        }

        if (!(member instanceof TypeScriptProperty) || !(member.type instanceof TypeScriptObject)) {
            return undefined;
        }
        return member.type.getNestedMember(path.slice(1));
    }

    /**
     * Determines whether this object contains a member with the specified name.
     *
     * @param name - The name of the member to search for.
     *
     * @returns `true` if the member exists; otherwise, `false`.
     */
    hasMember(name: string): boolean {
        return this.getMember(name) !== undefined;
    }

    /**
     * Determines whether this object contains a nested member with the specified name or path.
     *
     * @param name - The name or path of the nested member to search for.
     *
     * @returns `true` if the nested member exists; otherwise, `false`.
     */
    hasNestedMember(name: string | string[]): boolean {
        return this.getNestedMember(name) !== undefined;
    }

    /**
     * Adds the specified member to this object.
     *
     * @param member - The member to add.
     *
     * @returns The member that was added to this object.
     */
    addMember<T extends TypeScriptMember>(member: T): T {
        this._members.set(member.name, member);
        return member;
    }

    /**
     * Deletes the specified member from this object.
     *
     * @param member - The member to delete.
     *
     * @returns `true` if the member was deleted; otherwise, `false`.
     */
    deleteMember(member: TypeScriptMember): boolean {
        return this._members.delete(member.name);
    }

    /**
     * Retrieves the specified property from this object.
     *
     * @param name - The name of the property to retrieve.
     *
     * @returns The specified property, or `undefined` if it does not exist.
     */
    getProperty(name: string): TypeScriptProperty | undefined {
        const property = this.getMember(name);
        return property instanceof TypeScriptProperty ? property : undefined;
    }

    /**
     * Retrieves the specified nested property from this object.
     *
     * @param name - The name or path of the nested property to retrieve.
     *
     * @returns The specified nested property, or `undefined` if it does not exist.
     */
    getNestedProperty(name: string | string[]): TypeScriptProperty | undefined {
        const property = this.getNestedMember(name);
        return property instanceof TypeScriptProperty ? property : undefined;
    }

    /**
     * Determines whether this object contains a property with the specified name.
     *
     * @param name - The name of the property to search for.
     *
     * @returns `true` if the property exists; otherwise, `false`.
     */
    hasProperty(name: string): boolean {
        return this.getProperty(name) !== undefined;
    }

    /**
     * Determines whether this object contains a nested property with the specified name or path.
     *
     * @param name - The name or path of the nested property to search for.
     *
     * @returns `true` if the nested property exists; otherwise, `false`.
     */
    hasNestedProperty(name: string | string[]): boolean {
        return this.getNestedProperty(name) !== undefined;
    }

    /**
     * Adds a new property with the specified name and type to this object.
     *
     * @param name - The name of the new property.
     * @param type - The type of the new property.
     * @param isOptional - Indicates whether the property is optional or not.
     *
     * @returns The property that was added to this object.
     */
    addProperty(name: string, type: TypeScriptTypeDefinition, options?: TypeScriptPropertyOptions): TypeScriptProperty {
        return this.addMember(TypeScriptProperty.create(name, type, options));
    }

    /**
     * Adds a new nested property with the specified name or path and type to this object.
     *
     * @param name - The name or path of the new nested property.
     * @param type - The type of the new nested property.
     * @param isOptional - Indicates whether the property is optional or not.
     *
     * @returns The nested property that was added to this object.
     */
    addNestedProperty(name: string | string[], type: TypeScriptTypeDefinition, options?: TypeScriptPropertyOptions): TypeScriptProperty {
        const path = typeof name === "string" ? name.split(".") : name;
        const localPropertyName = path[0];
        if (path.length === 1) {
            return this.addProperty(localPropertyName, type, options);
        }

        if (!this.hasProperty(localPropertyName)) {
            const nestedObject = TypeScriptObject.create();
            const nestedProperty = nestedObject.addNestedProperty(path.slice(1), type, options);
            this.addProperty(localPropertyName, nestedObject, options);
            return nestedProperty;
        }

        let localProperty = this.getProperty(localPropertyName);
        let nestedObject = $i(decomposeType(localProperty.type)).first((x): x is TypeScriptObject => x instanceof TypeScriptObject);
        if (!nestedObject) {
            nestedObject = TypeScriptObject.create();
            localProperty = localProperty.with({ type: TypeScriptUnionType.create([localProperty.type, nestedObject]) });
            this.addMember(localProperty);
        }

        return nestedObject.addNestedProperty(path.slice(1), type, options);
    }

    /**
     * @inheritdoc
     */
    format(options?: TypeScriptFormattingOptions): string {
        const indent = getIndentation(options);
        const newline = getNewline(options);
        const doubleNewline = newline + newline;
        const indentedOptions = incrementIndent(options);

        const formattedMembers = $i(this).map(x => x.format(indentedOptions)).join(doubleNewline);
        const formattedObject = (
            `${indent}{`
                + `${newline}${formattedMembers}${newline}` +
            `${indent}}`
        );

        return formattedObject;
    }

    /**
     * Returns an iterator over all members in this object.
     */
    [Symbol.iterator](): Iterator<TypeScriptMember> {
        return this.members()[Symbol.iterator]();
    }
}
