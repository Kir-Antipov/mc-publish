import { SemVer, coerce, parse as parseSemVer } from "semver";

/**
 * Represents a version number, which is a set of three non-negative integers: major, minor, and patch.
 *
 * This interface provides methods to compare versions and format them into a string representation.
 */
export interface Version {
    /**
     * The major version number.
     */
    get major(): number;

    /**
     * The minor version number.
     */
    get minor(): number;

    /**
     * The patch version number.
     */
    get patch(): number;

    /**
     * Compares the current version to another one.
     *
     * @param other - The version to compare with.
     *
     * @returns A number indicating the comparison result:
     *
     * - 0 if both versions are equal.
     * - A positive number if the current version is greater.
     * - A negative number if the other version is greater.
     */
    compare(other?: string | Version): number;

    /**
     * Formats the version into a string representation.
     *
     * @returns The string representation of the version.
     */
    format(): string;

    /**
     * Returns the original string representation of the version.
     *
     * @returns The original string representation of the version.
     */
    toString(): string;
}

/**
 * Parses a version string into a {@link Version} instance.
 *
 * @param version - The version string to parse.
 *
 * @returns A {@link Version} instance if parsing is successful, or `undefined` if it fails.
 */
export function parseVersion(version: string): Version | undefined {
    return SemVerVersion.parse(version);
}

/**
 * Regular expression for matching semver-like tags in version strings.
 */
const SEMVER_TAG_REGEX = /[a-z]{0,2}((\d+\.\d+)(\.\d+)?(.*))/i;

/**
 * Represents a version number compliant with the Semantic Versioning specification.
 */
class SemVerVersion implements Version {
    /**
     * The SemVer object representing the parsed semantic version.
     */
    private readonly _semver: SemVer;

    /**
     * The original string representation of the version.
     */
    private readonly _version: string;

    /**
     * Constructs a new {@link SemVerVersion} instance.
     *
     * @param semver - The SemVer object representing the parsed semantic version.
     * @param version - The original string representation of the version.
     */
    constructor(semver: SemVer, version?: string) {
        this._semver = semver;
        this._version = version ?? semver.format();
    }

    /**
     * Parses a version string into a {@link SemVerVersion} instance.
     *
     * @param version - The version string to parse.
     *
     * @returns A {@link SemVerVersion} instance if parsing is successful, or `undefined` if it fails.
     */
    static parse(version: string): SemVerVersion | undefined {
        const semver = parseSemVer(version);
        if (semver) {
            return new SemVerVersion(semver, version);
        }

        const match = version.match(SEMVER_TAG_REGEX);
        if (match) {
            const numericVersion = match[3] ? match[1] : `${match[2]}.0${match[4]}`;
            const parsedSemVer = parseSemVer(numericVersion) || coerce(numericVersion);
            return new SemVerVersion(parsedSemVer, match[0]);
        }

        return undefined;
    }

    /**
     * @inheritdoc
     */
    get major(): number {
        return this._semver.major;
    }

    /**
     * @inheritdoc
     */
    get minor(): number {
        return this._semver.minor;
    }

    /**
     * @inheritdoc
     */
    get patch(): number {
        return this._semver.patch;
    }

    /**
     * @inheritdoc
     */
    compare(other?: string | Version): number {
        if (other === null || other === undefined) {
            return 1;
        }

        if (typeof other === "string") {
            other = SemVerVersion.parse(other);
        }

        return other instanceof SemVerVersion ? this._semver.compare(other._semver) : -other.compare(this);
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
        return this._version;
    }
}
