/**
 * Represents a Java version.
 */
export class JavaVersion {
    /**
     * The name of the Java version.
     */
    private readonly _name: string;

    /**
     * The version number of the Java version.
     */
    private readonly _versionNumber: number;

    /**
     * Creates a new {@link JavaVersion} instance.
     *
     * @param versionNumber - The version number of the Java version.
     */
    constructor(versionNumber: number) {
        this._name = `Java ${versionNumber}`;
        this._versionNumber = versionNumber;
    }

    /**
     * Parses a Java version from a string.
     *
     * @param java - The string representation of the Java version.
     *
     * @returns A {@link JavaVersion} instance, or `undefined` if the string cannot be parsed.
     */
    static parse(java: string): JavaVersion | undefined {
        if (!java) {
            return undefined;
        }

        const match = java.match(/(\d+)\s*$/);
        if (!match) {
            return undefined;
        }

        return new JavaVersion(+match[1]);
    }

    /**
     * Casts the given value to a {@link JavaVersion} instance.
     *
     * @param java - The string representation of the Java version, its version number, or a {@link JavaVersion} instance.
     *
     * @returns A {@link JavaVersion} instance, or `undefined` if the input could not be casted to such.
     */
    static of(java: string | number | JavaVersion): JavaVersion | undefined {
        if (java instanceof JavaVersion) {
            return java;
        }

        if (typeof java === "number") {
            return new JavaVersion(java);
        }

        return JavaVersion.parse(String(java));
    }

    /**
     * Gets the name of the Java version, e.g., "Java 8".
     */
    get name(): string {
        return this._name;
    }

    /**
     * Gets the version number of the Java version, e.g., 8 for Java 8.
     */
    get versionNumber(): number {
        return this._versionNumber;
    }

    /**
     * Returns the string representation of the Java version.
     */
    toString(): string {
        return this._name;
    }

    /**
     * Returns the string representation of the Java version.
     */
    toJSON(): string {
        return this._name;
    }
}
