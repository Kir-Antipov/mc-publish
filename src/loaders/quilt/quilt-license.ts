/**
 * Represents a license for a Quilt mod project.
 */
export interface QuiltLicense {
    /**
     * The SPDX identifier string for the license.
     *
     * See https://spdx.org/licenses/ for more information.
     */
    id: string;

    /**
     * The name of the license.
     */
    name: string;

    /**
     * The URL where the license text can be found.
     */
    url: string;

    /**
     * A description of the license.
     */
    description?: string;
}
