import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents different dependency types.
 *
 * @partial
 */
enum DependencyTypeValues {
    /**
     * The dependency is required for the project to function.
     */
    REQUIRED = "required",

    /**
     * The dependency is recommended for the project but not required.
     */
    RECOMMENDED = "recommended",

    /**
     * The dependency is embedded within the project.
     */
    EMBEDDED = "embedded",

    /**
     * The dependency is optional and provides additional features.
     */
    OPTIONAL = "optional",

    /**
     * The dependency conflicts with the project and both should not be used together.
     */
    CONFLICTING = "conflicting",

    /**
     * The dependency is incompatible with the project.
     */
    INCOMPATIBLE = "incompatible",
}

/**
 * Options for configuring the behavior of the DependencyType enum.
 *
 * @partial
 */
const DependencyTypeOptions: EnumOptions = {
    /**
     * The case should be ignored while parsing the dependency type.
     */
    ignoreCase: true,
};

/**
 * Represents different dependency types.
 */
export const DependencyType = Enum.create(
    DependencyTypeValues,
    DependencyTypeOptions,
);

/**
 * Represents different dependency types.
 */
export type DependencyType = Enum<typeof DependencyTypeValues>;
