import GameVersionResolver from "../versioning/game-version-resolver";
import { getCompatibleBuilds, MinecraftVersion } from ".";
import Version from "../versioning/version";

export default class MinecraftVersionResolver extends GameVersionResolver<MinecraftVersion> {
    public static readonly exact = new MinecraftVersionResolver((n, v) => [v.find(x => x.version.equals(n))].filter(x => x));
    public static readonly latest = new MinecraftVersionResolver((_, v) => v.find(x => x.isRelease) ? [v.find(x => x.isRelease)] : v.length ? [v[0]] : []);
    public static readonly all = new MinecraftVersionResolver((_, v) => v);
    public static readonly releases = new MinecraftVersionResolver((n, v) => v.filter(x => x.isRelease && x.version.matches(n)));
    public static readonly releasesIfAny = new MinecraftVersionResolver((n, v) => v.find(x => x.isRelease && x.version.matches(n)) ? v.filter(x => x.isRelease && x.version.matches(n)) : v);

    public static byName(name: string): MinecraftVersionResolver | null {
        for (const [key, value] of Object.entries(MinecraftVersionResolver)) {
            if (value instanceof MinecraftVersionResolver && key.localeCompare(name, undefined, { sensitivity: "accent" }) === 0) {
                return value;
            }
        }
        return null;
    }

    public getCompatibleVersions(version: string | Version): Promise<MinecraftVersion[]> {
        return getCompatibleBuilds(version);
    }
}
