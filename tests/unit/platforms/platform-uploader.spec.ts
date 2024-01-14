import { GitHubContext } from "@/platforms/github/github-context";
import { PlatformType } from "@/platforms/platform-type";
import { createPlatformUploader } from "@/platforms/platform-uploader";

describe("createPlatformUploader", () => {
    test("creates an uploader for every known platform", () => {
        const options = {
            githubContext: { repo: "" } as unknown as GitHubContext,
        };

        for (const platform of PlatformType.values()) {
            expect(createPlatformUploader(platform, options)).toBeDefined();
        }
    });

    test("throws an error when an unknown platform is provided", () => {
        expect(() => createPlatformUploader("unknown" as PlatformType, { githubContext: null })).toThrow();
    });
});
