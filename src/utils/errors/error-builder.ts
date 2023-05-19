import { Logger, NULL_LOGGER } from "@/utils/logging";
import { FailMode } from "./fail-mode";

/**
 * A class for building and handling errors based on a given mode.
 */
export class ErrorBuilder {
    /**
     * The logger to use for logging errors.
     */
    private readonly _logger: Logger;

    /**
     * The accumulated errors.
     */
    private readonly _errors: Error[];

    /**
     * Constructs a new {@link ErrorBuilder} instance.
     *
     * @param logger - The logger to use for logging errors.
     */
    constructor(logger?: Logger) {
        this._logger = logger || NULL_LOGGER;
        this._errors = [];
    }

    /**
     * Checks if any errors have been appended.
     *
     * @returns `true` if there are errors; otherwise, `false`.
     */
    get hasErrors(): boolean {
        return this._errors.length > 0;
    }

    /**
     * Appends an error to the builder, handling it according to the provided mode.
     *
     * @param error - The error to append.
     * @param mode - The mode to use when handling the error. Defaults to `SKIP` if not provided.
     */
    append(error: Error, mode?: FailMode): void {
        switch (mode ?? FailMode.SKIP) {
            case FailMode.WARN:
                this._logger.error(error);
                break;
            case FailMode.SKIP:
                this._logger.error(error);
                this._errors.push(error);
                break;
            default:
                throw error;
        }
    }

    /**
     * Builds an `AggregateError` from the errors appended so far.
     *
     * @returns The built error, or `undefined` if no errors have been appended.
     */
    build(): Error | undefined {
        return this.hasErrors ? new AggregateError(this._errors) : undefined;
    }

    /**
     * Builds an `AggregateError` from the errors appended so far, and throw it.
     *
     * @throws The built error, if any errors have been appended.
     */
    throwIfHasErrors(): void | never {
        const error = this.build();
        if (error) {
            throw error;
        }
    }
}
