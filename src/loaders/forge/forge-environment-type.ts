import { Enum, EnumOptions } from "@/utils/enum";

/**
 * Represents the different physical sides that a Forge mod can run on.
 */
enum ForgeEnvironmentTypeValues {
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
 * Options for configuring the behavior of the `ForgeEnvironmentType` enum.
 */
const ForgeEnvironmentTypeOptions: EnumOptions = {
    /**
     * Ignore the case of the environment type string when parsing.
     */
    ignoreCase: true,
};

/**
 * Represents the different physical sides that a Forge mod can run on.
 */
export const ForgeEnvironmentType = Enum.create(
    ForgeEnvironmentTypeValues,
    ForgeEnvironmentTypeOptions,
);

/**
 * Represents the different physical sides that a Forge mod can run on.
 */
export type ForgeEnvironmentType = Enum<typeof ForgeEnvironmentTypeValues>;
