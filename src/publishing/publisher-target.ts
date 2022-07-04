enum PublisherTarget {
    CurseForge,
    Modrinth,
    GitHub,
}

namespace PublisherTarget {
    export function getValues(): PublisherTarget[] {
        return <PublisherTarget[]>Object.values(PublisherTarget).filter(x => !isNaN(+x));
    }

    export function toString(target: PublisherTarget): string {
        return PublisherTarget[target] || target.toString();
    }
}

export default PublisherTarget;
