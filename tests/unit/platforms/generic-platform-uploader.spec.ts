import { PlatformType } from "@/platforms";
import { Logger } from "@/utils/logging";
import { SoftError } from "@/utils/errors";
import { FileInfo } from "@/utils/io";
import { SecureString } from "@/utils/security";
import { GenericPlatformUploadRequest, GenericPlatformUploader, GenericPlatformUploaderOptions } from "@/platforms/generic-platform-uploader";

class MockGenericPlatformUploader extends GenericPlatformUploader<GenericPlatformUploaderOptions, GenericPlatformUploadRequest, boolean> {
    constructor(options?: GenericPlatformUploaderOptions) {
        super(options);
    }

    get platform(): PlatformType {
        return "" as PlatformType;
    }

    uploadCore(): Promise<boolean> {
        return Promise.resolve(true);
    }
}

function createLogger(): Logger {
    return {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        fatal: jest.fn(),
    };
}

function createRequest(): GenericPlatformUploadRequest {
    return {
        token: SecureString.from("token"),
        files: [FileInfo.of("file.txt")],
        retryAttempts: 3,
        retryDelay: 0,
    };
}

describe("GenericPlatformUploader", () => {
    describe("upload", () => {
        test("retries if a soft error is thrown", async () => {
            const request = createRequest();
            const logger = createLogger();
            const uploader = new MockGenericPlatformUploader({ logger });
            jest.spyOn(uploader, "uploadCore").mockImplementationOnce(() => Promise.reject(new SoftError(true)));
            jest.spyOn(uploader, "uploadCore").mockImplementationOnce(() => Promise.reject(new SoftError(true)));

            await expect(uploader.upload(request)).resolves.toBe(true);

            expect(logger.error).toHaveBeenCalledWith(expect.any(SoftError));
            expect(uploader.uploadCore).toHaveBeenCalledWith(request);
            expect(uploader.uploadCore).toHaveBeenCalledTimes(3);
        });

        test("doesn't retry if a non-soft error is thrown", async () => {
            const request = createRequest();
            const logger = createLogger();
            const uploader = new MockGenericPlatformUploader({ logger });
            jest.spyOn(uploader, "uploadCore").mockImplementationOnce(() => Promise.reject(new Error()));
            jest.spyOn(uploader, "uploadCore").mockImplementationOnce(() => Promise.reject(new Error()));

            await expect(uploader.upload(request)).rejects.toThrow(Error);

            expect(uploader.uploadCore).toHaveBeenCalledWith(request);
            expect(uploader.uploadCore).toHaveBeenCalledTimes(1);
        });
    });
});
