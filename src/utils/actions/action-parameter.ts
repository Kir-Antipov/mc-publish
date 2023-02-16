/**
 * Represents an input or output parameter of a GitHub Action.
 */
export interface ActionParameter {
    /**
     * A string description of the parameter.
     */
    description: string;

    /**
     * A name of the parameter this one's value should be redirected to.
     *
     * @custom
     */
    redirect?: string;

    /**
     * The data type of the parameter.
     *
     * @custom
     */
    type?: string;

    /**
     * Whether this parameter should be included in the groups by default.
     *
     * Defaults to `false`.
     *
     * @custom
     */
    unique?: boolean;
}

/**
 * Normalizes the name of a parameter by replacing spaces with underscores and converting it to uppercase.
 *
 * @param name - The name of the parameter to normalize.
 *
 * @returns The normalized name of the parameter.
 */
export function normalizeActionParameterName(name: string): string {
    return name.replaceAll(" ", "_").toUpperCase();
}
