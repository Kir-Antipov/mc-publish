import { JS_MULTILINE_FRAME_STYLE, OptionalAutoGeneratedWarningFrameOptions, generateAutoGeneratedWarningFrame } from "@/utils/auto-generated";
import { DEFAULT_NEWLINE, UNIX_NEWLINE } from "@/utils/environment";
import { AsyncFilePath, AsyncReadFileOptions, AsyncReadFileOptionsObject, AsyncWriteFileOptionsObject } from "@/utils/io";
import { $i } from "@/utils/collections";
import { hashString } from "@/utils/string-utils";
import { TypeScriptComment, TypeScriptDocument, TypeScriptImport, TypeScriptInterface, TypeScriptTypeAlias, TypeScriptTypeLiteral, TypeScriptVariable, getIndentation, getNewline, getQuotes, incrementIndent } from "@/utils/typescript";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { ActionGroup, DEFAULT_ACTION_GROUP_DELIMITER } from "./action-group";
import { ActionInput, SYNTHETIC_UNDEFINED } from "./action-input";
import { ActionInputDescriptor, getActionInputDescriptors } from "./action-input-descriptor";
import { ActionOutput } from "./action-output";
import { ActionOutputDescriptor, getActionOutputDescriptors } from "./action-output-descriptor";
import { ActionParameter } from "./action-parameter";
import { ActionParameterDescriptor, ActionParameterDescriptorExtractionOptions } from "./action-parameter-descriptor";

/**
 * Describes GitHub Action metadata file (`action.yml` or `action.yaml`).
 */
export interface ActionMetadata {
    /**
     * The name of your action.
     *
     * GitHub displays the `name` in the Actions tab to help visually identify actions in each job.
     */
    name: string;

    /**
     * Describes types represented by input and output parameters of the action.
     *
     * @custom
     */
    types?: {
        /**
         * Describes a type represented by input parameters of the action.
         */
        input?: string | { name: string; description?: string; };

        /**
         * Describes a type represented by output parameters of the action.
         */
        output?: string | { name: string; description?: string; };
    };

    /**
     * A short description of the action.
     */
    description: string;

    /**
     * The name of the action's author.
     */
    author?: string;

    /**
     * Configures branding for the action.
     */
    branding?: {
        /**
         * The background color of the badge.
         */
        color: "white" | "yellow" | "blue" | "green" | "orange" | "red" | "purple" | "gray-dark";

        /**
         * The name of the v4.28.0 Feather icon to use.
         */
        icon: string;
    };

    /**
     * Describes groups for this action.
     *
     * @custom
     */
    groups?: {
        /**
         * Describes input groups.
         */
        input?: Record<string, ActionGroup>;

        /**
         * Describes output groups.
         */
        output?: Record<string, ActionGroup>;
    };

    /**
     * Input parameters allow you to specify data that the action expects to use during runtime.
     * GitHub stores input parameters as environment variables.
     * Input ids with uppercase letters are converted to lowercase during runtime. We recommend using lowercase input ids.
     */
    inputs?: Record<string, ActionInput>;

    /**
     * Output parameters allow you to declare data that an action sets.
     * Actions that run later in a workflow can use the output data set in previously run actions.
     * For example, if you had an action that performed the addition of two inputs (x + y = z), the action could output the sum (z) for other actions to use as an input.
     *
     * Outputs are Unicode strings, and can be a maximum of 1 MB. The total of all outputs in a workflow run can be a maximum of 50 MB.
     */
    outputs?: Record<string, ActionOutput>;

    /**
     * Configures the path to the action's code and the runtime used to execute the code.
     */
    runs: {
        /**
         * The runtime used to execute the code specified in `main`.
         *
         * @remarks
         *
         * Due to the deprecation of Node12, the available options are quite limited now.
         */
        using: "node16";

        /**
         * The file that contains your action code.
         *
         * The runtime specified in `using` executes this file.
         */
        main: string;
    };
}

