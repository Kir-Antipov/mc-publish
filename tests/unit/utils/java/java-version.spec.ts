import { JavaVersion } from "@/utils/java";

describe("JavaVersion", () => {
    describe("constructor", () => {
        test("constructs a new instance with the given version number", () => {
            const javaVersion = new JavaVersion(8);

            expect(javaVersion.versionNumber).toBe(8);
            expect(javaVersion.name).toBe("Java 8");
        });
    });

    describe("parse", () => {
        test("returns a JavaVersion instance when given a valid string", () => {
            const validInputs = ["Java 8", "Java 1.8", "java 1.8", "1.8", "8"];

            for (const input of validInputs) {
                const javaVersion = JavaVersion.parse(input);

                expect(javaVersion).toBeDefined();
                expect(javaVersion.versionNumber).toBe(8);
                expect(javaVersion.name).toBe("Java 8");
            }
        });

        test("returns undefined when given an invalid string", () => {
            const invalidInputs = ["Java", "1.abc", "abc"];

            for (const input of invalidInputs) {
                const javaVersion = JavaVersion.parse(input);

                expect(javaVersion).toBeUndefined();
            }
        });

        test("returns undefined when given null or undefined", () => {
            expect(JavaVersion.parse(null)).toBeUndefined();
            expect(JavaVersion.parse(undefined)).toBeUndefined();
        });
    });

    describe("of", () => {
        test("returns a JavaVersion instance as is", () => {
            const javaVersion1 = new JavaVersion(8);
            const javaVersion2 = JavaVersion.of(javaVersion1);

            expect(javaVersion2).toBe(javaVersion1);
        });

        test("returns a JavaVersion instance when given a number", () => {
            const javaVersion = JavaVersion.of(8);

            expect(javaVersion).toBeDefined();
            expect(javaVersion.versionNumber).toBe(8);
            expect(javaVersion.name).toBe("Java 8");
        });

        test("returns a JavaVersion instance when given a valid string", () => {
            const javaVersion = JavaVersion.of("Java 16");

            expect(javaVersion).toBeDefined();
            expect(javaVersion.versionNumber).toBe(16);
            expect(javaVersion.name).toBe("Java 16");
        });

        test("returns undefined when given an invalid input", () => {
            const invalidInputs = ["Java", "1.abc", "abc"];

            for (const input of invalidInputs) {
                const javaVersion = JavaVersion.of(input);

                expect(javaVersion).toBeUndefined();
            }
        });

        test("returns undefined when given null or undefined", () => {
            expect(JavaVersion.of(null)).toBeUndefined();
            expect(JavaVersion.of(undefined)).toBeUndefined();
        });
    });

    describe("toString", () => {
        test("returns the string representation of the Java version", () => {
            const javaVersion = new JavaVersion(8);

            expect(javaVersion.toString()).toBe("Java 8");
        });
    });

    test("should be converted to JSON as a Java version string", () => {
        const javaVersion = new JavaVersion(11);

        expect(JSON.stringify(javaVersion)).toBe("\"Java 11\"");
    });
});
