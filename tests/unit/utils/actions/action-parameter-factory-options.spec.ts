import { ActionParameterFactoryOptions } from "@/utils/actions/action-parameter-factory-options";

describe("ActionParameterFactoryOptions", () => {
    describe("parse", () => {
        test("parses all its own formatted values", () => {
            for (const value of ActionParameterFactoryOptions.values()) {
                expect(ActionParameterFactoryOptions.parse(ActionParameterFactoryOptions.format(value))).toBe(value);
            }
        });

        test("parses all friendly names of its own values", () => {
            for (const value of ActionParameterFactoryOptions.values()) {
                expect(ActionParameterFactoryOptions.parse(ActionParameterFactoryOptions.friendlyNameOf(value))).toBe(value);
            }
        });

        test("parses all its own formatted values in lowercase", () => {
            for (const value of ActionParameterFactoryOptions.values()) {
                expect(ActionParameterFactoryOptions.parse(ActionParameterFactoryOptions.format(value).toLowerCase())).toBe(value);
            }
        });

        test("parses all its own formatted values in UPPERCASE", () => {
            for (const value of ActionParameterFactoryOptions.values()) {
                expect(ActionParameterFactoryOptions.parse(ActionParameterFactoryOptions.format(value).toUpperCase())).toBe(value);
            }
        });
    });
});
