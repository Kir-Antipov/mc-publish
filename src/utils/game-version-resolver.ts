import Version from "./version";

export default abstract class GameVersionResolver<TGameVersion> {
    private readonly _filter: (version: string | Version, versions: TGameVersion[]) => TGameVersion[];

    protected constructor(filter?: (version: string | Version, versions: TGameVersion[]) => TGameVersion[]) {
        this._filter = filter || ((_, x) => x);
    }

    public async resolve(version: string | Version): Promise<TGameVersion[]> {
        return this.filter(version, await this.getCompatibleVersions(version));
    }

    public filter(version: string | Version, versions: TGameVersion[]): TGameVersion[] {
        return this._filter(version, versions);
    }

    public abstract getCompatibleVersions(version: string | Version): Promise<TGameVersion[]>;
}