/**
 * Represents options available for configuring action metadata template processing.
 */
interface ActionMetadataTemplateProcessingOptions {
    /**
     * The delimiter to use when concatenating group and input/output names.
     *
     * Defaults to `"-"`.
     */
    groupDelimiter?: string;

    /**
     * Determines whether template-only fields such as `include`, `exclude`, and `unique`
     * should be removed from groups and inputs/outputs.
     *
     * Defaults to `true`.
     */
    removeTemplateOnlyFields?: boolean;
}

/**
 * Options for defining TypeScript definition for an action.
 */
interface ActionMetadataTypeScriptDefinitionOptions extends ActionParameterDescriptorExtractionOptions, OptionalAutoGeneratedWarningFrameOptions {
    /**
     * The name of the constant containing the action's name.
     *
     * Defaults to `"ACTION_NAME"`.
     */
    actionNameConstant?: string;

    /**
     * The root path of the action.
     *
     * Defaults to `"./"`.
     */
    rootPath?: string;

    /**
     * A boolean indicating whether or not to disable ESLint for the generated TypeScript code.
     *
     * - If `true`, a comment disabling ESLint will be added to the output.
     * - If `false` (or not provided), no changes to ESLint configuration will be made.
     *
     * Defaults to `true`.
     */
    disableESLint?: boolean;
}

/**
 * Options for defining TypeScript definition of the module loader required by an action.
 */
interface ActionMetadataModuleLoaderTypeScriptDefinitionOptions extends ActionMetadataTypeScriptDefinitionOptions {
    /**
     * The name of the module loader function.
     */
    moduleLoaderName?: string;
}

/**
 * Represents formatting options for YAML output.
 */
type YamlFormattingOptions = Exclude<Parameters<typeof stringifyYaml>[2], string | number>;

/**
 * Represent options for formatting an action metadata template.
 */
type ActionMetadataFormattingOptions = ActionMetadataTemplateProcessingOptions & YamlFormattingOptions & OptionalAutoGeneratedWarningFrameOptions;

/**
 * Represents options available for reading, writing, processing, and formatting action metadata template files.
 */
type ActionMetadataTemplateFileProcessingOptions = ActionMetadataFormattingOptions & AsyncReadFileOptionsObject & AsyncWriteFileOptionsObject;


/**
 * The default root path to use if none is provided.
 */
const DEFAULT_ROOT_PATH = "./";

/**
 * The default action name constant name to use if none is provided.
 */
const DEFAULT_ACTION_NAME_CONSTANT_NAME = "ACTION_NAME";

/**
 * The default input type name to use if none is provided.
 */
const DEFAULT_INPUT_TYPE_NAME = "ActionInputs";

/**
 * The default output type name to use if none is provided.
 */
const DEFAULT_OUTPUT_TYPE_NAME = "ActionOutputs";

/**
 * The default module loader name.
 */
const DEFAULT_MODULE_LOADER_NAME = "ACTION_MODULE_LOADER";

/**
 * The {@link TypeScriptComment} object representing the comment to disable ESLint.
 *
 * Used when `disableESLint` option is set to `true`.
 */
const DISABLE_ES_LINT_COMMENT = TypeScriptComment.parse("/* eslint-disable */");


/**
 * Parses the provided YAML text as {@link ActionMetadata}.
 *
 * @param actionYamlText - The YAML text to parse.
 *
 * @returns The parsed {@link ActionMetadata} object.
 * @throws An error if the provided YAML text is invalid.
 */
export function parseActionMetadataFromString(actionYamlText: string): ActionMetadata | never {
    return parseYaml(actionYamlText);
}

/**
 * Reads a YAML file at the provided path, and parses it as {@link ActionMetadata}.
 *
 * @param actionFile - The path to the YAML file to read.
 * @param options - The options to use when reading the file.
 *
 * @returns The parsed {@link ActionMetadata} object.
 * @throws An error if the file cannot be read or the YAML text is invalid.
 */
