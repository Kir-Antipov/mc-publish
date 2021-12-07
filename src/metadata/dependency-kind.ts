enum DependencyKind {
    Depends = 1,
    Recommends,
    Includes,
    Suggests,
    Conflicts,
    Breaks,
}

namespace DependencyKind {
    export function getValues(): DependencyKind[] {
        return <DependencyKind[]>Object.values(DependencyKind).filter(x => typeof x === "number");
    }

    export function parse(kindName: string): DependencyKind | undefined {
        if (typeof DependencyKind[kindName] === "number") {
            return DependencyKind[kindName];
        }

        for (const kind of Object.values(DependencyKind)) {
            if (typeof kind === "number" && kindName.localeCompare(DependencyKind[kind], undefined, { sensitivity: "accent" }) === 0) {
                return kind;
            }
        }
        return undefined;
    }

    export function toString(target: DependencyKind): string {
        return DependencyKind[target] ?? target.toString();
    }
}

export default DependencyKind;
