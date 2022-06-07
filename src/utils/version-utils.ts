export enum VersionType {
    Alpha = "alpha",
    Beta = "beta",
    Release = "release",
}

export function parseVersionFromName(name: string): string {
    const match = name.match(/[a-z]{0,2}\d+\.\d+.*/i);
    return match ? match[0] : name;
}

export function parseVersionTypeFromName(name: string): VersionType {
    if (name.match(/[+-_]alpha/i)) {
        return VersionType.Alpha;
    } else if (name.match(/[+-_]beta/i)) {
        return VersionType.Beta;
    } else {
        return VersionType.Release;
    }
}
