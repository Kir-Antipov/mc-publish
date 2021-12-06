export function parseVersionFromName(name: string): string {
    const match = name.match(/[a-z]{0,2}\d+\.\d+.*/i);
    return match ? match[0] : name;
}

export function parseVersionTypeFromName(name: string): "alpha" | "beta" | "release" {
    if (name.match(/[+-_]alpha/i)) {
        return "alpha";
    } else if (name.match(/[+-_]beta/i)) {
        return "beta";
    } else {
        return "release";
    }
}
