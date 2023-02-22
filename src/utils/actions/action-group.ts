/**
 * Describes a group of inputs or outputs for a GitHub Action.
 */
export interface ActionGroup {
    /**
     * An optional type name of this group.
     */
    type?: string;

    /**
     * An optional description of this group.
     */
    description?: string;

    /**
     * An array of input or output names that belong to this group.
     *
     * The final input or output names will be prefixed with the group name.
     */
    include?: string[];

    /**
     * An array of input or output names that should be excluded from this group.
     *
     * These inputs or outputs will still appear in the top-level inputs or outputs.
     */
    exclude?: string[];
}

/**
 * The default delimiter used when concatenating group and input/output names in action metadata templates.
 */
export const DEFAULT_ACTION_GROUP_DELIMITER = "-";
