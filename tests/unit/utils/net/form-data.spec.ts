import mockFs from "mock-fs";
import { FileInfo } from "@/utils/io/file-info";
import { FILE_PATH, FormData, isFormData, toFormData } from "@/utils/net/form-data";
import { isBlob } from "@/utils/net/blob";

beforeEach(() => {
    mockFs({
        "file.json": "{}",
    });
});

afterEach(() => {
    mockFs.restore();
});

describe("FormData", () => {
    describe("constructor", () => {
        test("creates a new FormData instance", () => {
            const formData = new FormData();

            expect(formData).toBeDefined();
            expect(isFormData(formData)).toBe(true);
        });
    });
});

describe("FILE_PATH", () => {
    test("is defined", () => {
        expect(typeof FILE_PATH).toBe("symbol");
    });
});

describe("isFormData", () => {
    test("returns true when data is an instance of FormData", () => {
        const formData = new FormData();

        expect(isFormData(formData)).toBe(true);
    });

    test("returns false when data is not an instance of FormData", () => {
        const notFormData = { foo: "bar" };

        expect(isFormData(notFormData)).toBe(false);
    });

    test("returns false when data is null", () => {
        expect(isFormData(null)).toBe(false);
    });

    test("returns false when data is undefined", () => {
        expect(isFormData(undefined)).toBe(false);
    });
});

describe("toFormData", () => {
    test("returns undefined when input cannot be converted to a FormData instance", () => {
        const formData = toFormData("Why are we here? Just to suffer?");

        expect(formData).toBeUndefined();
    });

    test("returns the input when it is already a FormData instance", () => {
        const obj = new FormData();

        const formData = toFormData(obj);

        expect(formData).toBe(obj);
    });

    test("converts an object to a FormData instance", () => {
        const obj = { key1: "value1", key2: "value2" };

        const formData = toFormData(obj);

        expect(isFormData(formData)).toBe(true);
        expect(formData.get("key1")).toBe("value1");
        expect(formData.get("key2")).toBe("value2");
    });

    test("converts an array of key/value pairs to a FormData instance", () => {
        const obj = [["key1", "value1"], ["key2", "value2"]];

        const formData = toFormData(obj);

        expect(isFormData(formData)).toBe(true);
        expect(formData.get("key1")).toBe("value1");
        expect(formData.get("key2")).toBe("value2");
    });

    test("converts an array to a FormData entry and includes it in the FormData", () => {
        const obj = { key1: ["value1", "value2"] };

        const formData = toFormData(obj);

        expect(isFormData(formData)).toBe(true);
        expect(formData.getAll("key1")).toEqual(["value1", "value2"]);
    });

    test("ignores undefined and null values", () => {
        const obj = { key1: undefined, key2: null, key3: "value3" };

        const formData = toFormData(obj);

        expect(isFormData(formData)).toBe(true);
        expect(formData.has("key1")).toBe(false);
        expect(formData.has("key2")).toBe(false);
        expect(formData.get("key3")).toBe("value3");
    });

    test("converts a FileInfo instance to a Blob and includes it in the FormData", () => {
        const obj = { file: FileInfo.of("file.json") };

        const formData = toFormData(obj);
        const file = formData.get("file");

        expect(isFormData(formData)).toBe(true);
        expect(isBlob(file)).toBe(true);
        expect(file).toHaveProperty("name", "file.json");
    });
});
