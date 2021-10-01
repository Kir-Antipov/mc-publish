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
}
