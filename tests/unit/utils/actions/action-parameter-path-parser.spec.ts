import { ActionMetadata } from "@/utils/actions";
import { IDENTITY_ACTION_PARAMETER_PATH_PARSER, SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER, SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER } from "@/utils/actions/action-parameter-path-parser";

describe("IDENTITY_ACTION_PARAMETER_PATH_PARSER", () => {
    test("returns the parameter name as a single-element array", () => {
        const name = "param1";

        const path = IDENTITY_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual([name]);
    });

    test("returns an array with an empty string if the parameter name is an empty string", () => {
        const name = "";

        const path = IDENTITY_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual([name]);
    });

    test("returns an array with an empty string if the parameter name is null", () => {
        const name = null;

        const path = SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual([""]);
    });

    test("returns an array with an empty string if the parameter name is undefined", () => {
        const name = undefined;

        const path = SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual([""]);
    });
});

describe("SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER", () => {
    test("splits the parameter name by non-letter and non-number characters and converts each word to lowercase", () => {
        const name = "param1-param2_param3 param4";

        const path = SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual(["param1", "param2", "param3", "param4"]);
    });

    test("returns an array with an empty string if the parameter name is an empty string", () => {
        const name = "";

        const path = SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual([""]);
    });

    test("returns an array with an empty string if the parameter name is null", () => {
        const name = null;

        const path = SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual([""]);
    });

    test("returns an array with an empty string if the parameter name is undefined", () => {
        const name = undefined;

        const path = SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual([""]);
    });
});

describe("SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER", () => {
    test("splits the parameter name by non-letter and non-number characters, converts each word to lowercase, and groups the parameter based on the input/output group specified in the metadata object", () => {
        const name = "foo-qux-waldo";
        const parameter = { description: "This is foo-qux-waldo", type: "string" };
        const metadata = {
            inputs: { "foo-qux-waldo": parameter },
            groups: { input: { foo: {} } },
        } as unknown as ActionMetadata;

        const path = SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER(name, parameter, metadata);

        expect(path).toEqual(["foo", "quxWaldo"]);
    });

    test("returns the same path as SPLIT_BY_WORDS_ACTION_PARAMETER_PATH_PARSER if the parameter or metadata is not provided", () => {
        const name = "foo-qux-waldo";

        const path = SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual(["foo", "qux", "waldo"]);
    });

    test("returns a single word path if the parameter is not a part of a group", () => {
        const name = "foo-qux-waldo";
        const parameter = { description: "This is foo-qux-waldo", type: "string" };
        const metadata = {
            inputs: { "bar-baz": parameter },
            groups: { input: { foo: {} } },
        } as unknown as ActionMetadata;

        const path = SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER(name, parameter, metadata);

        expect(path).toEqual(["fooQuxWaldo"]);
    });

    test("returns an array with an empty string if the parameter name is an empty string", () => {
        const name = "";

        const path = SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual([""]);
    });

    test("returns an array with an empty string if the parameter name is null", () => {
        const name = null;

        const path = SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual([""]);
    });

    test("returns an array with an empty string if the parameter name is undefined", () => {
        const name = undefined;

        const path = SPLIT_BY_WORDS_AND_GROUP_ACTION_PARAMETER_PATH_PARSER(name);

        expect(path).toEqual([""]);
    });
});
