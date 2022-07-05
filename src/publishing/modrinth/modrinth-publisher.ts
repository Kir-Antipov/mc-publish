import { createVersion, getProject, getVersions, modifyVersion } from "../../utils/modrinth-utils";
import { File } from "../../utils/file";
import ModPublisher from "../mod-publisher";
import PublisherTarget from "../publisher-target";
import Dependency from "../../metadata/dependency";
import DependencyKind from "../../metadata/dependency-kind";
import { mapBooleanInput, mapEnumInput } from "../../utils/input-utils";
import LoggingStopwatch from "../../utils/logging-stopwatch";

enum UnfeatureMode {
    None = 0,

    VersionSubset = 1,
    VersionIntersection = 2,
    VersionAny = 4,

    LoaderSubset = 8,
    LoaderIntersection = 16,
    LoaderAny = 32,

    Subset = VersionSubset | LoaderSubset,
    Intersection = VersionIntersection | LoaderIntersection,
    Any = VersionAny | LoaderAny,
}

function hasFlag(unfeatureMode: UnfeatureMode, flag: UnfeatureMode): boolean {
    return (unfeatureMode & flag) === flag;
}

const modrinthDependencyKinds = new Map([
    [DependencyKind.Depends, "required"],
    [DependencyKind.Recommends, "optional"],
    [DependencyKind.Suggests, "optional"],
    [DependencyKind.Includes, "embedded"],
    [DependencyKind.Breaks, "incompatible"],
]);

export default class ModrinthPublisher extends ModPublisher {
    public get target(): PublisherTarget {
        return PublisherTarget.Modrinth;
    }

    protected async publishMod(id: string, token: string, name: string, version: string, channel: string, loaders: string[], gameVersions: string[], _java: string[], changelog: string, files: File[], dependencies: Dependency[], options: Record<string, unknown>): Promise<void> {
        const featured = mapBooleanInput(options.featured, true);
        const unfeatureMode = mapEnumInput(options.unfeatureMode, UnfeatureMode, featured ? UnfeatureMode.Subset : UnfeatureMode.None);
        const projects = (await Promise.all(dependencies
            .filter((x, _, self) => (x.kind !== DependencyKind.Suggests && x.kind !== DependencyKind.Includes) || !self.find(y => y.id === x.id && y.kind !== DependencyKind.Suggests && y.kind !== DependencyKind.Includes))
            .map(async x => ({
                project_id: (await getProject(x.getProjectSlug(this.target)))?.id,
                dependency_type: modrinthDependencyKinds.get(x.kind)
            }))))
            .filter(x => x.project_id && x.dependency_type);

        if (unfeatureMode !== UnfeatureMode.None) {
            await this.unfeatureOlderVersions(id, token, unfeatureMode, loaders, gameVersions);
        }

        const data = {
            name: name || version,
            version_number: version,
            changelog,
            game_versions: gameVersions,
            version_type: channel,
            loaders,
            featured,
            dependencies: projects
        };
        await createVersion(id, data, files, token);
    }

    private async unfeatureOlderVersions(id: string, token: string, unfeatureMode: UnfeatureMode, loaders: string[], gameVersions: string[]): Promise<void> {
        const unfeaturedVersions = new Array<string>();
        const stopwatch = LoggingStopwatch.startNew(this.logger, "Unfeaturing older Modrinth versions...", ms => `Successfully unfeatured: ${unfeaturedVersions.join(", ")} (in ${ms} ms)`);

        const versionSubset = hasFlag(unfeatureMode, UnfeatureMode.VersionSubset);
        const loaderSubset = hasFlag(unfeatureMode, UnfeatureMode.LoaderSubset);
        const olderVersions = await getVersions(id, hasFlag(unfeatureMode, UnfeatureMode.LoaderAny) ? null : loaders, hasFlag(unfeatureMode, UnfeatureMode.VersionAny) ? null : gameVersions, true, token);
        for (const olderVersion of olderVersions) {
            if (loaderSubset && !olderVersion.loaders.every(x => loaders.includes(x))) {
                continue;
            }

            if (versionSubset && !olderVersion.game_versions.every(x => gameVersions.includes(x))) {
                continue;
            }

            if (await modifyVersion(olderVersion.id, { featured: false }, token)) {
                unfeaturedVersions.push(olderVersion.id);
            } else {
                this.logger.warn(`Cannot unfeature version ${olderVersion.id}`);
            }
        }

        if (unfeaturedVersions.length) {
            stopwatch.stop();
        } else {
            this.logger.info("No versions to unfeature were found");
        }
    }
}