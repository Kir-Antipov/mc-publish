import { split } from "@/utils/string-utils";
import { ENUM_SEPARATORS, DEFAULT_ENUM_SEPARATOR } from "../enum-separators";
import { EnumDescriptor } from "./enum-descriptor";

/**
 * This descriptor is used to describe a set of flags stored as a `string` value.
 *
 * @remarks
 *
 * It's super inefficient, when it comes to flags, because the whole concept
 * of string flags just seems too shady to me to optimize for these scenarios.
 * So, string enums are ok, but string enums with flags are not recommended.
 */
export class StringDescriptor implements EnumDescriptor<string> {
    /**
     * @inheritdoc
     */
    get name(): "string" {
        return "string";
    }

    /**
     * @inheritdoc
     */
    get defaultValue(): string {
        return "";
    }

    /**
     * @inheritdoc
     */
    hasFlag(value: string, flag: string): boolean {
        if (flag === this.defaultValue || flag === value) {
            return true;
        }

        if (!value) {
            return false;
        }

        const flags = split(value, ENUM_SEPARATORS, { trimEntries: true, removeEmptyEntries: true });
        return flags.includes(flag);
    }

    /**
     * @inheritdoc
     */
    addFlag(value: string, flag: string): string {
        value = this.removeFlag(value, flag);
        return value ? `${value}${DEFAULT_ENUM_SEPARATOR} ${flag}` : value;
    }

    /**
     * @inheritdoc
     */
    removeFlag(value: string, flag: string): string {
        if (value === this.defaultValue || flag === this.defaultValue) {
            return value;
        }

        if (value === flag) {
            return this.defaultValue;
        }

        const flags = split(value, ENUM_SEPARATORS, { trimEntries: true, removeEmptyEntries: true });
        return flags.filter(x => x !== flag).join(`${DEFAULT_ENUM_SEPARATOR} `);
    }
}
