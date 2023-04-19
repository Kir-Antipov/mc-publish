import { GitHubRelease } from "./github-release";

/**
 * Represents the payload of a GitHub webhook event.
 */
export interface GitHubWebhookPayload {
    /**
     * Information about the release associated with the webhook event, if applicable.
     */
    release?: GitHubRelease;
}
