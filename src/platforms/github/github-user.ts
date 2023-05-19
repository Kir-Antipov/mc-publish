/**
 * GitHub user definition.
 */
export interface GitHubUser {
    /**
     * The GitHub username.
     */
    login: string;

    /**
     * The user's GitHub ID.
     */
    id: number;

    /**
     * The user's node ID in the GitHub API.
     */
    node_id: string;

    /**
     * The URL of the user's avatar image.
     */
    avatar_url: string;

    /**
     * The user's gravatar ID.
     */
    gravatar_id: string;

    /**
     * The URL of the user in the GitHub API.
     */
    url: string;

    /**
     * The URL of the user on GitHub's website.
     */
    html_url: string;

    /**
     * The URL of the user's followers in the GitHub API.
     */
    followers_url: string;

    /**
     * The URL of the user's following in the GitHub API.
     */
    following_url: string;

    /**
     * The URL of the user's gists in the GitHub API.
     */
    gists_url: string;

    /**
     * The URL of the user's starred repositories in the GitHub API.
     */
    starred_url: string;

    /**
     * The URL of the user's subscriptions in the GitHub API.
     */
    subscriptions_url: string;

    /**
     * The URL of the user's organizations in the GitHub API.
     */
    organizations_url: string;

    /**
     * The URL of the user's repositories in the GitHub API.
     */
    repos_url: string;

    /**
     * The URL of the user's events in the GitHub API.
     */
    events_url: string;

    /**
     * The URL of the user's received events in the GitHub API.
     */
    received_events_url: string;

    /**
     * The type of the user (e.g., 'User' or 'Bot').
     */
    type: string;

    /**
     * A boolean indicating whether the user is a site admin.
     */
    site_admin: boolean;
}
