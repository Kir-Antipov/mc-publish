import { McPublishInput, McPublishOutput } from "@/action";
import { GameVersionFilter, getGameVersionProviderByName } from "@/games";
import { LoaderMetadataReader, createDefaultLoaderMetadataReader } from "@/loaders";
import { PlatformType, createPlatformUploader } from "@/platforms";
import { GitHubContext } from "@/platforms/github";
import { SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER, createActionOutputControllerUsingMetadata, getActionOutput, getAllActionInputsAsObjectUsingMetadata, parseActionMetadataFromFile, setActionOutput } from "@/utils/actions";
import { ENVIRONMENT } from "@/utils/environment";
import { ArgumentError, ArgumentNullError, ErrorBuilder, FailMode, FileNotFoundError } from "@/utils/errors";
import { Logger, getDefaultLogger } from "@/utils/logging";
import { DYNAMIC_MODULE_LOADER } from "@/utils/reflection";
import { VersionType } from "@/utils/versioning";
import { PathLike } from "node:fs";

/**
 * Represents a GitHub Action.
 */
interface Action {
    /**
     * Gets the input of the action.
     */
    get input(): McPublishInput;

    /**
     * Gets the output of the action.
     */
    get output(): McPublishOutput;
}

/**
 * The main entry point of the program.
 *
 * @returns A promise that resolves when the program execution is complete.
 */
export async function main(): Promise<void> {
    const env = ENVIRONMENT;

    const logger = getDefaultLogger(env);

    try {
        const action = await initializeAction(new URL("../action.yml", import.meta.url), env);

        const githubContext = new GitHubContext(env);
        await publish(action, githubContext, logger);
    } catch (e) {
        logger.fatal(e);
        throw e;
    }
}

/**
 * Initiates the publishing process.
 *
 * @param action - The action details.
 * @param githubContext - The GitHub context.
 * @param logger - The logger to use for logging messages.
 *
 * @returns A promise that resolves when the publishing is complete.
 */
async function publish(action: Action, githubContext: GitHubContext, logger: Logger): Promise<void> {
    const metadataReader = createDefaultLoaderMetadataReader();
    const errors = new ErrorBuilder(logger);
    const processedPlatforms = [] as PlatformType[];

    for (const platform of PlatformType.values()) {
        const platformOptions = { ...action.input, ...action.input[platform] };
        if (!platformOptions?.token) {
            continue;
        }

        const options = await fillInDefaultValues(platformOptions, githubContext, metadataReader);
        const uploader = createPlatformUploader(platform, { logger, githubContext });
        try {
            action.output[platform as string] = await uploader.upload(options);
            processedPlatforms.push(platform);
        } catch (e) {
            errors.append(e, options.failMode ?? FailMode.FAIL);
        }
    }

    if (processedPlatforms.length) {
        logger.info(`🎉 Successfully published the assets to ${processedPlatforms.join(", ")}`);
    } else if (!errors.hasErrors) {
        logger.warn("⚠️ No valid platform tokens found in your config. To publish your project, please add the required access tokens for the desired platforms. Assets will not be published without them. Refer to the documentation for assistance in setting up your tokens.");
    }

    errors.throwIfHasErrors();
}

/**
 * Fills in the default values for the specified options.
 *
 * @param options - The options to fill in the default values for.
 * @param githubContext - The GitHub context.
 * @param reader - The metadata reader.
 *
 * @returns A promise that resolves to the options with default values filled in.
 */
async function fillInDefaultValues<T extends McPublishInput[PlatformType]>(options: T, githubContext: GitHubContext, reader?: LoaderMetadataReader): Promise<T> {
    ArgumentError.throwIfNullOrEmpty(options.files, "options.files");

    options = { ...options };
    const primaryFile = options.files[0];
    const metadata = await reader?.readMetadataFile(primaryFile.path);

    const gameVersionProvider = getGameVersionProviderByName(metadata?.gameName);
    const wrappedGameVersions = options.gameVersions?.length ? options.gameVersions : (metadata?.gameVersions || []);
    const gameVersions = await gameVersionProvider?.(wrappedGameVersions);
    const unwrappedGameVersions = gameVersions ? GameVersionFilter.filter(gameVersions, options.gameVersionFilter).map(x => x.id) : wrappedGameVersions;

    options.version ||= githubContext.payload.release?.tag_name || metadata?.version;
    options.versionType ||= VersionType.parseFromFileName(metadata?.version || primaryFile.name);
    options.name ??= githubContext.payload.release?.name || options.version;
    options.changelog ??= githubContext.payload.release?.body || "";
    options.loaders ??= metadata?.loaders || [];
    options.dependencies ??= metadata?.dependencies || [];
    options.gameVersions = unwrappedGameVersions;

    return options;
}

/**
 * Initializes the action.
 *
 * @param path - The path to the action's metadata file.
 * @param env - The environment variables.
 *
 * @returns A promise that resolves to the initialized action.
 */
async function initializeAction(path: PathLike, env?: Record<string, string>): Promise<Action> {
    ArgumentNullError.throwIfNull(path, "path");
    FileNotFoundError.throwIfNotFound(path);

    const config = {
        pathParser: SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER,
        moduleLoader: DYNAMIC_MODULE_LOADER,

        getOutput: (name: string) => getActionOutput(name, env),
        setOutput: (name: string, value: unknown) => setActionOutput(name, value, env),
    };

    const metadata = await parseActionMetadataFromFile(path);
    const input = await getAllActionInputsAsObjectUsingMetadata(metadata, config, env) as McPublishInput;
    const output = createActionOutputControllerUsingMetadata(metadata, config) as McPublishOutput;

    return { input, output };
}
