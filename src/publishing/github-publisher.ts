import Publisher from "./publisher";
import PublisherTarget from "./publisher-target";
import * as github from "@actions/github";
import { getFiles } from "../utils/file-utils";

interface GitHubPublisherOptions {
    tag?: string;
    token: string;
    files?: string | { primary?: string, secondary?: string };
}

const defaultFiles = {
    primary: "build/libs/!(*-@(dev|sources)).jar",
    secondary: "build/libs/*-@(dev|sources).jar"
};

export default class GitHubPublisher extends Publisher<GitHubPublisherOptions> {
    public get target(): PublisherTarget {
        return PublisherTarget.GitHub;
    }

    public async publish(): Promise<void> {
        let releaseId = 0;
        const repo = github.context.repo;
        const octokit = github.getOctokit(this.options.token);
        if (this.options.tag) {
            const response = await octokit.rest.repos.getReleaseByTag({ ...repo, tag: this.options.tag });
            if (response.status >= 200 && response.status < 300) {
                releaseId = response.data.id;
            }
        } else {
            releaseId = github.context.payload.release?.id;
        }
        if (!releaseId) {
            throw new Error(`Couldn't find release #${this.options.tag || releaseId}`);
        }

        const fileSelector = this.options.files && (typeof(this.options.files) === "string" || this.options.files.primary) ? this.options.files : defaultFiles;
        const files = await getFiles(fileSelector);
        if (!files.length) {
            throw new Error(`Specified files (${typeof fileSelector === "string" ? fileSelector : fileSelector.primary}) were not found`);
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