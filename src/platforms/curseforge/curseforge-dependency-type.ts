import { DependencyType } from "@/dependencies";
import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents the types of dependencies a CurseForge version can have.
 *
 * @partial
 */
enum CurseForgeDependencyTypeValues {
    /**
     * A library embedded within the project.
     */
    EMBEDDED_LIBRARY = "embeddedLibrary",

    /**
     * A plugin that is incompatible with the project.
     */
    INCOMPATIBLE = "incompatible",

    /**
     * An optional dependency for the project.
     */
    OPTIONAL_DEPENDENCY = "optionalDependency",

    /**
     * A required dependency for the project.
     */
    REQUIRED_DEPENDENCY = "requiredDependency",

    /**
     * A tool used by the project.
     */
    TOOL = "tool",
}

/**
 * Options for configuring the behavior of the CurseForgeDependencyType enum.
 *
 * @partial
 */
const CurseForgeDependencyTypeOptions: EnumOptions = {
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
 * Converts a {@link CurseForgeDependencyType} to a {@link DependencyType}.
 *
 * @param type - The {@link CurseForgeDependencyType} to convert.
 *
 * @returns The corresponding {@link DependencyType}, or `undefined` if the value is invalid.
 */
function toDependencyType(type: CurseForgeDependencyType): DependencyType | undefined {
    switch (type) {
        case CurseForgeDependencyType.EMBEDDED_LIBRARY:
            return DependencyType.EMBEDDED;
        case CurseForgeDependencyType.INCOMPATIBLE:
            return DependencyType.INCOMPATIBLE;
        case CurseForgeDependencyType.OPTIONAL_DEPENDENCY:
            return DependencyType.OPTIONAL;
        case CurseForgeDependencyType.REQUIRED_DEPENDENCY:
            return DependencyType.REQUIRED;
        case CurseForgeDependencyType.TOOL:
            return DependencyType.RECOMMENDED;
        default:
            return undefined;
    }
}

/**
 * Converts a {@link DependencyType} to a {@link CurseForgeDependencyType}.
 *
 * @param type - The {@link DependencyType} to convert.
 *
 * @returns The corresponding {@link CurseForgeDependencyType}, or `undefined` if the value is invalid.
 */
function fromDependencyType(type: DependencyType): CurseForgeDependencyType | undefined {
    switch (type) {
        case DependencyType.REQUIRED:
            return CurseForgeDependencyType.REQUIRED_DEPENDENCY;
        case DependencyType.RECOMMENDED:
            return CurseForgeDependencyType.OPTIONAL_DEPENDENCY;
        case DependencyType.EMBEDDED:
            return CurseForgeDependencyType.EMBEDDED_LIBRARY;
        case DependencyType.OPTIONAL:
            return CurseForgeDependencyType.OPTIONAL_DEPENDENCY;
        case DependencyType.CONFLICTING:
            return CurseForgeDependencyType.INCOMPATIBLE;
        case DependencyType.INCOMPATIBLE:
            return CurseForgeDependencyType.INCOMPATIBLE;
        default:
            return undefined;
    }
}

/**
 * A collection of methods to work with CurseForgeDependencyType.
 *
 * @partial
 */
const CurseForgeDependencyTypeMethods = {
    fromDependencyType,
    toDependencyType,
};

/**
 * Represents the types of dependencies a CurseForge version can have.
 */
export const CurseForgeDependencyType = Enum.create(
    CurseForgeDependencyTypeValues,
    CurseForgeDependencyTypeOptions,
    CurseForgeDependencyTypeMethods,
);

/**
 * Represents the types of dependencies a CurseForge version can have.
 */
export type CurseForgeDependencyType = Enum<typeof CurseForgeDependencyTypeValues>;
