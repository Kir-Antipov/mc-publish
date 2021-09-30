import Publisher from "./publisher";
import PublisherTarget from "./publisher-target";
import GitHubPublisher from "./github-publisher";
import ModrinthPublisher from "./modrinth-publisher";
import CurseForgePublisher from "./curseforge-publisher";
import Logger from "../utils/logger";

export default class PublisherFactory {
    public create(target: PublisherTarget, logger?: Logger): Publisher<unknown> {
        switch(target) {
            case PublisherTarget.GitHub:
                return new GitHubPublisher(logger);

            case PublisherTarget.Modrinth:
                return new ModrinthPublisher(logger);

            case PublisherTarget.CurseForge:
                return new CurseForgePublisher(logger);

            default:
                throw new Error(`Unknown target "${PublisherTarget.toString(target)}"`);
        }
    }
}
