import { EnumDescriptor } from "./enum-descriptor";

/**
 * This descriptor is used to describe a set of flags stored as a `number` value.
 */
export class NumberDescriptor implements EnumDescriptor<number> {
    /**
     * @inheritdoc
     */
    get name(): "number" {
        return "number";
    }

    /**
     * @inheritdoc
     */
    get defaultValue(): number {
        return 0;
    }

    /**
     * @inheritdoc
     */
    hasFlag(value: number, flag: number): boolean {
        return (value & flag) === flag;
    }

    /**
     * @inheritdoc
     */
    addFlag(value: number, flag: number): number {
        return value | flag;
    }

    /**
     * @inheritdoc
     */
    removeFlag(value: number, flag: number): number {
        return value & ~flag;
    }
}
