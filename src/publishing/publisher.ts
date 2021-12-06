import { File } from "../utils/file";
import Logger from "../utils/logger";
import { getEmptyLogger } from "../utils/logger-utils";
import PublisherTarget from "./publisher-target";

export default abstract class Publisher<TOptions> {
    protected readonly logger: Logger;

    public constructor(logger?: Logger) {
        this.logger = logger || getEmptyLogger();
    }

    public abstract get target(): PublisherTarget;

    public abstract publish(files: File[], options: TOptions): Promise<void>;

    protected validateOptions(options: TOptions): void | never {
        if (!options || typeof options !== "object") {
            throw new Error(`Expected options to be an object, got ${options ? typeof options : options}`);
        }
    }
}
