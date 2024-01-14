import {
    parseVersionRange,
    anyVersionRange,
    noneVersionRange,
} from "@/utils/versioning/version-range";

describe("parseVersionRange", () => {
    test("parses a semver string correctly", () => {
        const versionRange = parseVersionRange(">=1.2.3 <2.0.0");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe(">=1.2.3 <2.0.0");

        expect(versionRange.includes("1.2.3")).toBe(true);
        expect(versionRange.includes("1.2.4")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
        expect(versionRange.includes("1.0.0")).toBe(false);
        expect(versionRange.includes("1.2.2")).toBe(false);
        expect(versionRange.includes("2.0.1")).toBe(false);
    });

    test("parses a semver string with X-ranges correctly", () => {
        const versionRange = parseVersionRange(">=1.2.x <2.0.X");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe(">=1.2.x <2.0.X");

        expect(versionRange.includes("1.2.0")).toBe(true);
        expect(versionRange.includes("1.2.1")).toBe(true);
        expect(versionRange.includes("1.2.2")).toBe(true);
        expect(versionRange.includes("1.2.3")).toBe(true);
        expect(versionRange.includes("1.2.4")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
        expect(versionRange.includes("1.0.0")).toBe(false);
        expect(versionRange.includes("2.0.1")).toBe(false);
    });

    test("parses a semver string with *-ranges correctly", () => {
        const versionRange = parseVersionRange(">=1.2.* <2.0.*");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe(">=1.2.* <2.0.*");

        expect(versionRange.includes("1.2.0")).toBe(true);
        expect(versionRange.includes("1.2.1")).toBe(true);
        expect(versionRange.includes("1.2.2")).toBe(true);
        expect(versionRange.includes("1.2.3")).toBe(true);
        expect(versionRange.includes("1.2.4")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
        expect(versionRange.includes("1.0.0")).toBe(false);
        expect(versionRange.includes("2.0.1")).toBe(false);
    });

    test("parses an interval notation string correctly", () => {
        const versionRange = parseVersionRange("[1.2.3,2.0.0)");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("[1.2.3,2.0.0)");

        expect(versionRange.includes("1.2.3")).toBe(true);
        expect(versionRange.includes("1.2.4")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
        expect(versionRange.includes("1.0.0")).toBe(false);
        expect(versionRange.includes("1.2.2")).toBe(false);
        expect(versionRange.includes("2.0.1")).toBe(false);
    });

    test("parses an interval notation string with single version correctly", () => {
        const versionRange = parseVersionRange("[1.2.3]");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("[1.2.3]");

        expect(versionRange.includes("1.2.3")).toBe(true);
        expect(versionRange.includes("1.2.4")).toBe(false);
        expect(versionRange.includes("2.0.0")).toBe(false);
        expect(versionRange.includes("1.0.0")).toBe(false);
        expect(versionRange.includes("1.2.2")).toBe(false);
        expect(versionRange.includes("2.0.1")).toBe(false);
    });

    test("parses an interval notation string with single version open end correctly", () => {
        const versionRange = parseVersionRange("[1.2.3,)");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("[1.2.3,)");

        expect(versionRange.includes("1.2.3")).toBe(true);
        expect(versionRange.includes("1.2.4")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(true);
        expect(versionRange.includes("2.0.1")).toBe(true);
        expect(versionRange.includes("1.0.0")).toBe(false);
        expect(versionRange.includes("1.2.2")).toBe(false);
    });

    test("parses an interval notation string with single version closed end as typo for open end", () => {
        const versionRange = parseVersionRange("[1.2.3,]");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("[1.2.3,]");

        expect(versionRange.includes("1.2.3")).toBe(true);
        expect(versionRange.includes("1.2.4")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(true);
        expect(versionRange.includes("2.0.1")).toBe(true);
        expect(versionRange.includes("1.0.0")).toBe(false);
        expect(versionRange.includes("1.2.2")).toBe(false);
    });

    test("parses an interval notation string with X-ranges correctly", () => {
        const versionRange = parseVersionRange("[1.2.x,2.0.X)");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("[1.2.x,2.0.X)");

        expect(versionRange.includes("1.2.0")).toBe(true);
        expect(versionRange.includes("1.2.1")).toBe(true);
        expect(versionRange.includes("1.2.2")).toBe(true);
        expect(versionRange.includes("1.2.3")).toBe(true);
        expect(versionRange.includes("1.2.4")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
        expect(versionRange.includes("1.0.0")).toBe(false);
        expect(versionRange.includes("2.0.1")).toBe(false);
    });

    test("parses an interval notation string with *-ranges correctly", () => {
        const versionRange = parseVersionRange("[1.2.*,2.0.*)");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("[1.2.*,2.0.*)");

        expect(versionRange.includes("1.2.0")).toBe(true);
        expect(versionRange.includes("1.2.1")).toBe(true);
        expect(versionRange.includes("1.2.2")).toBe(true);
        expect(versionRange.includes("1.2.3")).toBe(true);
        expect(versionRange.includes("1.2.4")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
        expect(versionRange.includes("1.0.0")).toBe(false);
        expect(versionRange.includes("2.0.1")).toBe(false);
    });

    test("parses a string that mixes semver and interval notation correctly", () => {
        const versionRange = parseVersionRange(">=1.2.3 <2.0.0 || [2.0.0,3.0.0)");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe(">=1.2.3 <2.0.0 || [2.0.0,3.0.0)");

        expect(versionRange.includes("1.2.3")).toBe(true);
        expect(versionRange.includes("1.2.4")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(true);
        expect(versionRange.includes("2.0.1")).toBe(true);
        expect(versionRange.includes("2.9999.9999")).toBe(true);
        expect(versionRange.includes("1.0.0")).toBe(false);
        expect(versionRange.includes("1.2.2")).toBe(false);
        expect(versionRange.includes("3.0.0")).toBe(false);
        expect(versionRange.includes("3.0.1")).toBe(false);
    });

    test("handles an array of semver strings correctly", () => {
        const versionRange = parseVersionRange(["1.0.0", "2.0.0"]);

        expect(versionRange).toBeDefined();
        expect(versionRange.includes("1.0.0")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(true);
        expect(versionRange.includes("0.0.0")).toBe(false);
        expect(versionRange.includes("3.0.0")).toBe(false);
    });

    test("handles an array of interval strings correctly", () => {
        const versionRange = parseVersionRange(["[1.0.0,2.0.0)", "[3.0.0,4.0.0)"]);

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("[1.0.0,2.0.0) || [3.0.0,4.0.0)");

        expect(versionRange.includes("0.0.9999")).toBe(false);
        expect(versionRange.includes("1.0.0")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
        expect(versionRange.includes("3.0.0")).toBe(true);
        expect(versionRange.includes("3.9999.9999")).toBe(true);
        expect(versionRange.includes("4.0.0")).toBe(false);
        expect(versionRange.includes("4.0.1")).toBe(false);
    });

    test("handles an array of mixed semver and interval notations correctly", () => {
        const versionRange = parseVersionRange(["1.0.0", "[2.0.0,3.0.0)"]);

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("1.0.0 || [2.0.0,3.0.0)");

        expect(versionRange.includes("1.0.0")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(true);
        expect(versionRange.includes("2.9999.9999")).toBe(true);
        expect(versionRange.includes("3.0.0")).toBe(false);
    });

    test("handles missing patch numbers in semver notation", () => {
        const versionRange = parseVersionRange(">=1.2 <2.0");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe(">=1.2 <2.0");

        expect(versionRange.includes("1.1.9999")).toBe(false);
        expect(versionRange.includes("1.2.0")).toBe(true);
        expect(versionRange.includes("1.2")).toBe(true);
        expect(versionRange.includes("1.2.1")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
    });

    test("handles missing patch numbers in interval notation", () => {
        const versionRange = parseVersionRange("[1.2,2.0)");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("[1.2,2.0)");

        expect(versionRange.includes("1.1.9999")).toBe(false);
        expect(versionRange.includes("1.2.0")).toBe(true);
        expect(versionRange.includes("1.2")).toBe(true);
        expect(versionRange.includes("1.2.1")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
    });

    test("handles missing patch numbers in pre-release semver notation", () => {
        const versionRange = parseVersionRange(">=1.2-alpha.1 <2.0-beta.2");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe(">=1.2-alpha.1 <2.0-beta.2");

        expect(versionRange.includes("1.1.9999")).toBe(false);
        expect(versionRange.includes("1.2.0")).toBe(true);
        expect(versionRange.includes("1.2")).toBe(true);
        expect(versionRange.includes("1.2.1")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
    });

    test("handles missing patch numbers in pre-release interval notation", () => {
        const versionRange = parseVersionRange("[1.2-alpha.1,2.0-beta.2)");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("[1.2-alpha.1,2.0-beta.2)");

        expect(versionRange.includes("1.1.9999")).toBe(false);
        expect(versionRange.includes("1.2.0")).toBe(true);
        expect(versionRange.includes("1.2")).toBe(true);
        expect(versionRange.includes("1.2.1")).toBe(true);
        expect(versionRange.includes("1.9999.9999")).toBe(true);
        expect(versionRange.includes("2.0.0")).toBe(false);
    });

    test("handles missing patch numbers in mixed semver and interval notations", () => {
        const versionRange = parseVersionRange("1.2-alpha.1 || [2.0-beta.2,3.0.0)");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("1.2-alpha.1 || [2.0-beta.2,3.0.0)");

        expect(versionRange.includes("1.2")).toBe(false);
        expect(versionRange.includes("1.2.0")).toBe(false);
        expect(versionRange.includes("1.2-alpha.1")).toBe(true);
        expect(versionRange.includes("1.3")).toBe(false);
        expect(versionRange.includes("1.9999.999")).toBe(false);
        expect(versionRange.includes("2.0.0")).toBe(true);
        expect(versionRange.includes("2.9999.9999")).toBe(true);
    });

    test("handles missing patch numbers in an array of mixed semver and interval notations", () => {
        const versionRange = parseVersionRange(["1.2-alpha.1", "[2.0-beta.2,3.0)"]);

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("1.2-alpha.1 || [2.0-beta.2,3.0)");

        expect(versionRange.includes("1.2")).toBe(false);
        expect(versionRange.includes("1.2.0")).toBe(false);
        expect(versionRange.includes("1.2-alpha.1")).toBe(true);
        expect(versionRange.includes("1.3")).toBe(false);
        expect(versionRange.includes("1.9999.999")).toBe(false);
        expect(versionRange.includes("2.0.0")).toBe(true);
        expect(versionRange.includes("2.9999.9999")).toBe(true);
    });

    test("parses an empty string as a version range that includes any version", () => {
        const versionRange = parseVersionRange("");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("");
        expect(versionRange.includes("0.0.1")).toBe(true);
        expect(versionRange.includes("9999.9999.9999")).toBe(true);
    });

    test("parses '*' as a version range that includes any version", () => {
        const versionRange = parseVersionRange("*");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("*");
        expect(versionRange.includes("0.0.1")).toBe(true);
        expect(versionRange.includes("9999.9999.9999")).toBe(true);
    });

    test("parses '(,)' as a version range that includes any version", () => {
        const versionRange = parseVersionRange("(,)");

        expect(versionRange).toBeDefined();
        expect(versionRange.toString()).toBe("(,)");
        expect(versionRange.includes("0.0.1")).toBe(true);
        expect(versionRange.includes("9999.9999.9999")).toBe(true);
    });
});

describe("anyVersionRange", () => {
    test("returns a version range that includes any version", () => {
        const versionRange = anyVersionRange();

        expect(versionRange.includes("0.0.1")).toBe(true);
        expect(versionRange.includes("9999.9999.9999")).toBe(true);
    });

    test("returns a custom version range that includes any version", () => {
        const versionRange = anyVersionRange("Includes any version");

        expect(versionRange.includes("0.0.1")).toBe(true);
        expect(versionRange.includes("9999.9999.9999")).toBe(true);
        expect(versionRange.toString()).toBe("Includes any version");
    });
});

describe("noneVersionRange", () => {
    test("returns a version range that includes no versions", () => {
        const versionRange = noneVersionRange();

        expect(versionRange.includes("0.0.1")).toBe(false);
        expect(versionRange.includes("9999.9999.9999")).toBe(false);
    });

    test("returns a custom version range that includes no versions", () => {
        const versionRange = noneVersionRange("Includes no versions");

        expect(versionRange.includes("0.0.1")).toBe(false);
        expect(versionRange.includes("9999.9999.9999")).toBe(false);
        expect(versionRange.toString()).toBe("Includes no versions");
    });
});

describe("VersionRange", () => {
    test("checks if a version is included in the range correctly", () => {
        expect(parseVersionRange("1.0.0").includes("1.0.0")).toBe(true);
        expect(parseVersionRange("1.0.0-alpha.1").includes("1.0.0-alpha.1")).toBe(true);
        expect(parseVersionRange("1.0").includes("1.0.0")).toBe(true);
        expect(parseVersionRange("1.0-alpha.1").includes("1.0.0-alpha.1")).toBe(true);
    });

    test("formats correctly", () => {
        expect(parseVersionRange("1.0.0").format()).toBe("1.0.0");
        expect(parseVersionRange("1.0.0-alpha.1").format()).toBe("1.0.0-alpha.1");
        expect(parseVersionRange("1.0").format()).toBe("1.0.0");
        expect(parseVersionRange("1.0-alpha.1").format()).toBe("1.0.0-alpha.1");
    });

    test("toString returns the original string representation", () => {
        expect(parseVersionRange("1.0.0").toString()).toBe("1.0.0");
        expect(parseVersionRange("1.0").toString()).toBe("1.0");
        expect(parseVersionRange("1.0.0-alpha.1").toString()).toBe("1.0.0-alpha.1");
        expect(parseVersionRange("1.0-alpha.1").toString()).toBe("1.0-alpha.1");
    });
});
