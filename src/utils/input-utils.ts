import process from "process";

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
    return mapInput(value, defaultValue ?? "");
}

export function mapObjectInput(value: any, defaultValue: object = null): object {
    return mapInput(value, defaultValue ?? null);
}

export function mapNumberInput(value: any, defaultValue = 0): number {
    return mapInput(value, defaultValue ?? 0, {
        string: x => {
            const num = +x;
            return isNaN(num) ? undefined : num;
        }
    });
}

export function mapBooleanInput(value: any, defaultValue = false): boolean {
    return mapInput(value, defaultValue ?? false, {
        string: x => {
            const strValue = x.trim().toLowerCase();
            return (
                strValue === "true" ? true :
                strValue === "false" ? false :
                undefined
            );
        }
    });
}

export function mapInput<T>(value: any, fallbackValue: T, mappers?: Record<string, (x: any) => T | undefined>): T {
    if (value === undefinedValue || value === undefined || value === null) {
        return fallbackValue;
    }

    if (typeof value === typeof fallbackValue) {
        return value;
    }

    const mapper = mappers?.[typeof value];
    if (mapper) {
        const mappedValue = mapper(value);
        if (typeof mappedValue === typeof fallbackValue) {
            return mappedValue;
        }
    }
    return fallbackValue;
}
