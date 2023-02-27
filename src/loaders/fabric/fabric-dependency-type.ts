import { Enum, EnumOptions } from "@/utils/enum";
import { DependencyType } from "@/dependencies";

/**
 * Represents different Fabric dependency types.
 *
 * @partial
 */
enum FabricDependencyTypeValues {
    /**
     * For dependencies required to run. Without them, a game will crash.
     */
    DEPENDS = "depends",

    /**
     * For dependencies not required to run. Without them, a game will log a warning.
     */
    RECOMMENDS = "recommends",

    /**
     * For dependencies embedded within the project.
     */
    INCLUDES = "includes",

    /**
     * For dependencies not required to run. Use this as a kind of metadata.
     */
    SUGGESTS = "suggests",

    /**
     * For mods whose together with yours might cause a game crash. With them, a game will crash.
     */
    BREAKS = "breaks",

    /**
     * For mods whose together with yours cause some kind of bugs, etc. With them, a game will log a warning.
     */
    CONFLICTS = "conflicts",
}

/**
 * Options for configuring the behavior of the FabricDependencyType enum.
 *
 * @partial
 */
const FabricDependencyTypeOptions: EnumOptions = {
    /**
     * The case should be ignored while parsing the dependency type.
     */
    ignoreCase: true,
};

/**
 * Converts a {@link FabricDependencyType} to a {@link DependencyType}.
 *
 * @param type - The {@link FabricDependencyType} to convert.
 *
 * @returns The corresponding {@link DependencyType}, or `undefined` if the value is invalid.
 */
function toDependencyType(type: FabricDependencyType): DependencyType | undefined {
    switch (type) {
        case FabricDependencyType.DEPENDS:
            return DependencyType.REQUIRED;
        case FabricDependencyType.RECOMMENDS:
            return DependencyType.RECOMMENDED;
        case FabricDependencyType.INCLUDES:
            return DependencyType.EMBEDDED;
        case FabricDependencyType.SUGGESTS:
            return DependencyType.OPTIONAL;
        case FabricDependencyType.BREAKS:
            return DependencyType.INCOMPATIBLE;
        case FabricDependencyType.CONFLICTS:
            return DependencyType.CONFLICTING;
        default:
            return undefined;
    }
}

/**
 * Converts a {@link DependencyType} to a {@link FabricDependencyType}.
 *
 * @param type - The {@link DependencyType} to convert.
 *
 * @returns The corresponding {@link FabricDependencyType}, or `undefined` if the value is invalid.
 */
function fromDependencyType(type: DependencyType): FabricDependencyType | undefined {
    switch (type) {
        case DependencyType.REQUIRED:
            return FabricDependencyType.DEPENDS;
        case DependencyType.RECOMMENDED:
            return FabricDependencyType.RECOMMENDS;
        case DependencyType.EMBEDDED:
            return FabricDependencyType.INCLUDES;
        case DependencyType.OPTIONAL:
            return FabricDependencyType.SUGGESTS;
        case DependencyType.CONFLICTING:
            return FabricDependencyType.CONFLICTS;
        case DependencyType.INCOMPATIBLE:
            return FabricDependencyType.BREAKS;
        default:
            return undefined;
    }
}

/**
 * A collection of methods to work with FabricDependencyType.
 *
 * @partial
 */
const FabricDependencyTypeMethods = {
    toDependencyType,
    fromDependencyType,
};

/**
 * Represents different Fabric dependency types.
 */
export const FabricDependencyType = Enum.create(
    FabricDependencyTypeValues,
    FabricDependencyTypeOptions,
    FabricDependencyTypeMethods,
);

/**
 * Represents different Fabric dependency types.
 */
export type FabricDependencyType = Enum<typeof FabricDependencyTypeValues>;
