/**
 * Represents the contact information for a Fabric mod project.
 */
export interface FabricContactInformation {
    /**
     * Contact email pertaining to the mod.
     *
     * Must be a valid email address.
     */
    email?: string;

    /**
     * IRC channel pertaining to the mod.
     *
     * Must be of a valid URL format.
     */
    irc?: string;

    /**
     * Project or user homepage.
     *
     * Must be a valid HTTP/HTTPS address.
     */
    homepage?: string;

    /**
     * Project issue tracker.
     *
     * Must be a valid HTTP/HTTPS address.
     */
    issues?: string;

    /**
     * Project source code repository.
     *
     * Must be a valid URL.
     */
    sources?: string;

    /**
     * Additional, non-standard keys for the contact information.
     */
    [key: string]: string | undefined;
}
