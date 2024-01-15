import { Enum, EnumOptions } from "@/utils/enum";
import { DependencyType } from "@/dependencies";

/**
 * Represents different NeoForge dependency types.
 *
 * @partial
 */
enum NeoForgeDependencyTypeValues {
    /**
     * For dependencies required to run. Without them, a game will crash.
     */
    REQUIRED = "required",

    /**
     * For dependencies not required to run. Without them, a game will log a warning.
     */
    OPTIONAL = "optional",

    /**
     * For dependencies embedded within the project.
     */
    EMBEDDED = "embedded",

    /**
     * For mods whose together with yours might cause a game crash. With them, a game will crash.
     */
    INCOMPATIBLE = "incompatible",

    /**
     * For mods whose together with yours cause some kind of bugs, etc. With them, a game will log a warning.
     */
    DISCOURAGED = "discouraged",
}

/**
 * Options for configuring the behavior of the NeoForgeDependencyType enum.
 *
 * @partial
 */
const NeoForgeDependencyTypeOptions: EnumOptions = {
    /**
     * The case should be ignored while parsing the dependency type.
     */
    ignoreCase: true,
};

/**
 * Converts a {@link NeoForgeDependencyType} to a {@link DependencyType}.
 *
 * @param type - The {@link NeoForgeDependencyType} to convert.
 *
 * @returns The corresponding {@link DependencyType}, or `undefined` if the value is invalid.
 */
function toDependencyType(type: NeoForgeDependencyType): DependencyType | undefined {
    switch (type) {
        case NeoForgeDependencyType.REQUIRED:
            return DependencyType.REQUIRED;
        case NeoForgeDependencyType.OPTIONAL:
            return DependencyType.OPTIONAL;
        case NeoForgeDependencyType.EMBEDDED:
            return DependencyType.EMBEDDED;
        case NeoForgeDependencyType.INCOMPATIBLE:
            return DependencyType.INCOMPATIBLE;
        case NeoForgeDependencyType.DISCOURAGED:
            return DependencyType.CONFLICTING;
        default:
            return undefined;
    }
}

/**
 * Converts a {@link DependencyType} to a {@link NeoForgeDependencyType}.
 *
 * @param type - The {@link DependencyType} to convert.
 *
 * @returns The corresponding {@link NeoForgeDependencyType}, or `undefined` if the value is invalid.
 */
function fromDependencyType(type: DependencyType): NeoForgeDependencyType | undefined {
    switch (type) {
        case DependencyType.REQUIRED:
            return NeoForgeDependencyType.REQUIRED;
        case DependencyType.OPTIONAL:
        case DependencyType.RECOMMENDED:
            return NeoForgeDependencyType.OPTIONAL;
        case DependencyType.EMBEDDED:
            return NeoForgeDependencyType.EMBEDDED;
        case DependencyType.CONFLICTING:
            return NeoForgeDependencyType.DISCOURAGED;
        case DependencyType.INCOMPATIBLE:
            return NeoForgeDependencyType.INCOMPATIBLE;
        default:
            return undefined;
    }
}

/**
 * A collection of methods to work with NeoForgeDependencyType.
 *
 * @partial
 */
const NeoForgeDependencyTypeMethods = {
    toDependencyType,
    fromDependencyType,
};

/**
 * Represents different NeoForge dependency types.
 */
export const NeoForgeDependencyType = Enum.create(
    NeoForgeDependencyTypeValues,
    NeoForgeDependencyTypeOptions,
    NeoForgeDependencyTypeMethods,
);

/**
 * Represents different NeoForge dependency types.
 */
export type NeoForgeDependencyType = Enum<typeof NeoForgeDependencyTypeValues>;
