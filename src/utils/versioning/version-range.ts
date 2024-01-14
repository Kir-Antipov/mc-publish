import { asArray } from "@/utils/collections";
import { Range, SemVer } from "semver";
import { Version, parseVersion } from "./version";

/**
 * Represents a version range, which is a set of constraints on a version number.
 *
 * This interface provides methods to check if a version is included in the range and
 * to format the range into a string representation.
 */
export interface VersionRange {
    /**
     * Determines if the given version is included in the range.
     *
     * @param version - The version to check.
     *
     * @returns `true` if the version is included in the range; otherwise, `false`.
     */
    includes(version: string | Version): boolean;

    /**
     * Formats the range into a string representation.
     *
     * @returns The formatted string representation of the range.
     */
    format(): string;

    /**
     * Returns the original string representation of the range.
     *
     * @returns The original string representation of the range.
     */
    toString(): string;
}

/**
 * Parses a string or a collection of strings and returns into a version range.
 *
 * @param range - The string or a collection of strings to be parsed.
 *
 * @returns The parsed {@link VersionRange} instance, or `undefined` if the input is invalid.
 */
export function parseVersionRange(range: string | Iterable<string>): VersionRange | undefined {
    return SemVerVersionRange.parse(range);
}

/**
 * Returns a version range that includes any version.
 *
 * @param range - An optional string representing the range.
 *
 * @returns The version range that includes any version.
 */
export function anyVersionRange(range?: string): VersionRange {
    return SemVerVersionRange.any(range);
}

/**
 * Returns a version range that includes no versions.
 *
 * @param range - An optional string representing the range.
 *
 * @returns The version range that includes no versions.
 */
export function noneVersionRange(range?: string): VersionRange {
    return SemVerVersionRange.none(range);
}

/**
 * Regular expression for matching interval-like expressions in version range strings.
 */
const INTERVAL_LIKE_REGEX = /(?:\[|\()[^\])]+(?:\]|\))/g;

/**
 * Converts a mixed version range string into a semver-compatible version range string.
 *
 * @param range - The mixed version range string.
 *
 * @returns The semver-compatible version range string.
 */
function mixedToSemver(range: string): string {
    return range.replace(INTERVAL_LIKE_REGEX, intervalToSemver);
}

/**
 * Regular expression for matching interval expressions in version range strings.
 */
const INTERVAL_REGEX = /(?<from_bracket>\[|\()\s*(?<from>[^,\s]+)?\s*(?<separator>,)?\s*(?<to>[^,\s\])]+)?\s*(?<to_bracket>\]|\))/;

/**
 * Converts an interval expression into a semver-compatible range expression.
 *
 * @param range - The interval expression.
 *
 * @returns The semver-compatible range expression.
 */
function intervalToSemver(range: string): string {
    const match = range.match(INTERVAL_REGEX);
    if (!match) {
        return "";
    }

    const fromOperator = match.groups.from_bracket === "[" ? ">=" : ">";
    const from = match.groups.from;
    const separator = match.groups.separator;
    const toOperator = match.groups.to_bracket === "]" ? "<=" : "<";
    const to = match.groups.to;
    if (!from && !to) {
        return "*";
    }

    if (!from) {
        return `${toOperator}${to}`;
    }

    if (!separator) {
        return from;
    }

    if (!to) {
        return `${fromOperator}${from}`;
    }

    return `${fromOperator}${from} ${toOperator}${to}`;
}

/**
 * Regular expression for matching semver-like tags in version strings with optional patch version.
 */
const SEMVER_OPTIONAL_PATCH_REGEX = /((?:\d+|[Xx*])(?:\.\d+|\.[Xx*]))(\.\d+|\.[Xx*])?([\w\-.+]*)/g;

/**
 * Ensures that a semver string has a patch version, adding ".0" if it is missing.
 *
 * @param semver - The semver string.
 *
 * @returns The semver string with a patch version.
 */
function fixMissingPatchVersion(semver: string): string {
    return semver.replace(SEMVER_OPTIONAL_PATCH_REGEX, (match, before, patch, after) => {
        return patch ? match : `${before}.0${after}`;
    });
}

/**
 * Represents a version range compliant with the Semantic Versioning specification.
 */
class SemVerVersionRange implements VersionRange {
    /**
     * Represents a range that includes any version.
     */
    private static readonly ANY = new SemVerVersionRange(new Range("*"), "*");

    /**
     * Represents a range that includes no versions.
     */
    private static readonly NONE = new SemVerVersionRange(new Range("<0.0.0"));

    /**
     * The semver-compliant range object.
     */
    private readonly _semver: Range;

    /**
     * The original version range string.
     */
    private readonly _range: string;

    /**
     * Constructs a new {@link SemVerVersionRange} instance.
     *
     * @param semver - The semver-compliant range object.
     * @param range - The original version range string.
     */
    constructor(semver: Range, range?: string) {
        this._semver = semver;
        this._range = range ?? semver.format();
    }

    /**
     * Returns a version range that includes any version.
     *
     * @param range - An optional string representing the range.
     *
     * @returns The version range that includes any version.
     */
    static any(range?: string): SemVerVersionRange {
        if (!range || range === SemVerVersionRange.ANY._range) {
            return SemVerVersionRange.ANY;
        }

        return new SemVerVersionRange(SemVerVersionRange.ANY._semver, range);
    }

    /**
     * Returns a version range that includes no versions.
     *
     * @param range - An optional string representing the range.
     *
     * @returns The version range that includes no versions.
     */
    static none(range?: string): SemVerVersionRange {
        if (!range || range === SemVerVersionRange.NONE._range) {
            return SemVerVersionRange.NONE;
        }

        return new SemVerVersionRange(SemVerVersionRange.NONE._semver, range);
    }

    /**
     * Parses a string or a collection of strings and returns into a version range.
     *
     * @param range - The string or a collection of strings to be parsed.
     *
     * @returns The parsed {@link SemVerVersionRange} instance, or `undefined` if the input is invalid.
     */
    static parse(range: string | Iterable<string>): SemVerVersionRange | undefined {
        const ranges = (typeof range === "string" ? [range] : asArray(range)).map(x => x.trim());
        const mixedRange = ranges.join(" || ");
        const semverRange = ranges.map(mixedToSemver).map(fixMissingPatchVersion).join(" || ");

        try {
            const parsedSemverRange = new Range(semverRange, { includePrerelease: true });
            return new SemVerVersionRange(parsedSemverRange, mixedRange);
        } catch {
            return undefined;
        }
    }

    /**
     * @inheritdoc
     */
    includes(version: string | Version): boolean {
        if (typeof version === "string") {
            version = parseVersion(version);
        }

        const internalSemVer = (version as { _semver?: SemVer })?._semver;
        return this._semver.test(internalSemVer || version.format());
    }

    /**
     * @inheritdoc
     */
    format(): string {
        return this._semver.format();
    }

    /**
     * @inheritdoc
     */
    toString(): string {
        return this._range;
    }
}
