import { getRequiredFiles, gradleOutputSelector } from "./utils/file-utils";
import PublisherFactory from "./publishing/publisher-factory";
import PublisherTarget from "./publishing/publisher-target";
import { getInputAsObject, mapNumberInput } from "./utils/input-utils";
import { getDefaultLogger } from "./utils/logger-utils";
import { retry } from "./utils/function-utils";
import LoggingStopwatch from "./utils/logging-stopwatch";

async function main() {
    const commonOptions = getInputAsObject();
    const publisherFactory = new PublisherFactory();
    const logger = getDefaultLogger();
    const publishedTo = new Array<string>();

    for (const target of PublisherTarget.getValues()) {
        const targetName = PublisherTarget.toString(target);
        const publisherOptions = commonOptions[targetName.toLowerCase()];
        if (!publisherOptions?.token || typeof publisherOptions.token !== "string") {
            continue;
        }

        const options = { ...commonOptions, ...publisherOptions };
        const fileSelector = typeof options.filesPrimary === "string" ? { primary: options.filesPrimary, secondary: typeof options.filesSecondary === "string" ? options.filesSecondary : gradleOutputSelector["secondary"] } : typeof options.files === "string" ? options.files : gradleOutputSelector;
        const files = await getRequiredFiles(fileSelector);
        const retryAttempts = mapNumberInput(options.retryAttempts);
        const retryDelay = mapNumberInput(options.retryDelay);

        const publisher = publisherFactory.create(target, logger);
        const stopwatch = LoggingStopwatch.startNew(logger, `Publishing assets to ${targetName}...`, ms => `Successfully published assets to ${targetName} (in ${ms} ms)`);

        await retry({
            func: () => publisher.publish(files, options),
            maxAttempts: retryAttempts,
            delay: retryDelay,
            errorCallback: e => {
                logger.error(`${e}`);
                logger.info(`Retrying to publish assets to ${targetName} in ${retryDelay} ms...`);
            }
        });

        stopwatch.stop();
        publishedTo.push(targetName);
    }

    if (publishedTo.length) {
        logger.info(`Your assets have been successfully published to: ${publishedTo.join(", ")}`);
    } else {
        logger.warn("You didn't specify any targets, your assets have not been published");
    }
}

main().catch(error => getDefaultLogger().fatal(error instanceof Error ? `${error}` : `Something went horribly wrong: ${error}`));
