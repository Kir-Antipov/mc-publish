import Logger from "../utils/logger";
import { getEmptyLogger } from "../utils/logger-utils";
import PublisherTarget from "./publisher-target";

export default abstract class Publisher<TOptions> {
    protected readonly options: TOptions;
    protected readonly logger: Logger;

    public constructor(options: TOptions, logger?: Logger) {
        if (!options || typeof options !== "object") {
            throw new Error(`Expected options to be an object, got ${options ? typeof options : options}`);
        }
        this.options = options;
        this.logger = logger || getEmptyLogger();
    }

    public abstract get target(): PublisherTarget;

    public abstract publish(): Promise<void>;
}
