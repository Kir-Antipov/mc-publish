import { CurseForgeDependencyType } from "./curseforge-dependency-type";

/**
 * Represents a CurseForge version dependency.
 */
export interface CurseForgeDependency {
    /**
     * The slug of the dependency.
     */
    slug: string;

    /**
     * The type of dependency (e.g., requiredDependency, optionalDependency).
     */
    type: CurseForgeDependencyType;
}
