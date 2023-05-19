import { FabricContactInformation } from "./fabric-contact-information";

/**
 * Represents an author or contributor of a Fabric mod project.
 */
export interface FabricDeveloper {
    /**
     * The real name, or username, of the person.
     */
    name: string;

    /**
     * The contact information for the person.
     */
    contact?: FabricContactInformation;
}
