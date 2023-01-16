import File, { gradleOutputSelector } from "./utils/io/file";
import PublisherFactory from "./publishing/publisher-factory";
import PublisherTarget from "./publishing/publisher-target";
import { getInputAsObject, mapBooleanInput, mapEnumInput, mapNumberInput } from "./utils/actions/input";
import { getDefaultLogger } from "./utils/logging/logger";
import retry from "./utils/retry";
import LoggingStopwatch from "./utils/logging/logging-stopwatch";
import AggregateError from "aggregate-error";
import * as core from "@actions/core";

enum FailMode {
    Fail,
    Warn,
    Skip,
}

async function main() {
    const commonOptions = getInputAsObject();
    const publisherFactory = new PublisherFactory();
    const logger = getDefaultLogger();
    const publishedTo = new Array<string>();
    const errors = new Array<Error>();

    for (const target of PublisherTarget.getValues()) {
        const targetName = PublisherTarget.toString(target);
        const publisherOptions = commonOptions[targetName.toLowerCase()];
        if (!publisherOptions?.token || typeof publisherOptions.token !== "string") {
            continue;
        }

        const options = { ...commonOptions, ...publisherOptions };
        const fileSelector = typeof options.filesPrimary === "string" ? { primary: options.filesPrimary, secondary: typeof options.filesSecondary === "string" ? options.filesSecondary : gradleOutputSelector.secondary } : typeof options.files === "string" ? options.files : gradleOutputSelector;
        const files = await File.getRequiredFiles(fileSelector);
        const retryAttempts = mapNumberInput(options.retryAttempts);
        const retryDelay = mapNumberInput(options.retryDelay);
        const failMode = mapEnumInput(options.failMode, FailMode, FailMode.Fail as FailMode);
        const dryRun = mapBooleanInput(options.dryRun);
        const publisher = publisherFactory.create(target, dryRun, logger);
        const func = {
            func: () => publisher.publish(files, options),
            maxAttempts: retryAttempts,
            delay: retryDelay,
            errorCallback: (e: Error) => {
                logger.error(e);
                logger.info(`🔂 Retrying to publish assets to ${targetName} in ${retryDelay} ms...`);
            }
        };

        const stopwatch = LoggingStopwatch.startNew(logger, `📤 Publishing assets to ${targetName}...`, ms => `✅ Successfully published assets to ${targetName} (in ${ms} ms)`);
        try {
            core.setOutput(`${targetName}_link`, (await retry(func)).link);
        } catch(e: any) {
            switch (failMode) {
                case FailMode.Warn:
                    logger.warn(e);
                    continue;
                case FailMode.Skip:
                    logger.warn(`☢️ An error occurred while uploading assets to ${targetName}`);
                    errors.push(e);
                    continue;
                default:
                    throw e;
            }
        }
        stopwatch.stop();
        publishedTo.push(targetName);
    }

    if (publishedTo.length) {
        logger.info(`🎉 Your assets have been successfully published to: ${publishedTo.join(", ")}`);
    } else if (!errors.length) {
        logger.warn("🗿 You didn't specify any targets, your assets have not been published");
    }

    core.setOutput("publishedTo", publishedTo);

    if (errors.length) {
        throw new AggregateError(errors);
    }
}

main().catch(error => getDefaultLogger().fatal(error instanceof Error ? error : `💀 Something went horribly wrong: ${error}`));
