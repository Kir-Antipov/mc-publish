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
