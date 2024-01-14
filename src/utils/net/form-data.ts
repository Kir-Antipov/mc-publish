import { $i } from "@/utils/collections";
import { getOwnEntries } from "@/utils/reflection";
import { ConstructorReturnType } from "@/utils/types";
import { basename } from "node:path";
import { Blob, readBlobSync } from "./blob";

/* eslint-disable-next-line no-restricted-imports */
import { FormData as FormDataPolyfill } from "node-fetch";

/**
 * The `FormData` interface provides a way to easily construct a set of key/value pairs representing form fields and
 * their values, which can then be easily sent using methods like `fetch()` or `XMLHttpRequest.send()`.
 * It uses the same format a form would use if the encoding type were set to "multipart/form-data".
 */
export const FormData = FormDataPolyfill;

/**
 * The `FormData` interface provides a way to easily construct a set of key/value pairs representing form fields and
 * their values, which can then be easily sent using methods like `fetch()` or `XMLHttpRequest.send()`.
 * It uses the same format a form would use if the encoding type were set to "multipart/form-data".
 */
export type FormData = ConstructorReturnType<typeof FormDataPolyfill>;

/**
 * Symbol to represent the file path property. This is used to associate a
 * file path with an object when converting it to a FormData entry, allowing
 * the inclusion of file-related data in the FormData.
 */
export const FILE_PATH = Symbol.for("path");

/**
 * Checks if the given data is an instance of `FormData`.
 *
 * @param data - The data to check.
 *
 * @returns `true` if the data is an instance of `FormData`; otherwise, `false`.
 */
export function isFormData(data: unknown): data is FormData {
    return data?.[Symbol.toStringTag] === "FormData";
}

/**
 * Converts the given object to a `FormData` instance.
 *
 * This function iterates through the object's properties and appends them as key-value pairs
 * to the `FormData` instance. If a property has a {@link FILE_PATH} associated with it, the
 * file is converted to a `Blob` and included in the `FormData`.
 *
 * @param obj - The object to convert.
 *
 * @returns A `FormData` instance containing the key-value pairs from the object.
 */
export function toFormData(obj: unknown): FormData {
    if (typeof obj !== "object" && typeof obj !== "function") {
        return undefined;
    }

    if (isFormData(obj)) {
        return obj;
    }

    return $i(getOwnEntries(obj))
        .flatMap(([key, value]) => Array.isArray(value)
            ? $i(value).map(v => [key, v])
            : [[key, value]]
        )
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, ...toFormDataEntry(value)] as const)
        .reduce((formData, [key, value, name]) => {
            formData.append(String(key), value as Blob, name);
            return formData;
        }, new FormData());
}

/**
 * Converts a value to a `FormData` entry.
 *
 * - If the value is a primitive, it will be converted to a string.
 * - If the value is an object, it will be stringified using `JSON.stringify()`.
 * - If the value has a {@link FILE_PATH} associated with it, the file will be
 * converted to a `Blob` and its name will be included in the resulting array.
 *
 * @param value - The value to convert.
 *
 * @returns An array containing the converted value and its name, if applicable.
 */
function toFormDataEntry(value: unknown): [string | Blob, string?] {
    if (!value || typeof value !== "object" && typeof value !== "function") {
        return [value === undefined ? "" : String(value)];
    }

    const path = value[FILE_PATH];
    if (typeof path === "string") {
        const blob = readBlobSync(path);
        return [blob, basename(path)];
    }

    return [JSON.stringify(value)];
}

// Force this to be included into the final build.
import { MultipartParser } from "node-fetch/src/utils/multipart-parser";
if (!MultipartParser) {
    isFormData(MultipartParser);
}
