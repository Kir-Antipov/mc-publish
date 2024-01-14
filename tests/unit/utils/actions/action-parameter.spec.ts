import { normalizeActionParameterName } from "@/utils/actions/action-parameter";

describe("normalizeActionParameterName", () => {
    test("converts parameter name to uppercase and replaces spaces with underscores", () => {
        const name = "test parameter";
        const expected = "TEST_PARAMETER";

        const result = normalizeActionParameterName(name);

        expect(result).toBe(expected);
    });

    test("returns the same string if it's already uppercase and does not contain spaces", () => {
        const name = "TEST_PARAMETER";
        const expected = "TEST_PARAMETER";

        const result = normalizeActionParameterName(name);

        expect(result).toBe(expected);
    });

    test("returns an empty string if the input is an empty string", () => {
        const name = "";
        const expected = "";

        const result = normalizeActionParameterName(name);

        expect(result).toBe(expected);
    });
});
