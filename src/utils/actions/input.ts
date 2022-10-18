import process from "process";

interface EnumLike<T = number> {
    [i: string | number | symbol]: T | string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface InputObject extends Record<string, string | InputObject> { }

const undefinedValue = "${undefined}";

export function getInputAsObject(): Record<string, InputObject> {
    const inputs = Object.entries(process.env).filter(([key, _]) => key.startsWith("INPUT_"));
    const input = {};
    for (const [name, value] of inputs) {
        const words = name.substring(6).toLowerCase().split(/[\W_]/).filter(x => x);
        init(input, words, value);
    }
    return input;
}

function init(root: InputObject, path: string[], value: string): void {
    if (value === undefinedValue) {
        return;
    }

    const name = path.reduce((a, b, i) => a + (i === 0 ? b : (b.substring(0, 1).toUpperCase() + b.substring(1))), "");
    root[name] = value;
    if (path.length === 1) {
        return;
    }

    const innerPath = path[0];
    const inner = root[innerPath] ? root[innerPath] : (root[innerPath] = {});
    if (typeof inner === "object") {
        init(inner, path.slice(1), value);
    }
}

export function mapStringInput(value: any, defaultValue = ""): string {
    return mapInput(value, defaultValue, null, "string");
}

export function mapObjectInput(value: any, defaultValue: object = null): object {
    return mapInput(value, defaultValue, null, "object");
}

export function mapNumberInput(value: any, defaultValue = 0): number {
    return mapInput(value, defaultValue, {
        string: x => {
            const num = +x;
            return isNaN(num) ? undefined : num;
        }
    }, "number");
}

export function mapBooleanInput(value: any, defaultValue = false): boolean {
    return mapInput(value, defaultValue, {
        string: x => {
            const strValue = x.trim().toLowerCase();
            return (
                strValue === "true" ? true :
                strValue === "false" ? false :
                undefined
            );
        }
    }, "boolean");
}

function findEnumValueByName<T extends EnumLike<U>, U>(enumClass: T, name: string): U | undefined {
    if (typeof enumClass[+name] === "string") {
        return <U><unknown>+name;
    }

    if (enumClass[name] !== undefined) {
        return <U>enumClass[name];
    }

    const entries = Object.entries(enumClass);
    for (const [key, value] of entries) {
        if (key.localeCompare(name, undefined, { sensitivity: "base" }) === 0) {
            return <U>value;
        }
    }
    for (const [key, value] of entries) {
        if (key.trim().replace(/[-_]/g, "").localeCompare(name.trim().replace(/[-_]/g, ""), undefined, { sensitivity: "base" }) === 0) {
            return <U>value;
        }
    }
    return undefined;
}

export function mapEnumInput<T>(value: any, enumClass: any, defaultValue?: T): T;

export function mapEnumInput<T extends EnumLike<U>, U>(value: any, enumClass: T, defaultValue?: U): U;

export function mapEnumInput<T extends EnumLike<U>, U>(value: any, enumClass: T, defaultValue: U = null): U | null {
    return mapInput(value, defaultValue, {
        string: (x: string) => {
            let result: U = undefined;

            let i = 0;
            while (i < x.length) {
                let separatorIndex = x.indexOf("|", i);
                if (separatorIndex === -1) {
                    separatorIndex = x.length;
                }

                const currentValue = findEnumValueByName<T, U>(enumClass, x.substring(i, separatorIndex));
                if (result === undefined || currentValue !== undefined && typeof currentValue !== "number") {
                    result = currentValue;
                } else {
                    result = <U><unknown>(<number><unknown>result | <number><unknown>currentValue);
                }

                i = separatorIndex + 1;
            }

            return result;
        }
    }, "number");
}

export function mapInput<T>(value: any, fallbackValue?: T, mappers?: Record<string, (x: any) => T | undefined>, valueType?: string): T {
    if (value === undefinedValue || value === undefined || value === null) {
        return fallbackValue;
    }

    valueType ??= typeof fallbackValue;
    if (typeof value === valueType) {
        return value;
    }

    const mapper = mappers?.[typeof value];
    if (mapper) {
        const mappedValue = mapper(value);
        if (typeof mappedValue === valueType) {
            return mappedValue;
        }
    }
    return fallbackValue;
}
