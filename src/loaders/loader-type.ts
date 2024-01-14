import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents different mod loader types.
 *
 * @partial
 */
enum LoaderTypeValues {
    /**
     * Fabric mod loader.
     */
    FABRIC = "fabric",

    /**
     * Forge mod loader.
     */
    FORGE = "forge",

    /**
     * Quilt mod loader.
     */
    QUILT = "quilt",

    /**
     * NeoForge mod loader.
     */
    NEOFORGE = "neoforge",
}

/**
 * Options for configuring the behavior of the `LoaderType` enum.
 *
 * @partial
 */
const LoaderTypeOptions: EnumOptions = {
    /**
     * The case should be ignored while parsing the mod loader type.
     */
    ignoreCase: true,
};

/**
 * Represents different mod loader types.
 */
export const LoaderType = Enum.create(
    LoaderTypeValues,
    LoaderTypeOptions,
);

/**
 * Represents different mod loader types.
 */
export type LoaderType = Enum<typeof LoaderTypeValues>;
