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
        if (!publisherOptions) {
            continue;
        }

        const publisher = publisherFactory.create(target, { ...commonOptions, ...publisherOptions }, logger);
        logger.info(`Publishing assets to ${targetName}...`);
        const start = new Date();
        await publisher.publish();
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
