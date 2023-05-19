/**
 * Represents an uploaded file.
 */
export interface UploadedFile {
    /**
     * The unique identifier of the file.
     */
    id: number | string;

    /**
     * The display name of the file.
     */
    name: string;

    /**
     * The URL to download the file.
     */
    url: string;
}
