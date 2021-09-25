import process from "process";

export function setupInput(input: Record<string, any>): void {
    for (const [key, value] of Object.entries(input)) {
        process.env[`INPUT_${key.replace(/ /g, "_").toUpperCase()}`] = value.toString();
    }
}

export function unsetInput(): void {
    for (const key of Object.keys(process.env)) {
        if (key.startsWith("INPUT_")) {
            delete process.env[key];
        }
    }
}
