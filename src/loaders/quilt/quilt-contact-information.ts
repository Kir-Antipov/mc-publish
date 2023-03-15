/**
 * Represents the contact information for a Quilt mod project.
 */
export interface QuiltContactInformation {
    /**
     * Valid e-mail address for the organization/developers.
     */
    email?: string;

    /**
     * Valid HTTP/HTTPS address for the project or the organization/developers behind it.
     */
    homepage?: string;

    /**
     * Valid HTTP/HTTPS address for the project issue tracker.
     */
    issues?: string;

    /**
     * Valid HTTP/HTTPS address for a source code repository.
     */
    sources?: string;

    /**
     * Additional, non-standard keys for the contact information.
     */
    [key: string]: string | undefined;
}
