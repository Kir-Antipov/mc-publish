enum VersionType {
    Alpha = "alpha",
    Beta = "beta",
    Release = "release"
}

namespace VersionType {
    export function fromName(name: string): VersionType {
        if (name.match(/[+-_]alpha/i)) {
            return VersionType.Alpha;
        } else if (name.match(/[+-_]beta/i)) {
            return VersionType.Beta;
        } else {
            return VersionType.Release;
        }
    }
}

export default VersionType;
