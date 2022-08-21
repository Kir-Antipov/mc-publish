import fs from "fs";
import yaml from "yaml";

interface ActionInput {
    description?: string;
    required?: boolean;
    default?: string;
    unique?: boolean;
    publisher?: boolean;
}

export default function processActionYamlTemplate() {
    processActionTemplate("./action.template.yml", "./action.yml");
}

function processActionTemplate(pathIn: string, pathOut: string) {
    const content = fs.readFileSync(pathIn, "utf8");
    const action = yaml.parse(content) as { inputs?: Record<string, ActionInput> };
    if (!action.inputs) {
        action.inputs = {};
    }

    action.inputs = processInputs(action.inputs);

    const updatedContent = yaml.stringify(action);
    fs.writeFileSync(pathOut, updatedContent, "utf8");
}

function processInputs(inputs: Record<string, ActionInput>) {
    const publishers = Object.entries(inputs).filter(([_, input]) => input.publisher).map(([key, _]) => key);
    const nestedInputs = Object.entries(inputs).filter(([key, input]) => !input.publisher && !input.unique && !publishers.find(p => key.startsWith(p)));

    for (const [key, input] of Object.entries(inputs)) {
        if (input.publisher) {
            delete inputs[key];
        }
        delete input.unique;

        if (typeof input.required !== "boolean") {
            input.required = false;
        }
        if (input.default === undefined) {
            input.default = "${undefined}";
        }
    }

    for (const publisher of publishers) {
        for (const [name, input] of nestedInputs) {
            inputs[`${publisher}-${name}`] = {
                ...input,
                default: "${undefined}"
            };
        }
    }

    return inputs;
}
