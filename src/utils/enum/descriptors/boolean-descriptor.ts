import { EnumDescriptor } from "./enum-descriptor";

/**
 * This descriptor is used to describe a set of flags stored as a `boolean` value.
 */
export class BooleanDescriptor implements EnumDescriptor<boolean> {
    /**
     * @inheritdoc
     */
    get name(): "boolean" {
        return "boolean";
    }

    /**
     * @inheritdoc
     */
    get defaultValue(): boolean {
        return false;
    }

    /**
     * @inheritdoc
     */
    hasFlag(value: boolean, flag: boolean): boolean {
        return !flag || value;
    }

    /**
     * @inheritdoc
     */
    addFlag(value: boolean, flag: boolean): boolean {
        return value || flag;
    }

    /**
     * @inheritdoc
     */
    removeFlag(value: boolean, flag: boolean): boolean {
        return value && !flag;
    }
}
