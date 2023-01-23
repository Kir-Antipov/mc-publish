import * as semver from "semver";
import {MavenRange} from "./maven-range";

export default class Version {
    public readonly major: number;
    public readonly minor: number;
    public readonly build: number;

    public constructor(major: number, minor: number, build: number);

    public constructor(version: string);

    public constructor(major: number | string, minor?: number, build?: number) {
        if (typeof major === "string") {
            [this.major, this.minor, this.build] = major.split(".").map(x => isNaN(+x) ? 0 : +x).concat(0, 0);
        } else {
            this.major = major || 0;
            this.minor = minor || 0;
            this.build = build || 0;
        }
    }

    public equals(version: unknown): boolean {
        if (version instanceof Version) {
            return this.major === version.major && this.minor === version.minor && this.build === version.build;
        }
        return typeof version === "string" && this.equals(new Version(version));
    }

    public toString(): string {
        return `${this.major}.${this.minor}.${this.build}`;
    }

    public matches(range: string | Version): boolean {
        if (range instanceof Version) {
            return true;
        }
        return Version.matches(this.toString(), range);
    }

    public static fromName(name: string): string {
        const match = name.match(/[a-z]{0,2}\d+\.\d+.*/i);
        return match ? match[0] : name;
    }

    public static matches(version: string, range: string): boolean {
        let semverRange;
        if (!semver.validRange(range)) {
            // Convert the Maven version range to a semantic version range
            semverRange = MavenRange.toSemver(range);
        } else {
            semverRange = range;
        }
        // Use semver to check if the version satisfies the range
        return semver.satisfies(version, semverRange);
    }
}
