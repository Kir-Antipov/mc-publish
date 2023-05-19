import { QueryString } from "@/utils/net";
import { ImportDirective, parseImportDirective } from "@/utils/reflection";

/**
 * Represents a type of a parameter of a GitHub Action.
 */
export interface ActionParameterTypeDescriptor extends ImportDirective {
    /**
     * Indicates whether the type should be treated as an array.
     */
    isArray: boolean;

    /**
     * A factory function able to create a new instance of the this type.
     */
    factory?: ImportDirective;

    /**
     * Options for the factory function.
     *
     * Known values include:
     * - `split` (boolean) - Determines if the input string should be split into an array of strings.
     * Defaults to `true` if this type represents an array, and `false` otherwise.
     *
     * - `separator` (RegExp) - If `split` is `true`, this is used to divide the input string into an array of strings.
     * Otherwise, it's unused. Default value is `/\r?\n/g`.
     *
     * - `processSeparately` (boolean) - If `split` is set to `true`, this indicates whether the factory/converter function
     * should accept the input array as a whole or process its values individually and then concatenate them into a new array.
     * Default value is the same as `split`.
     *
     * - `trimEntries` (boolean) - If `true`, trims whitespace from the beginning and end of each entry in the array.
     * Default value is the same as `split`.
     *
     * - `removeEmptyEntries` (boolean) - If `true`, removes empty entries from the array after processing.
     * Default value is the same as `split`.
     *
     * - `flatDepth` (number) - The depth level specifying how deep a nested array structure should be flattened.
     * Passes the value to Array.prototype.flat() method. Default value is `1`.
     */
    options?: QueryString;
}

/**
 * Parses a string into a type descriptor of a parameter of a GitHub Action.
 *
 * @param descriptor - The type descriptor to parse.
 *
 * @returns An {@link ActionParameterTypeDescriptor} object, or `undefined` if the input was invalid.
 *
 * @example
 *
 * ```
 * parseActionParameterTypeDescriptor("foo/bar-bar/baz-baz->{BazBaz}:{parseBazBaz}?key=value");
 * ```
 */
export function parseActionParameterTypeDescriptor(descriptor: string): ActionParameterTypeDescriptor | undefined {
    if (!descriptor) {
        return undefined;
    }

    // Remove all whitespace characters and generics from the descriptor.
    descriptor = descriptor.replaceAll(/\s/g, "").replaceAll(/<.*>/g, "");

    const isArray = descriptor.includes("[]");
    descriptor = descriptor.replaceAll("[]", "");

    const optionsIndex = descriptor.indexOf("?");
    const options = optionsIndex >= 0 ? QueryString.parse(descriptor.substring(optionsIndex)) : undefined;
    descriptor = optionsIndex >= 0 ? descriptor.substring(0, optionsIndex) : descriptor;

    const normalizedDescriptor = normalizePattern(descriptor);
    const [type, factory] = normalizedDescriptor.split(";").map(parseImportDirective);

    return { ...type, factory, options, isArray };
}

/**
 * Normalizes a type descriptor pattern for use in an action signature.
 *
 * @param descriptor - The type descriptor pattern to normalize.
 *
 * @returns The normalized type descriptor pattern.
 *
 * @example
 *
 * ```
 * "foo/bar-bar/baz-baz->{BazBaz:parseBazBaz}" => "foo/bar-bar/baz-baz->{BazBaz};parseBazBaz"
 * "foo/bar-bar/baz-baz->{BazBaz}:{parseBazBaz}" => "foo/bar-bar/baz-baz->{BazBaz};foo/bar-bar/baz-baz->{parseBazBaz}"
 * "foo/bar-bar/baz-baz->{BazBaz}:parseBazBaz" => "foo/bar-bar/baz-baz->{BazBaz};foo/bar-bar/baz-baz->parseBazBaz"
 * "foo/bar-bar/baz-baz->BazBaz:{parseBazBaz}" => "foo/bar-bar/baz-baz->BazBaz;foo/bar-bar/baz-baz->{parseBazBaz}"
 * "foo/bar-bar/baz-baz->BazBaz:parseBazBaz" => "foo/bar-bar/baz-baz->BazBaz;parseBazBaz"
 * ```
 */
function normalizePattern(descriptor: string): string {
    if (!descriptor.includes("/") && descriptor.includes(".")) {
        return normalizePatternInDotNotation(descriptor);
    }

    if (!descriptor.includes(":")) {
        return descriptor;
    }

    const descriptors = descriptor.split(";");
    const mainDescriptor = descriptors[0];
    if (!mainDescriptor.includes(":")) {
        return mainDescriptor;
    }

    const typeDescriptor = mainDescriptor.replaceAll(/:(?:\w+|{\w+})/g, "");
    const typeModule = mainDescriptor.match(/^.*->/)?.[0];
    const match = mainDescriptor.match(/\{?(?<type>\w+)(?<isTypeImported>\}?):(?<isFactoryImported>\{?)(?<factory>\w+)\}?/)?.groups;
    const factoryModule = !match.isTypeImported && !match.isFactoryImported ? "" : typeModule;
    const factoryDescriptor = factoryModule + (match.isFactoryImported ? `{${match.factory}}` : match.factory);
    return `${typeDescriptor};${factoryDescriptor}`;
}

/**
 * Converts a type descriptor in dot notation to slash notation.
 *
 * @param descriptor - The type descriptor in dot notation.
 *
 * @returns The type descriptor in slash notation.
 *
 * @example
 *
 * ```
 * "foo.barBar.BazBaz" => "foo/bar-bar/baz-baz->{BazBaz}"
 * "foo.barBar.BazBaz:parseBazBaz" => "foo/bar-bar/baz-baz->{BazBaz};parseBazBaz"
 * "foo.barBar.BazBaz:{parseBazBaz}" => "foo/bar-bar/baz-baz->{BazBaz};foo/bar-bar/baz-baz->{parseBazBaz}""
 * ```
 */
function normalizePatternInDotNotation(descriptor: string): string {
    const descriptors = descriptor.split(";");
    const dotDescriptor = descriptors[0];

    // Use a regular expression to match the path, name, and factory components of the descriptor.
    const match = dotDescriptor.match(/^(?<path>.*?\.)?(?<name>[\w]+?)(?::(?<factory>{?\w+}?))?$/);
    if (!match) {
        return descriptor;
    }

    const path = match.groups.path;
    const typeName = match.groups.name;

    // Create the full path by replacing dots with slashes and converting camelCase to kebab-case.
    const fullPath = path && `${path}${typeName}`.replaceAll(".", "/").replaceAll(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

    const factoryName = match.groups.factory;
    const isFactoryImported = factoryName?.charAt(0) === "{";
    const typeDescriptor = fullPath ? `${fullPath}->{${typeName}}` : typeName;
    const factoryDescriptor = factoryName ? isFactoryImported && fullPath ? `${fullPath}->${factoryName}` : factoryName : descriptors[1];

    // Join the type and factory descriptors (if any) with semicolons and return as the result.
    const slashDescriptor = [typeDescriptor, factoryDescriptor].filter(x => x).join(";");
    return slashDescriptor;
}
