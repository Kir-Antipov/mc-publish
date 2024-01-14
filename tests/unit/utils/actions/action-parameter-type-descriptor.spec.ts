import { QueryString } from "@/utils/net/query-string";
import { parseActionParameterTypeDescriptor } from "@/utils/actions/action-parameter-type-descriptor";

describe("parseActionParameterTypeDescriptor", () => {
    test("returns undefined for empty input", () => {
        expect(parseActionParameterTypeDescriptor("")).toBeUndefined();
    });

    test("parses a global type", () => {
        const descriptor = "string";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: undefined,
            name: "string",
            isDefault: true,
            isArray: false,
            factory: undefined,
            options: undefined,
        });
    });

    test("parses a global type with options", () => {
        const descriptor = "string?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: undefined,
            name: "string",
            isDefault: true,
            isArray: false,
            factory: undefined,
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });

    test("parses a global array type", () => {
        const descriptor = "string[]";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: undefined,
            name: "string",
            isDefault: true,
            isArray: true,
            factory: undefined,
            options: undefined,
        });
    });

    test("parses a global array type with options", () => {
        const descriptor = "string[]?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: undefined,
            name: "string",
            isDefault: true,
            isArray: true,
            factory: undefined,
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });

    test("parses a global type with factory", () => {
        const descriptor = "string;qux/bar-baz->parseBaz";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: undefined,
            name: "string",
            isDefault: true,
            isArray: false,
            factory: {
                module: "qux/bar-baz",
                name: "parseBaz",
                isDefault: true,
            },
            options: undefined,
        });
    });

    test("parses a global type with factory and options", () => {
        const descriptor = "string;qux/bar-baz->parseBaz?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: undefined,
            name: "string",
            isDefault: true,
            isArray: false,
            factory: {
                module: "qux/bar-baz",
                name: "parseBaz",
                isDefault: true,
            },
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });

    test("parses a global array type with factory", () => {
        const descriptor = "string[];qux/bar-baz->parseBaz";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: undefined,
            name: "string",
            isDefault: true,
            isArray: true,
            factory: {
                module: "qux/bar-baz",
                name: "parseBaz",
                isDefault: true,
            },
            options: undefined,
        });
    });

    test("parses a global array type with factory and options", () => {
        const descriptor = "string[];qux/bar-baz->parseBaz?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: undefined,
            name: "string",
            isDefault: true,
            isArray: true,
            factory: {
                module: "qux/bar-baz",
                name: "parseBaz",
                isDefault: true,
            },
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });

    test("parses a default import", () => {
        const descriptor = "foo/bar-baz->Baz";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "Baz",
            isDefault: true,
            isArray: false,
            factory: undefined,
            options: undefined,
        });
    });

    test("parses a named import without options", () => {
        const descriptor = "foo/bar-baz->{Baz}";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "Baz",
            isDefault: false,
            isArray: false,
            factory: undefined,
            options: undefined,
        });
    });

    test("parses a default import with options", () => {
        const descriptor = "foo/bar-baz->Baz?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "Baz",
            isDefault: true,
            isArray: false,
            factory: undefined,
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });

    test("parses a named import with options", () => {
        const descriptor = "foo/bar-baz->{Baz}?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "Baz",
            isDefault: false,
            isArray: false,
            factory: undefined,
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });

    test("parses a default import with a factory", () => {
        const descriptor = "foo/bar-baz->Baz;qux/bar-baz->parseBaz";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "Baz",
            isDefault: true,
            isArray: false,
            factory: {
                module: "qux/bar-baz",
                name: "parseBaz",
                isDefault: true,
            },
            options: undefined,
        });
    });

    test("parses a named import with a factory", () => {
        const descriptor = "foo/bar-baz->{Baz};qux/bar-baz->{parseBaz}";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "Baz",
            isDefault: false,
            isArray: false,
            factory: {
                module: "qux/bar-baz",
                name: "parseBaz",
                isDefault: false,
            },
            options: undefined,
        });
    });

    test("parses a default import with a factory and options", () => {
        const descriptor = "foo/bar-baz->Baz;qux/bar-baz->parseBaz?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "Baz",
            isDefault: true,
            isArray: false,
            factory: {
                module: "qux/bar-baz",
                name: "parseBaz",
                isDefault: true,
            },
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });

    test("parses a named import with a factory and options", () => {
        const descriptor = "foo/bar-baz->{Baz};qux/bar-baz->{parseBaz}?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "Baz",
            isDefault: false,
            isArray: false,
            factory: {
                module: "qux/bar-baz",
                name: "parseBaz",
                isDefault: false,
            },
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });

    test("parses a default import as an array type with a factory and options", () => {
        const descriptor = "foo/bar-baz->Baz[];qux/bar-baz->parseBaz?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "Baz",
            isDefault: true,
            isArray: true,
            factory: {
                module: "qux/bar-baz",
                name: "parseBaz",
                isDefault: true,
            },
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });

    test("parses a named import as an array type with a factory and options", () => {
        const descriptor = "foo/bar-baz->{Baz}[];qux/bar-baz->{parseBaz}?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "Baz",
            isDefault: false,
            isArray: true,
            factory: {
                module: "qux/bar-baz",
                name: "parseBaz",
                isDefault: false,
            },
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });

    test("parses a dot notation", () => {
        const descriptor = "foo.BarBaz";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "BarBaz",
            isDefault: false,
            isArray: false,
            factory: undefined,
            options: undefined,
        });
    });

    test("parses a dot notation as an array type", () => {
        const descriptor = "foo.BarBaz[]";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "BarBaz",
            isDefault: false,
            isArray: true,
            factory: undefined,
            options: undefined,
        });
    });

    test("parses a dot notation as an array type with factory", () => {
        const descriptor = "foo.BarBaz[]:{parseBaz}";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "BarBaz",
            isDefault: false,
            isArray: true,
            factory: {
                module: "foo/bar-baz",
                name: "parseBaz",
                isDefault: false,
            },
            options: undefined,
        });
    });

    test("parses a dot notation as an array type with factory and options", () => {
        const descriptor = "foo.BarBaz[]:{parseBaz}?split=true&trimEntries=true&removeEmptyEntries=true";

        const typeDescriptor = parseActionParameterTypeDescriptor(descriptor);

        expect(typeDescriptor).toEqual({
            module: "foo/bar-baz",
            name: "BarBaz",
            isDefault: false,
            isArray: true,
            factory: {
                module: "foo/bar-baz",
                name: "parseBaz",
                isDefault: false,
            },
            options: QueryString.parse("?split=true&trimEntries=true&removeEmptyEntries=true"),
        });
    });
});
