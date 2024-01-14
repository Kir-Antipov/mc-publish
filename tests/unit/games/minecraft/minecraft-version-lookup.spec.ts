import { parseVersion } from "@/utils/versioning/version";
import { MinecraftVersion } from "@/games/minecraft/minecraft-version";
import { MinecraftVersionType } from "@/games/minecraft/minecraft-version-type";
import { getMinecraftVersionRegExp, normalizeMinecraftVersion, normalizeMinecraftVersionRange } from "@/games/minecraft/minecraft-version-lookup";

describe("normalizeMinecraftVersion", () => {
    test("return a normalized version as is", () => {
        expect(normalizeMinecraftVersion("1.16.5")).toBe("1.16.5");
        expect(normalizeMinecraftVersion("1.17")).toBe("1.17");
        expect(normalizeMinecraftVersion("2.0")).toBe("2.0");
        expect(normalizeMinecraftVersion("1.8.4-alpha.15.14.a+loveandhugs")).toBe("1.8.4-alpha.15.14.a+loveandhugs");
        expect(normalizeMinecraftVersion("1.16-alpha.20.13.inf")).toBe("1.16-alpha.20.13.inf");
        expect(normalizeMinecraftVersion("1.19.4-rc.3")).toBe("1.19.4-rc.3");
        expect(normalizeMinecraftVersion("1.17.1-pre.3")).toBe("1.17.1-pre.3");
    });

    test("normalizes snapshots", () => {
        const manifest = [
            { id: "90w03a", type: MinecraftVersionType.SNAPSHOT, url: "", time: "", releaseTime: "", releaseDate: new Date(), sha1: "", complianceLevel: 1 },
            { id: "1.16.5", type: MinecraftVersionType.RELEASE, url: "", time: "", releaseTime: "", releaseDate: new Date(), sha1: "", complianceLevel: 1 },
            { id: "1.16.5-rc1", type: MinecraftVersionType.SNAPSHOT, url: "", time: "", releaseTime: "", releaseDate: new Date(), sha1: "", complianceLevel: 1 },
            { id: "20w51a", type: MinecraftVersionType.SNAPSHOT, url: "", time: "", releaseTime: "", releaseDate: new Date(), sha1: "", complianceLevel: 1 },
            { id: "20w49a", type: MinecraftVersionType.SNAPSHOT, url: "", time: "", releaseTime: "", releaseDate: new Date(), sha1: "", complianceLevel: 1 },
            { id: "20w48a", type: MinecraftVersionType.SNAPSHOT, url: "", time: "", releaseTime: "", releaseDate: new Date(), sha1: "", complianceLevel: 1 },
            { id: "20w46a", type: MinecraftVersionType.SNAPSHOT, url: "", time: "", releaseTime: "", releaseDate: new Date(), sha1: "", complianceLevel: 1 },
            { id: "20w45a", type: MinecraftVersionType.SNAPSHOT, url: "", time: "", releaseTime: "", releaseDate: new Date(), sha1: "", complianceLevel: 1 },
            { id: "1.16.4", type: MinecraftVersionType.RELEASE, url: "", time: "", releaseTime: "", releaseDate: new Date(), sha1: "", complianceLevel: 1 },
        ];

        expect(normalizeMinecraftVersion("90w03a", manifest, 0)).toBe("1.16.6-alpha.90.3.a");
        expect(normalizeMinecraftVersion("20w51a", manifest, 2)).toBe("1.16.5-alpha.20.51.a");
    });

    test("normalizes April Fools' releases", () => {
        expect(normalizeMinecraftVersion("1.RV-Pre1")).toBe("1.9.2-rv+trendy");
        expect(normalizeMinecraftVersion("15w14a")).toBe("1.8.4-alpha.15.14.a+loveandhugs");
        expect(normalizeMinecraftVersion("20w14~")).toBe("1.16-alpha.20.13.inf");
        expect(normalizeMinecraftVersion("20w14infinite")).toBe("1.16-alpha.20.13.inf");
        expect(normalizeMinecraftVersion("22w13oneblockatatime")).toBe("1.19-alpha.22.13.oneblockatatime");
        expect(normalizeMinecraftVersion("23w13a_or_b")).toBe("1.20-alpha.23.13.ab");
        expect(normalizeMinecraftVersion("3D Shareware v1.34")).toBe("1.14-alpha.19.13.shareware");
        expect(normalizeMinecraftVersion("2point0_red")).toBe("1.5.2-red");
        expect(normalizeMinecraftVersion("2point0_blue")).toBe("1.5.2-blue");
        expect(normalizeMinecraftVersion("2point0_purple")).toBe("1.5.2-purple");
    });

    test("normalizes legacy releases", () => {
        expect(normalizeMinecraftVersion("rd-20090515")).toBe("0.0.0-rd.150000");
        expect(normalizeMinecraftVersion("rd-161348")).toBe("0.0.0-rd.161348");
        expect(normalizeMinecraftVersion("inf-20100618")).toBe("0.31.20100618");
        expect(normalizeMinecraftVersion("c0.30_01c")).toBe("0.30.1-c");
        expect(normalizeMinecraftVersion("c0.0.13a")).toBe("0.0.13-a");
        expect(normalizeMinecraftVersion("c0.0.13a_03")).toBe("0.0.13-a.3");
        expect(normalizeMinecraftVersion("a1.0.4")).toBe("1.0.0-alpha.0.4");
        expect(normalizeMinecraftVersion("a1.0.5_01")).toBe("1.0.0-alpha.0.5.1");
        expect(normalizeMinecraftVersion("a1.0.17_04")).toBe("1.0.0-alpha.0.17.4");
        expect(normalizeMinecraftVersion("b1.5_01")).toBe("1.0.0-beta.5.1");
        expect(normalizeMinecraftVersion("b1.6")).toBe("1.0.0-beta.6");
        expect(normalizeMinecraftVersion("b1.8.1")).toBe("1.0.0-beta.8.1");
    });
});

