import mockFs from "mock-fs";
import { GitHubContext } from "@/platforms/github/github-context";

describe("GitHubContext", () => {
    describe("ref", () => {
        test("returns ref when GITHUB_REF is set", () => {
            const context = new GitHubContext({ GITHUB_REF: "refs/tags/v1.0.0" });

            expect(context.ref).toBe("refs/tags/v1.0.0");
        });

        test("returns undefined when GITHUB_REF is not set", () => {
            const context = new GitHubContext({});

            expect(context.ref).toBeUndefined();
        });
    });

    describe("tag", () => {
        test("returns tag when GITHUB_REF is set", () => {
            const context = new GitHubContext({ GITHUB_REF: "refs/tags/v1.0.0" });

            expect(context.tag).toBe("v1.0.0");
        });

        test("returns undefined when GITHUB_REF is not set", () => {
            const context = new GitHubContext({});

            expect(context.tag).toBeUndefined();
        });
    });

    describe("version", () => {
        test("returns version when GITHUB_REF is set", () => {
            const context = new GitHubContext({ GITHUB_REF: "refs/tags/v1.0.0" });

            expect(context.version).toBe("1.0.0");
        });

        test("returns undefined when GITHUB_REF is not set", () => {
            const context = new GitHubContext({});

            expect(context.version).toBeUndefined();
        });
    });

    describe("repo", () => {
        test("returns repository when GITHUB_REPOSITORY is set", () => {
            const context = new GitHubContext({ GITHUB_REPOSITORY: "owner/repo" });

            expect(context.repo).toEqual({ owner: "owner", repo: "repo" });
        });

        test("returns undefined when GITHUB_REPOSITORY is not set", () => {
            const context = new GitHubContext({});

            expect(context.repo).toBeUndefined();
        });
    });

    describe("apiUrl", () => {
        test("returns API URL when GITHUB_API_URL is set", () => {
            const context = new GitHubContext({ GITHUB_API_URL: "https://api.foo.com" });

            expect(context.apiUrl).toBe("https://api.foo.com");
        });

        test("returns default API URL when GITHUB_API_URL is not set", () => {
            const context = new GitHubContext({});

            expect(context.apiUrl).toBe("https://api.github.com");
        });
    });

    describe("payload", () => {
        beforeAll(() => {
            mockFs({
                "payload.json": JSON.stringify({ release: { id: 42 } }),
            });
        });

        afterAll(() => {
            mockFs.restore();
        });

        test("returns payload when GITHUB_EVENT_PATH is set and file exists", () => {
            const context = new GitHubContext({ GITHUB_EVENT_PATH: "payload.json" });

            expect(context.payload).toEqual({ release: { id: 42 } });
        });

        test("returns empty object when GITHUB_EVENT_PATH is set but file does not exist", () => {
            const context = new GitHubContext({ GITHUB_EVENT_PATH: "foo.json" });

            expect(context.payload).toEqual({});
        });

        test("returns empty object when GITHUB_EVENT_PATH is not set", () => {
            const context = new GitHubContext({});

            expect(context.payload).toEqual({});
        });
    });
});
