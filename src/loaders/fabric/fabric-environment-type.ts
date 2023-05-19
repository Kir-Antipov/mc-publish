import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents the different environments that a Fabric mod can run on.
 */
enum FabricEnvironmentTypeValues {
    /**
     * Runs only on the client side.
     */
    CLIENT = "client",

    /**
     * Runs only on the server side.
     */
    SERVER = "server",

    /**
     * Runs on both the client and server side.
     */
    BOTH = "*",
}

/**
 * Options for configuring the behavior of the `FabricEnvironmentType` enum.
 */
const FabricEnvironmentTypeOptions: EnumOptions = {
    /**
     * Ignore the case of the environment type string when parsing.
     */
    ignoreCase: true,
};

/**
 * Represents the different environments that a Fabric mod can run on.
 */
export const FabricEnvironmentType = Enum.create(
    FabricEnvironmentTypeValues,
    FabricEnvironmentTypeOptions,
);

/**
 * Represents the different environments that a Fabric mod can run on.
 */
export type FabricEnvironmentType = Enum<typeof FabricEnvironmentTypeValues>;