export async function parseActionMetadataFromFile(actionFile: AsyncFilePath, options?: AsyncReadFileOptions): Promise<ActionMetadata | never> {
    const fileContent = (await readFile(actionFile, options)).toString();
    return parseActionMetadataFromString(fileContent);
}

/**
 * Processes an Action Metadata Template by
 *
 *  - Sanitizing inputs.
 *  - Grouping inputs/outputs into their respective groups.
 *  - Removing template-only fields, if requested
 *
 * @param template - The original action metadata template to be processed.
 * @param options - An optional set of options used to configure how the template is processed.
 *
 * @returns A new action metadata based on the given template.
 */
export function processActionMetadataTemplate(template: ActionMetadata, options?: ActionMetadataTemplateProcessingOptions): ActionMetadata {
    const groupDelimiter = options?.groupDelimiter ?? DEFAULT_ACTION_GROUP_DELIMITER;
    const removeTemplateOnlyFields = options?.removeTemplateOnlyFields ?? true;

    const metadata = { ...template };
    metadata.inputs = sanitizeActionInputs(metadata.inputs);
    if (metadata.groups) {
        metadata.inputs = groupActionParameters(metadata.inputs, metadata.groups.input, groupDelimiter, { default: SYNTHETIC_UNDEFINED });
        metadata.outputs = groupActionParameters(metadata.outputs, metadata.groups.output, groupDelimiter);
    }

    if (!removeTemplateOnlyFields) {
        return metadata;
    }

    if (metadata.groups) {
        metadata.groups.input = removeTemplateOnlyActionFields(metadata.groups.input);
        metadata.groups.output = removeTemplateOnlyActionFields(metadata.groups.output);
    }
    metadata.inputs = removeTemplateOnlyActionFields(metadata.inputs);
    metadata.outputs = removeTemplateOnlyActionFields(metadata.outputs);
    return metadata;
}

/**
 * Processes an Action Metadata Template YAML string, returning a stringified version of the processed template.
 *
 * @param templateYamlText - The YAML string containing the Action Metadata Template to process.
 * @param options - An optional set of options to apply when processing the template.
 *
 * @returns A stringified version of the processed Action Metadata Template.
 * @throws If parsing or processing the Action Metadata Template fails.
 */
export function processActionMetadataTemplateString(templateYamlText: string, options?: ActionMetadataFormattingOptions): string | never {
    const newline = options?.newline ?? DEFAULT_NEWLINE;
    const generateAutoGeneratedWarningMessage = options?.generateAutoGeneratedWarningMessage ?? true;

    const parsedTemplate = parseActionMetadataFromString(templateYamlText);
    const processedTemplate = processActionMetadataTemplate(parsedTemplate, options);
    const stringifiedProcessedTemplate = stringifyYaml(processedTemplate, options);

    const fixedStringifiedProcessedTemplate = newline === UNIX_NEWLINE ? stringifiedProcessedTemplate : stringifiedProcessedTemplate.replaceAll(UNIX_NEWLINE, newline);
    const warningMessage = generateAutoGeneratedWarningMessage ? generateAutoGeneratedWarningFrame(options) : undefined;
    const stringifiedProcessedTemplateWithWarning = [warningMessage, fixedStringifiedProcessedTemplate].filter(x => x).join(newline);

    return stringifiedProcessedTemplateWithWarning;
}

/**
 * Reads an Action Metadata Template YAML file, processes it, and writes the resulting metadata to a file.
 *
 * @param inputTemplateFile - The path to the input Action Metadata Template file.
 * @param outputMetadataFile - The path to the output metadata file.
 * @param options - An optional set of read/write options and processing options to apply.
 *
 * @returns A promise that resolves when the metadata has been written to the output file, or rejects if any step fails.
 * @throws If reading, parsing, processing, or writing the Action Metadata Template fails.
 */
