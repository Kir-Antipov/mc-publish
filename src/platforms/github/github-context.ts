import { getEnvironmentVariable } from "@/utils/environment";
import { readFileSync } from "node:fs";
import { GITHUB_API_URL as DEFAULT_GITHUB_API_URL } from "./github-api-client";
import { GitHubRepositoryIdentifier } from "./github-repository";
import { GitHubWebhookPayload } from "./github-webhook-payload";

/**
 * The name of the environment variable that contains the path to the GitHub webhook payload file.
 */
const GITHUB_PAYLOAD_PATH = "GITHUB_EVENT_PATH";

/**
 * The name of the environment variable that contains the repository name in the format "owner/repo".
 */
const GITHUB_REPOSITORY = "GITHUB_REPOSITORY";

/**
 * The name of the environment variable that contains the GitHub API url.
 */
const GITHUB_API_URL = "GITHUB_API_URL";

/**
 * The name of the environment variable that contains the Git ref associated with the workflow run.
 */
const GITHUB_REF = "GITHUB_REF";

/**
 * The prefix for Git tag refs in the format "refs/tags/".
 */
const GITHUB_REF_TAG_PREFIX = "refs/tags/";

/**
 * Represents an execution context of a GitHub action.
 */
export class GitHubContext {
    /**
     * A container for environment variables.
     */
    private readonly _env: Record<string, string>;

    /**
     * Cached payload associated with the context.
     */
    private _payload?: GitHubWebhookPayload;

    /**
     * Constructs a new {@link GitHubContext} instance.
     *
     * @param env - An optional object containing environment variables.
     */
    constructor(env?: Record<string, string>) {
        this._env = env;
    }

    /**
     * Gets the ref associated with the context, if available.
     */
    get ref(): string | undefined {
        return getEnvironmentVariable(GITHUB_REF, this._env);
    }

    /**
     * Gets the tag associated with the context, if available.
     */
    get tag(): string | undefined {
        const payload = this.payload;
        if (payload.release?.tag_name) {
            return payload.release.tag_name;
        }

        const ref = this.ref;
        if (ref?.startsWith(GITHUB_REF_TAG_PREFIX)) {
            return ref.substring(GITHUB_REF_TAG_PREFIX.length);
        }

        return undefined;
    }

    /**
     * Gets the version associated with the context, if available.
     */
    get version(): string | undefined {
        const tag = this.tag;

        // Remove the `v` prefix, popularized by GitHub.
        return /v\d/.test(tag) ? tag.substring(1) : tag;
    }

    /**
     * Gets the repository associated with the context, if available.
     */
    get repo(): GitHubRepositoryIdentifier | undefined {
        const repository = getEnvironmentVariable(GITHUB_REPOSITORY, this._env);
        if (repository?.includes("/")) {
            const [owner, repo] = repository.split("/");
            return { owner, repo };
        }

        return undefined;
    }

    /**
     * Gets the URL for the GitHub API associated with this context, if available;
     * otherwise using the base URL (`"https://api.github.com"`).
     */
    get apiUrl(): string {
        return getEnvironmentVariable(GITHUB_API_URL, this._env) || DEFAULT_GITHUB_API_URL;
    }

    /**
     * Gets the payload associated with the context.
     */
    get payload(): GitHubWebhookPayload {
        if (this._payload) {
            return this._payload;
        }

        const path = getEnvironmentVariable(GITHUB_PAYLOAD_PATH, this._env);
        try {
            this._payload = JSON.parse(readFileSync(path, "utf8"));
        } catch {
            this._payload = {};
        }
        return this._payload;
    }
}
