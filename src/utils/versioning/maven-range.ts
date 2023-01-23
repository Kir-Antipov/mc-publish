import Version from "./version";

export abstract class Bound {
    public readonly value: Version;
    public readonly inclusive: boolean;

    protected constructor(value: string, inclusive: boolean) {
        this.value = new Version(value);
        this.inclusive = inclusive;
    }

    public abstract toSemver(): string;

    public abstract toString(): string;
}

export class LowerBound extends Bound {
    public constructor(value: string, inclusive: boolean) {
        super(value, inclusive);
    }

    toSemver(): string {
        if (this.value.major === 0 && this.value.minor === 0 && this.value.build === 0) {
            return "*";
        }
        return `${this.inclusive ? ">=" : ">"}${this.value.toString()}`;
    }

    toString(): string {
        return `${this.inclusive ? "[" : "("}${this.value.toString()}`;
    }
}

export class UpperBound extends Bound {
    public constructor(value: string, inclusive: boolean) {
        super(value, inclusive);
    }

    toSemver(): string {
        if (this.value.major === 0 && this.value.minor === 0 && this.value.build === 0) {
            return "*";
        }
        return `${this.inclusive ? "<=" : "<"}${this.value.toString()}`;
    }

    toString(): string {
        return `${this.value.toString()}${this.inclusive ? "]" : ")"}`;
    }
}

export abstract class MavenRange {

    public abstract toSemver(): string;

    public abstract toString(): string;

    public static parse(range: string): MavenRange {
        const parts = range.split(",");
        const bounds: Bound[] = [];
        for (let part of parts) {
            const inclusiveUpper = part.endsWith("]");
            const exclusiveUpper = part.endsWith(")") || part.endsWith("[");
            const inclusiveLower = part.startsWith("[");
            const exclusiveLower = part.startsWith("(") || part.startsWith("]");
            const lowerBound = inclusiveLower || exclusiveLower;
            const upperBound = inclusiveUpper || exclusiveUpper;
            if (lowerBound) {
                part = part.substring(1);
            }
            if (upperBound) {
                part = part.substring(0, part.length - 1);
            }
            if (lowerBound) {
                bounds.push(new LowerBound(part, inclusiveLower));
            }
            if (upperBound) {
                bounds.push(new UpperBound(part, inclusiveUpper));
            }
            if (!lowerBound && !upperBound) {
                bounds.push(new LowerBound(part, true));
                bounds.push(new UpperBound(part, true));
            }
        }
        const ranges: MavenRange[] = [];
        for (let i = 0; i < bounds.length; i++) {
            const bound = bounds[i];
            if (bound instanceof LowerBound) {
                i++;
                if (i >= bounds.length) {
                    throw new Error("Invalid range: " + range);
                }
                const nextBound = bounds[i];
                if (!(nextBound instanceof UpperBound)) {
                    throw new Error("Invalid range: " + range);
                }
                ranges.push(new SimpleRange(bound, nextBound));
            } else {
                throw new Error("Invalid range: " + range);
            }
        }
        return ranges.length === 1 ? ranges[0] : new CompositeRange(ranges);
    }

    public static toSemver(range: string): string {
        return MavenRange.parse(range).toSemver();
    }

    public static toString(range: string): string {
        return MavenRange.parse(range).toString();
    }
}

export class SimpleRange extends MavenRange {
    public readonly lowerBound: LowerBound;
    public readonly upperBound: UpperBound;

    public constructor(lowerBound: LowerBound, upperBound: UpperBound) {
        super();
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }

    toSemver(): string {
        if (this.lowerBound.value === this.upperBound.value) {
            return this.lowerBound.value.toString();
        }
        return `${this.lowerBound.toSemver()} ${this.upperBound.toSemver()}`;
    }

    toString(): string {
        if (this.lowerBound.value === this.upperBound.value) {
            return `${this.lowerBound.inclusive ? "[" : "("}${this.lowerBound.value}${this.upperBound.inclusive ? "]" : ")"}`;
        }
        return `${this.lowerBound.toString()},${this.upperBound.toString()}`;
    }
}

export class CompositeRange extends MavenRange {
    public readonly ranges: MavenRange[];

    public constructor(ranges: MavenRange[]) {
        super();
        this.ranges = ranges;
    }

    toSemver(): string {
        return this.ranges.map(r => r.toSemver()).join(" || ");
    }

    toString(): string {
        return this.ranges.map(r => r.toString()).join(",");
    }
}