export async function processActionMetadataTemplateFile(inputTemplateFile: AsyncFilePath, outputMetadataFile: AsyncFilePath, options?: ActionMetadataTemplateFileProcessingOptions): Promise<void | never> {
    options = { sourceFileName: basename(inputTemplateFile.toString()), ...options };

    const template = (await readFile(inputTemplateFile, options)).toString();
    const stringifiedProcessedTemplate = processActionMetadataTemplateString(template, options);
    await writeFile(outputMetadataFile, stringifiedProcessedTemplate, options);
}

/**
 * Groups input/output values by their respective action groups, applying any specified group properties.
 *
 * @param groups - A dictionary of named action groups containing the list of input/output values to group.
 * @param parameters - A dictionary of named input/output values to be grouped.
 * @param groupDelimiter - The delimiter used to separate the group name from the value name in the output dictionary.
 * @param properties - An optional set of input/output properties to apply to each grouped value.
 *
 * @returns A new dictionary of named input/output values grouped by their respective action groups.
 */
function groupActionParameters<T extends ActionParameter>(parameters: Record<string, T>, groups: Record<string, ActionGroup>, groupDelimiter: string, properties?: Partial<T>): Record<string, T> {
    if (!groups || !parameters) {
        return parameters;
    }

    const processedValues = { ...parameters };
    const namedGroups = Object.entries(groups);
    const groupedValues = $i(Object.entries(parameters)).flatMap(
        ([vName, v]) => $i(namedGroups).map(([gName, g]) => [gName, g, vName, v] as [string, ActionGroup, string, T])
    );

    for (const [groupName, group, valueName, value] of groupedValues) {
        const isForciblyIncluded = group.include?.includes(valueName);
        const isForciblyExcluded = group.exclude?.includes(valueName);
        const isPartOfGroup = namedGroups.some(([gName]) => valueName.startsWith(gName));

        const shouldBeIncluded = (isForciblyIncluded || !value.unique && !isPartOfGroup) && !isForciblyExcluded;
        if (!shouldBeIncluded) {
            continue;
        }

        const groupedValueName = `${groupName}${groupDelimiter}${valueName}`;
        const groupedRedirectName = value.redirect && `${groupName}${groupDelimiter}${value.redirect}`;
        processedValues[groupedValueName] = {
            ...value,
            redirect: groupedRedirectName,
            ...properties,
        };
    }
    return processedValues;
}

/**
 * Sanitizes an input dictionary by setting default values for undefined fields.
 *
 * @param inputs - A dictionary of named action inputs to be sanitized.
 *
 * @returns A new dictionary of sanitized named action inputs.
 */
function sanitizeActionInputs(inputs: Record<string, ActionInput>): Record<string, ActionInput> {
    if (!inputs) {
        return inputs;
    }

    const sanitizedInputs = { } as typeof inputs;
    for (const [name, input] of Object.entries(inputs)) {
        const copiedInput = { ...input };
        if (typeof copiedInput.required !== "boolean") {
            copiedInput.required = false;
        }
        if (copiedInput.default === undefined) {
            copiedInput.default = SYNTHETIC_UNDEFINED;
        }
        sanitizedInputs[name] = copiedInput;
    }
    return sanitizedInputs;
}

/**
 * Removes template-only fields from an action input/output/group dictionary.
 *
 * @param values - A dictionary of action input/output/group values to be cleaned.
 *
 * @returns A new dictionary of action input/output/group values with template-only fields removed.
 */
function removeTemplateOnlyActionFields<T extends ActionParameter | ActionGroup>(values: Record<string, T>): Record<string, T> {
    if (!values) {
        return values;
    }

    const cleanedValues = { } as typeof values;
    for (const [name, value] of Object.entries(values)) {
        const copiedValue = { ...value };
        delete (copiedValue as ActionGroup).include;
        delete (copiedValue as ActionGroup).exclude;
        delete (copiedValue as ActionParameter).unique;

        cleanedValues[name] = copiedValue;
    }
    return cleanedValues;
}

