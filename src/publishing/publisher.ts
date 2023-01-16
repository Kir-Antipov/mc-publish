import File from "../utils/io/file";
import Logger from "../utils/logging/logger";
import { getEmptyLogger } from "../utils/logging/logger";
import PublisherTarget from "./publisher-target";
import PublishResult from "./publish-result";

export default abstract class Publisher<TOptions> {
    protected readonly logger: Logger;
    protected readonly dryRun: boolean;

    public constructor(dryRun?: boolean, logger?: Logger) {
        this.dryRun = dryRun ?? false;
        this.logger = logger || getEmptyLogger();
    }

    public abstract get target(): PublisherTarget;

    public abstract publish(files: File[], options: TOptions): Promise<PublishResult>;

    protected validateOptions(options: TOptions): void | never {
        if (!options || typeof options !== "object") {
            throw new Error(`Expected options to be an object, got ${options ? typeof options : options}`);
        }
    }
}
