import Publisher from "./publisher";
import PublisherTarget from "./publisher-target";
import GitHubPublisher from "./github/github-publisher";
import ModrinthPublisher from "./modrinth/modrinth-publisher";
import CurseForgePublisher from "./curseforge/curseforge-publisher";
import Logger from "../utils/logging/logger";

export default class PublisherFactory {
    public create(target: PublisherTarget, dryRun?: boolean, logger?: Logger): Publisher<unknown> {
        switch(target) {
            case PublisherTarget.GitHub:
                return new GitHubPublisher(dryRun, logger);

            case PublisherTarget.Modrinth:
                return new ModrinthPublisher(dryRun, logger);

            case PublisherTarget.CurseForge:
                return new CurseForgePublisher(dryRun, logger);

            default:
                throw new Error(`Unknown target "${PublisherTarget.toString(target)}"`);
        }
    }
}