describe("normalizeMinecraftVersionRange", () => {
    test("returns a normalized version range", () => {
        const versions = new Map([
            new MinecraftVersion("21w03a", parseVersion("1.17-alpha.21.3.a"), MinecraftVersionType.SNAPSHOT, "", new Date()),
            new MinecraftVersion("1.16.5", parseVersion("1.16.5"), MinecraftVersionType.RELEASE, "", new Date()),
            new MinecraftVersion("1.16.5-rc1", parseVersion("1.16.5-rc.1"), MinecraftVersionType.SNAPSHOT, "", new Date()),
            new MinecraftVersion("20w51a", parseVersion("1.16.5-alpha.20.51.a"), MinecraftVersionType.SNAPSHOT, "", new Date()),
            new MinecraftVersion("20w49a", parseVersion("1.16.5-alpha.20.49.a"), MinecraftVersionType.SNAPSHOT, "", new Date()),
            new MinecraftVersion("20w48a", parseVersion("1.16.5-alpha.20.48.a"), MinecraftVersionType.SNAPSHOT, "", new Date()),
            new MinecraftVersion("20w46a", parseVersion("1.16.5-alpha.20.46.a"), MinecraftVersionType.SNAPSHOT, "", new Date()),
            new MinecraftVersion("20w45a", parseVersion("1.16.5-alpha.20.45.a"), MinecraftVersionType.SNAPSHOT, "", new Date()),
            new MinecraftVersion("1.16.4", parseVersion("1.16.4"), MinecraftVersionType.RELEASE, "", new Date()),
        ].map(x => [x.id, x]));
        const versionRegex = getMinecraftVersionRegExp(versions.keys());

        const normalize = (x : Iterable<string>) => normalizeMinecraftVersionRange(x, versions, versionRegex);

        expect(normalize(">1.16.4 <=1.16.5").includes("1.16.3")).toBe(false);
        expect(normalize(">1.16.4 <=1.16.5").includes("1.16.4")).toBe(false);
        expect(normalize(">1.16.4 <=1.16.5").includes("1.16.5-alpha.20.45.a")).toBe(true);
        expect(normalize(">1.16.4 <=1.16.5").includes("1.17")).toBe(false);
        expect(normalize(">1.16.4 <=1.16.5").includes("1.17-alpha.21.3.a")).toBe(false);

        expect(normalize([">1.16.4 <=1.16.5"]).includes("1.16.3")).toBe(false);
        expect(normalize([">1.16.4 <=1.16.5"]).includes("1.16.4")).toBe(false);
        expect(normalize([">1.16.4 <=1.16.5"]).includes("1.16.5-alpha.20.45.a")).toBe(true);
        expect(normalize([">1.16.4 <=1.16.5"]).includes("1.17")).toBe(false);
        expect(normalize([">1.16.4 <=1.16.5"]).includes("1.17-alpha.21.3.a")).toBe(false);

        expect(normalize(">1.16.4 <=1.16.5 || 1.16.4").includes("1.16.3")).toBe(false);
        expect(normalize(">1.16.4 <=1.16.5 || 1.16.4").includes("1.16.4")).toBe(true);
        expect(normalize(">1.16.4 <=1.16.5 || 1.16.4").includes("1.16.5-alpha.20.45.a")).toBe(true);
        expect(normalize(">1.16.4 <=1.16.5 || 1.16.4").includes("1.17")).toBe(false);
        expect(normalize(">1.16.4 <=1.16.5 || 1.16.4").includes("1.17-alpha.21.3.a")).toBe(false);

        expect(normalize([">1.16.4 <=1.16.5", "1.16.4"]).includes("1.16.3")).toBe(false);
        expect(normalize([">1.16.4 <=1.16.5", "1.16.4"]).includes("1.16.4")).toBe(true);
        expect(normalize([">1.16.4 <=1.16.5", "1.16.4"]).includes("1.16.5-alpha.20.45.a")).toBe(true);
        expect(normalize([">1.16.4 <=1.16.5", "1.16.4"]).includes("1.17")).toBe(false);
        expect(normalize([">1.16.4 <=1.16.5", "1.16.4"]).includes("1.17-alpha.21.3.a")).toBe(false);

        expect(normalize(">1.16.4 <=1.16.5 || 21w03a").includes("1.16.3")).toBe(false);
        expect(normalize(">1.16.4 <=1.16.5 || 21w03a").includes("1.16.4")).toBe(false);
        expect(normalize(">1.16.4 <=1.16.5 || 21w03a").includes("1.16.5-alpha.20.45.a")).toBe(true);
        expect(normalize(">1.16.4 <=1.16.5 || 21w03a").includes("1.17")).toBe(false);
        expect(normalize(">1.16.4 <=1.16.5 || 21w03a").includes("1.17-alpha.21.3.a")).toBe(true);

        expect(normalize([">1.16.4 <=1.16.5", "21w03a"]).includes("1.16.3")).toBe(false);
        expect(normalize([">1.16.4 <=1.16.5", "21w03a"]).includes("1.16.4")).toBe(false);
        expect(normalize([">1.16.4 <=1.16.5", "21w03a"]).includes("1.16.5-alpha.20.45.a")).toBe(true);
        expect(normalize([">1.16.4 <=1.16.5", "21w03a"]).includes("1.17")).toBe(false);
        expect(normalize([">1.16.4 <=1.16.5", "21w03a"]).includes("1.17-alpha.21.3.a")).toBe(true);
    });
});