/**
 * Generates a TypeScript definition for the given GitHub Action metadata.
 *
 * @param metadata - Metadata describing the inputs and outputs of a GitHub Action.
 * @param options - Configuration options for generating the TypeScript definition.
 *
 * @returns The generated TypeScript document.
 */
export function createTypeScriptDefinitionForActionMetadata(metadata: ActionMetadata, options?: ActionMetadataTypeScriptDefinitionOptions): TypeScriptDocument {
    const document = TypeScriptDocument.create();

    const inputDescriptors = getActionInputDescriptors(metadata, options);
    const inputGroups = inputDescriptors.length ? Object.entries(metadata.groups?.input || {}) : [];

    const outputDescriptors = getActionOutputDescriptors(metadata, options);
    const outputGroups = outputDescriptors.length ? Object.entries(metadata.groups?.output || {}) : [];

    const rootPath = options?.rootPath ?? DEFAULT_ROOT_PATH;
    const imports = [...inputDescriptors, ...outputDescriptors].map(x => createTypeScriptImportForActionParameter(x, rootPath)).filter(x => x);
    imports.forEach(i => document.addImport(i));

    const comments = createTypeScriptCommentsForActionMetadata(options);
    comments.forEach(comment => document.addComment(comment));

    const actionName = createTypeScriptConstantForActionName(metadata, options);
    document.addExport(actionName);

    const inputsInterface = inputDescriptors.length ? createTypeScriptInterfaceForActionInputs(metadata, inputDescriptors, options) : undefined;
    const inputGroupAliases = inputGroups.map(([groupName, group]) => createTypeScriptAliasForActionGroup(group, groupName, inputsInterface.name, options));
    [inputsInterface, ...inputGroupAliases].filter(x => x).forEach(node => document.addExport(node));

    const outputInterface = outputDescriptors.length ? createTypeScriptInterfaceForActionOutputs(metadata, outputDescriptors, options) : undefined;
    const outputGroupAliases = outputGroups.map(([groupName, group]) => createTypeScriptAliasForActionGroup(group, groupName, outputInterface.name, options));
    [outputInterface, ...outputGroupAliases].filter(x => x).forEach(node => document.addExport(node));

    return document;
}

/**
 * Generates a TypeScript constant representing the name of a GitHub Action.
 *
 * @param metadata - Metadata describing the GitHub Action.
 * @param options - Configuration options for generating TypeScript constant.
 *
 * @returns The generated TypeScript constant representing the name of the GitHub Action..
 */
function createTypeScriptConstantForActionName(metadata: ActionMetadata, options?: ActionMetadataTypeScriptDefinitionOptions): TypeScriptVariable {
    const q = getQuotes(options);
    const name = options.actionNameConstant || DEFAULT_ACTION_NAME_CONSTANT_NAME;

    const actionName = TypeScriptVariable.create(name, TypeScriptTypeLiteral.create(`${q}${metadata.name}${q}`));
    if (metadata.description) {
        actionName.addTSDoc(metadata.description);
    }

    return actionName;
}

/**
 * Generates TypeScript comments for the GitHub Action metadata.
 *
 * @param options - Configuration options for generating TypeScript comments.
 *
 * @returns An array of generated comments.
 */
function createTypeScriptCommentsForActionMetadata(options?: ActionMetadataTypeScriptDefinitionOptions): TypeScriptComment[] {
    const disableESLint = options?.disableESLint ?? true;
    const generateAutoGeneratedWarningMessage = options?.generateAutoGeneratedWarningMessage ?? true;

    const comments = [] as TypeScriptComment[];
    if (generateAutoGeneratedWarningMessage) {
        const autoGeneratedWarningMessage = generateAutoGeneratedWarningFrame({ style: JS_MULTILINE_FRAME_STYLE, ...options });
        const autoGeneratedWarningComment = TypeScriptComment.parse(autoGeneratedWarningMessage);
        comments.push(autoGeneratedWarningComment);
    }
    if (disableESLint) {
        comments.push(DISABLE_ES_LINT_COMMENT);
    }

    return comments;
}

