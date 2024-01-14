import { DependencyType } from "@/dependencies";
import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents the types of dependencies a Modrinth version can have.
 *
 * @partial
 */
enum ModrinthDependencyTypeValues {
    /**
     * The dependency is required for the mod to function.
     */
    REQUIRED = "required",

    /**
     * The dependency is optional and provides additional features.
     */
    OPTIONAL = "optional",

    /**
     * The dependency is incompatible with the mod.
     */
    INCOMPATIBLE = "incompatible",

    /**
     * The dependency is embedded within the mod.
     */
    EMBEDDED = "embedded",
}

/**
 * Options for configuring the behavior of the ModrinthDependencyType enum.
 *
 * @partial
 */
const ModrinthDependencyTypeOptions: EnumOptions = {
    /**
     * The case should be ignored while parsing the dependency type.
     */
    ignoreCase: true,

    /**
     * Non-word characters should be ignored while parsing the dependency type.
     */
    ignoreNonWordCharacters: true,
};

/**
 * Converts a {@link ModrinthDependencyType} to a {@link DependencyType}.
 *
 * @param type - The {@link ModrinthDependencyType} to convert.
 *
 * @returns The corresponding {@link DependencyType}, or `undefined` if the value is invalid.
 */
function toDependencyType(type: ModrinthDependencyType): DependencyType | undefined {
    switch (type) {
        case ModrinthDependencyType.REQUIRED:
            return DependencyType.REQUIRED;
        case ModrinthDependencyType.OPTIONAL:
            return DependencyType.OPTIONAL;
        case ModrinthDependencyType.INCOMPATIBLE:
            return DependencyType.INCOMPATIBLE;
        case ModrinthDependencyType.EMBEDDED:
            return DependencyType.EMBEDDED;
        default:
            return undefined;
    }
}

/**
 * Converts a {@link DependencyType} to a {@link ModrinthDependencyType}.
 *
 * @param type - The {@link DependencyType} to convert.
 *
 * @returns The corresponding {@link ModrinthDependencyType}, or `undefined` if the value is invalid.
 */
function fromDependencyType(type: DependencyType): ModrinthDependencyType | undefined {
    switch (type) {
        case DependencyType.REQUIRED:
            return ModrinthDependencyType.REQUIRED;
        case DependencyType.OPTIONAL:
        case DependencyType.RECOMMENDED:
            return ModrinthDependencyType.OPTIONAL;
        case DependencyType.EMBEDDED:
            return ModrinthDependencyType.EMBEDDED;
        case DependencyType.CONFLICTING:
        case DependencyType.INCOMPATIBLE:
            return ModrinthDependencyType.INCOMPATIBLE;
        default:
            return undefined;
    }
}

/**
 * A collection of methods to work with ModrinthDependencyType.
 *
 * @partial
 */
const ModrinthDependencyTypeMethods = {
    fromDependencyType,
    toDependencyType,
};

/**
 * Represents the types of dependencies a Modrinth version can have.
 */
export const ModrinthDependencyType = Enum.create(
    ModrinthDependencyTypeValues,
    ModrinthDependencyTypeOptions,
    ModrinthDependencyTypeMethods,
);

/**
 * Represents the types of dependencies a Modrinth version can have.
 */
export type ModrinthDependencyType = Enum<typeof ModrinthDependencyTypeValues>;
