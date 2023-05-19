/**
 * Represents an identifier for a GitHub repository.
 */
export interface GitHubRepositoryIdentifier {
    /**
     * The name of the repository.
     */
    repo: string;

    /**
     * The name of the repository owner.
     */
    owner: string;
}