/**
 * Generates a TypeScript interface for the inputs of a GitHub Action.
 *
 * @param metadata - Metadata describing the inputs of a GitHub Action.
 * @param inputs - An iterable collection of input descriptors for the GitHub Action.
 * @param pathExtractionOptions - Configuration options for extracting paths.
 *
 * @returns The generated TypeScript interface.
 */
function createTypeScriptInterfaceForActionInputs(metadata: ActionMetadata, inputs: Iterable<ActionInputDescriptor>, pathExtractionOptions?: ActionParameterDescriptorExtractionOptions): TypeScriptInterface {
    const inputType = metadata.types?.input;
    const typeName = (typeof inputType === "string" ? inputType : inputType?.name) || DEFAULT_INPUT_TYPE_NAME;
    const typeDescription = (typeof inputType === "string" ? undefined : inputType?.description);
    return createTypeScriptInterfaceForActionParameters(typeName, typeDescription, inputs, metadata.groups?.input, pathExtractionOptions, x => !x.required);
}

/**
 * Generates a TypeScript interface for the outputs of a GitHub Action.
 *
 * @param metadata - Metadata describing the outputs of a GitHub Action.
 * @param outputs - An iterable collection of output descriptors for the GitHub Action.
 * @param pathExtractionOptions - Configuration options for extracting paths.
 *
 * @returns The generated TypeScript interface.
 */
function createTypeScriptInterfaceForActionOutputs(metadata: ActionMetadata, outputs: Iterable<ActionOutputDescriptor>, pathExtractionOptions?: ActionParameterDescriptorExtractionOptions): TypeScriptInterface {
    const outputType = metadata.types?.output;
    const typeName = (typeof outputType === "string" ? outputType : outputType?.name) || DEFAULT_OUTPUT_TYPE_NAME;
    const typeDescription = (typeof outputType === "string" ? undefined : outputType?.description);
    return createTypeScriptInterfaceForActionParameters(typeName, typeDescription, outputs, metadata.groups?.output, pathExtractionOptions);
}

/**
 * Generates a TypeScript interface for the parameters of a GitHub Action.
 *
 * @param name - The name of the interface.
 * @param description - A description of the interface.
 * @param parameters - An iterable collection of parameter descriptors of the GitHub Action.
 * @param groups - A collection of action groups.
 * @param pathExtractionOptions - Configuration options for extracting paths.
 * @param isOptionalPredicate - A predicate function for determining if a parameter is optional.
 *
 * @returns The generated TypeScript interface.
 */
function createTypeScriptInterfaceForActionParameters<T extends ActionParameterDescriptor>(name: string, description: string, parameters: Iterable<T>, groups?: Record<string, ActionGroup>, pathExtractionOptions?: ActionParameterDescriptorExtractionOptions, isOptionalPredicate?: (p: T) => boolean): TypeScriptInterface {
    isOptionalPredicate ||= () => false;

    const tsInterface = TypeScriptInterface.create(name);
    const tsInterfaceDefinition = tsInterface.definition;
    if (description) {
        tsInterface.addTSDoc(description);
    }

    for (const parameter of parameters) {
        if (parameter.redirect) {
            continue;
        }

        const path = parameter.path;
        const type = TypeScriptTypeLiteral.create(`${parameter.type.name}${parameter.type.isArray ? "[]" : ""}`);
        const isOptional = isOptionalPredicate(parameter);

        const property = tsInterfaceDefinition.addNestedProperty(path, type, { isOptional });
        if (parameter.description) {
            property.addTSDoc(parameter.description);
        }
    }

    for (const [groupName, group] of Object.entries(groups || {})) {
        if (!group.description) {
            continue;
        }

        const path = pathExtractionOptions?.pathParser?.(groupName) || [groupName];
        const groupProperty = tsInterface.definition.getNestedProperty(path);
        groupProperty?.addTSDoc(group.description);
    }

    return tsInterface;
}

