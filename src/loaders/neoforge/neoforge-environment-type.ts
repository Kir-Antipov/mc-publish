import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents the different physical sides that a NeoForge mod can run on.
 */
enum NeoForgeEnvironmentTypeValues {
    /**
     * Present on the client side.
     */
    CLIENT = "CLIENT",

    /**
     * Present on the dedicated server.
     */
    SERVER = "SERVER",

    /**
     * Present on both the client and server side.
     */
    BOTH = "BOTH",
}

/**
 * Options for configuring the behavior of the `NeoForgeEnvironmentType` enum.
 */
const NeoForgeEnvironmentTypeOptions: EnumOptions = {
    /**
     * Ignore the case of the environment type string when parsing.
     */
    ignoreCase: true,
};

/**
 * Represents the different physical sides that a NeoForge mod can run on.
 */
export const NeoForgeEnvironmentType = Enum.create(
    NeoForgeEnvironmentTypeValues,
    NeoForgeEnvironmentTypeOptions,
);

/**
 * Represents the different physical sides that a NeoForge mod can run on.
 */
export type NeoForgeEnvironmentType = Enum<typeof NeoForgeEnvironmentTypeValues>;