describe("getMinecraftVersionRegExp", () => {
    test("matches releases", () => {
        const regex = getMinecraftVersionRegExp();

        expect(regex.test("1.16.5")).toBe(true);
        expect(regex.test("1.17")).toBe(true);
        expect(regex.test("1.18")).toBe(true);
        expect(regex.test("1.20.4")).toBe(true);
        expect(regex.test("2.0.0")).toBe(true);
        expect(regex.test("1.0")).toBe(true);
    });

    test("matches snapshots", () => {
        const regex = getMinecraftVersionRegExp();

        expect(regex.test("1.20.4-rc1")).toBe(true);
        expect(regex.test("1.19-pre5")).toBe(true);
        expect(regex.test("20w48a")).toBe(true);
        expect(regex.test("15w43c")).toBe(true);
        expect(regex.test("1.14.2 Pre-Release 4")).toBe(true);
        expect(regex.test("13w21b")).toBe(true);
    });

    test("matches legacy releases", () => {
        const regex = getMinecraftVersionRegExp();

        expect(regex.test("rd-20090515")).toBe(true);
        expect(regex.test("rd-161348")).toBe(true);
        expect(regex.test("inf-20100618")).toBe(true);
        expect(regex.test("c0.30_01c")).toBe(true);
        expect(regex.test("c0.0.13a")).toBe(true);
        expect(regex.test("c0.0.13a_03")).toBe(true);
        expect(regex.test("a1.0.4")).toBe(true);
        expect(regex.test("a1.0.5_01")).toBe(true);
        expect(regex.test("a1.0.17_04")).toBe(true);
        expect(regex.test("b1.5_01")).toBe(true);
        expect(regex.test("b1.6")).toBe(true);
        expect(regex.test("b1.8.1")).toBe(true);
    });

    test("matches additionally provided versions", () => {
        const versions = [
            "10w10twoblocksatatime",
            "4D Shareware v2.45",
            "This is a Minecraft version",
        ];

        const regex = getMinecraftVersionRegExp(versions);

        versions.forEach(x => expect(x.match(regex)).toBeTruthy());
    });
});