/**
 * Generates a TypeScript import for a parameter of a GitHub Action.
 *
 * @param parameter - A descriptor for an input or output parameter of the GitHub Action.
 * @param rootPath - The root path for the import.
 *
 * @returns The generated TypeScript import, or `undefined` if no import is necessary.
 */
function createTypeScriptImportForActionParameter(parameter: ActionParameterDescriptor, rootPath?: string): TypeScriptImport | undefined {
    if (!parameter.type.module || parameter.redirect) {
        return undefined;
    }

    const modulePath = `${rootPath || ""}${parameter.type.module}`;
    const tsImport = TypeScriptImport.createEmptyImport(modulePath);
    if (parameter.type.isDefault) {
        tsImport.defaultImportName = parameter.type.name;
    } else {
        tsImport.addNamedImport(parameter.type.name);
    }
    return tsImport;
}

/**
 * Generates a TypeScript type alias for a group of inputs or outputs of a GitHub Action.
 *
 * @param group - A group of inputs or outputs for the GitHub Action.
 * @param groupName - The name of the group.
 * @param referencedTypeName - The name of the type that the alias references.
 * @param pathExtractionOptions - Configuration options for extracting paths.
 *
 * @returns The generated TypeScript type alias.
 */
function createTypeScriptAliasForActionGroup(group: ActionGroup, groupName: string, referencedTypeName: string, pathExtractionOptions?: ActionParameterDescriptorExtractionOptions): TypeScriptTypeAlias {
    const path = pathExtractionOptions?.pathParser?.(groupName) || [groupName];
    const mappedPath = path.map(x => `["${x}"]`).join("");
    const groupAlias = TypeScriptTypeAlias.create(group.type, TypeScriptTypeLiteral.create(`${referencedTypeName}${mappedPath}`));
    if (group.description) {
        groupAlias.addTSDoc(group.description);
    }
    return groupAlias;
}

/**
 * Generates a TypeScript document containing a module loader function for the given action metadata.
 *
 * The module loader function loads modules required to parse the inputs and outputs of the action.
 *
 * @param metadata - The action metadata.
 * @param options - The options for generating the TypeScript document.
 *
 * @returns A TypeScript document containing the module loader function and necessary imports.
 */
export function createModuleLoaderTypeScriptDefinitionForActionMetadata(metadata: ActionMetadata, options?: ActionMetadataModuleLoaderTypeScriptDefinitionOptions): TypeScriptDocument {
    const document = TypeScriptDocument.create();

    const inputDescriptors = getActionInputDescriptors(metadata, options);
    const outputDescriptors = getActionOutputDescriptors(metadata, options);
    const modules = $i<ActionParameterDescriptor>(inputDescriptors).concat(outputDescriptors)
        .flatMap(x => [x.type.module, x.type.factory?.module])
        .filter(x => x)
        .distinct()
        .map(x => [x, `_${hashString(x, "sha1")}`] as const)
        .toMap();

    const q = getQuotes(options);
    const fallback = "return Promise.resolve(undefined);";
    const conditions = $i(modules)
        .map(([path, name]) => `if (path === ${q}${path}${q}) return Promise.resolve(${name});`)
        .push(fallback);

    const newline = getNewline(options);
    const indent = getIndentation(incrementIndent(options));
    const formattedConditions = conditions.map(x => `${indent}${x}`).join(newline);
    const moduleLoaderBody = TypeScriptTypeLiteral.create(
        `(path: string): Promise<Record<string, unknown>> => {${newline}${formattedConditions}${newline}};`
    );

    const moduleLoaderName = options?.moduleLoaderName || DEFAULT_MODULE_LOADER_NAME;
    const moduleLoader = TypeScriptVariable.create(moduleLoaderName, moduleLoaderBody);
    document.addExport(moduleLoader);

    const rootPath = options?.rootPath ?? DEFAULT_ROOT_PATH;
    const imports = $i(modules).map(([path, name]) => TypeScriptImport.createWildcardImport(`${rootPath}${path}`, name));
    imports.forEach(x => document.addImport(x));

    const comments = createTypeScriptCommentsForActionMetadata(options);
    comments.forEach(comment => document.addComment(comment));

    return document;
}

