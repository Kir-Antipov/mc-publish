import { PathLike, existsSync } from "node:fs";

/**
 * Represents an error that occurs when a specified file cannot be found.
 */
export class FileNotFoundError extends Error {
    /**
     * Default error message pattern.
     */
    private static readonly DEFAULT_FILE_NOT_FOUND_ERROR_MESSAGE_PATTERN = (fileName: string) => fileName ? `Could not find file '${fileName}'.` : "Could not find the specified file.";

    /**
     * The name of the file that could not be found.
     */
    private readonly _fileName?: string;

    /**
     * Constructs a new {@link FileNotFoundError} instance.
     *
     * @param fileName - The name of the file that could not be found.
     * @param message - The error message to display.
     * @param options - Optional settings for the error object.
     */
    constructor(fileName?: string, message?: string, options?: ErrorOptions) {
        super(message ?? FileNotFoundError.DEFAULT_FILE_NOT_FOUND_ERROR_MESSAGE_PATTERN(fileName), options);

        this.name = "FileNotFoundError";
        this._fileName = fileName;
    }

    /**
     * Gets the name of the file that could not be found.
     */
    get fileName(): string | undefined {
        return this._fileName;
    }

    /**
     * Throws a {@link FileNotFoundError} if the specified file does not exist.
     *
     * @param fileName - The name of the file to check for existence.
     * @param message - The error message to display.
     */
    static throwIfNotFound(fileName: PathLike, message?: string): void | never {
        if (!existsSync(fileName)) {
            throw new FileNotFoundError(String(fileName), message);
        }
    }
}
