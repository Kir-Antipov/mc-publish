import { Logger } from "./logger";

/**
 * Null logger implementation, used for discarding all log messages.
 */
export class NullLogger implements Logger {
    /**
     * @inheritdoc
     */
    fatal(_message: string | Error): void {
        // NOP
    }

    /**
     * @inheritdoc
     */
    error(_message: string | Error): void {
        // NOP
    }

    /**
     * @inheritdoc
     */
    warn(_message: string | Error): void {
        // NOP
    }

    /**
     * @inheritdoc
     */
    info(_message: string | Error): void {
        // NOP
    }

    /**
     * @inheritdoc
     */
    debug(_message: string | Error): void {
        // NOP
    }
}