/**
 * Removes custom fields from Action Metadata.
 *
 * @param metadata - The original action metadata to be stripped.
 *
 * @returns A new action metadata object stripped of custom fields.
 */
export function stripActionMetadataFromCustomFields(metadata: ActionMetadata): ActionMetadata {
    const stripped = { ...metadata };
    delete stripped.groups;
    delete stripped.types;

    stripped.inputs = stripped.inputs ? { ...stripped.inputs } : undefined;
    for (const [name, input] of Object.entries(stripped.inputs || {})) {
        const strippedInput = { ...input };
        delete strippedInput.type;
        delete strippedInput.unique;
        delete strippedInput.redirect;

        stripped.inputs[name] = strippedInput;
    }

    stripped.outputs = stripped.outputs ? { ...stripped.outputs } : undefined;
    for (const [name, output] of Object.entries(stripped.outputs || {})) {
        const strippedOutput = { ...output };
        delete strippedOutput.type;
        delete strippedOutput.unique;
        delete strippedOutput.redirect;

        stripped.outputs[name] = strippedOutput;
    }

    return stripped;
}

/**
 * Removes custom fields from action metadata and returns a stringified version of the stripped metadata.
 *
 * @param metadata - The stringified action metadata to be stripped.
 * @param options - An optional set of options to apply when processing the metadata.
 *
 * @returns A stringified version of the stripped action metadata.
 */
export function stripActionMetadataStringFromCustomFields(metadata: string, options?: ActionMetadataFormattingOptions): string {
    const newline = options?.newline ?? DEFAULT_NEWLINE;
    const generateAutoGeneratedWarningMessage = options?.generateAutoGeneratedWarningMessage ?? true;

    const parsedMetadata = parseActionMetadataFromString(metadata);
    const strippedMetadata = stripActionMetadataFromCustomFields(parsedMetadata);
    const stringifiedStrippedMetadata = stringifyYaml(strippedMetadata, options);

    const fixedStringifiedStrippedMetadata = newline === UNIX_NEWLINE ? stringifiedStrippedMetadata : stringifiedStrippedMetadata.replaceAll(UNIX_NEWLINE, newline);
    const warningMessage = generateAutoGeneratedWarningMessage ? generateAutoGeneratedWarningFrame(options) : undefined;
    const stringifiedStrippedMetadataWithWarning = [warningMessage, fixedStringifiedStrippedMetadata].filter(x => x).join(newline);

    return stringifiedStrippedMetadataWithWarning;
}

/**
 * Reads an action metadata file, removes custom fields from it, and writes the resulting metadata to a file.
 *
 * @param inputMetadataFile - The path to the original action metadata file to be stripped.
 * @param outputMetadataFile - The path to the output metadata file.
 * @param options - An optional set of read/write options and processing options to apply.
 *
 * @returns A promise that resolves when the metadata has been written to the output file, or rejects if any step fails.
 * @throws If reading, parsing, processing, or writing the action metadata fails.
 */
export async function stripActionMetadataFileFromCustomFields(inputMetadataFile: AsyncFilePath, outputMetadataFile: AsyncFilePath, options?: ActionMetadataTemplateFileProcessingOptions): Promise<void | never> {
    options = { sourceFileName: basename(inputMetadataFile.toString()), ...options };

    const metadata = (await readFile(inputMetadataFile, options)).toString();
    const stringifiedStrippedMetadata = stripActionMetadataStringFromCustomFields(metadata, options);
    await writeFile(outputMetadataFile, stringifiedStrippedMetadata, options);
}
