/**
 * Represents a Modrinth loader.
 */
export interface ModrinthLoader {
    /**
     * The SVG icon of the loader.
     */
    icon: string;

    /**
     * The name of the loader.
     */
    name: string;

    /**
     * The project types that this loader is applicable to.
     */
    supported_project_types: string[];
}
