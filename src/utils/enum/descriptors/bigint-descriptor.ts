import { EnumDescriptor } from "./enum-descriptor";

/**
 * This descriptor is used to describe a set of flags stored as a `bigint` value.
 */
export class BigIntDescriptor implements EnumDescriptor<bigint> {
    /**
     * @inheritdoc
     */
    get name(): "bigint" {
        return "bigint";
    }

    /**
     * @inheritdoc
     */
    get defaultValue(): bigint {
        return 0n;
    }

    /**
     * @inheritdoc
     */
    hasFlag(value: bigint, flag: bigint): boolean {
        return (value & flag) === flag;
    }

    /**
     * @inheritdoc
     */
    addFlag(value: bigint, flag: bigint): bigint {
        return value | flag;
    }

    /**
     * @inheritdoc
     */
    removeFlag(value: bigint, flag: bigint): bigint {
        return value & ~flag;
    }
}
