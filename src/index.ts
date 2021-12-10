import { getRequiredFiles, gradleOutputSelector } from "./utils/file-utils";
import PublisherFactory from "./publishing/publisher-factory";
import PublisherTarget from "./publishing/publisher-target";
import { getInputAsObject } from "./utils/input-utils";
import { getDefaultLogger } from "./utils/logger-utils";

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
        const fileSelector = options.files && (typeof(options.files) === "string" || options.files.primary) ? options.files : gradleOutputSelector;
        const files = await getRequiredFiles(fileSelector);

        const publisher = publisherFactory.create(target, logger);
        logger.info(`Publishing assets to ${targetName}...`);
        const start = new Date();
        await publisher.publish(files, options);
        logger.info(`Successfully published assets to ${targetName} (in ${new Date().getTime() - start.getTime()}ms)`);
        publishedTo.push(targetName);
    }

    if (publishedTo.length) {
        logger.info(`Your assets have been successfully published to: ${publishedTo.join(", ")}`);
    } else {
        logger.warn("You didn't specify any targets, your assets have not been published");
    }
}

main().catch(error => getDefaultLogger().fatal(error instanceof Error ? error.message : `Something went horribly wrong: ${error}`));
