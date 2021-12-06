import Publisher from "../publisher";
import PublisherTarget from "../publisher-target";
import * as github from "@actions/github";
import { File } from "../../utils/file";

interface GitHubPublisherOptions {
    tag?: string;
    token: string;
    files?: string | { primary?: string, secondary?: string };
}

export default class GitHubPublisher extends Publisher<GitHubPublisherOptions> {
    public get target(): PublisherTarget {
        return PublisherTarget.GitHub;
    }

    public async publish(files: File[], options: GitHubPublisherOptions): Promise<void> {
        this.validateOptions(options);
        let releaseId = 0;
        const repo = github.context.repo;
        const octokit = github.getOctokit(options.token);
        if (options.tag) {
            const response = await octokit.rest.repos.getReleaseByTag({ ...repo, tag: options.tag });
            if (response.status >= 200 && response.status < 300) {
                releaseId = response.data.id;
            }
        } else {
            releaseId = github.context.payload.release?.id;
        }
        if (!releaseId) {
            throw new Error(`Couldn't find release #${options.tag || releaseId}`);
        }

        const existingAssets = (await octokit.rest.repos.listReleaseAssets({ ...repo, release_id: releaseId })).data;
        for (const file of files) {
            const existingAsset = existingAssets.find(x => x.name === file.name || x.name === file.path);
            if (existingAsset) {
                await octokit.rest.repos.deleteReleaseAsset({ ...repo, asset_id: existingAsset.id })
            }

            await octokit.rest.repos.uploadReleaseAsset({
                owner: repo.owner,
                repo: repo.repo,
                release_id: releaseId,
                name: file.name,
                data: <any>await file.getBuffer()
            });
        }
    }
}