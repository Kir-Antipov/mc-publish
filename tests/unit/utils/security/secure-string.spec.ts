import { SecureString } from "@/utils/security/secure-string";

describe("SecureString", () => {
    describe("from", () => {
        test("creates a SecureString from a string", () => {
            const secureString = SecureString.from("password");

            expect(secureString).toBeDefined();
            expect(secureString.unwrap()).toBe("password");
        });

        test("creates a SecureString from a buffer", () => {
            const secureString = SecureString.from(Buffer.from("password"));

            expect(secureString).toBeDefined();
            expect(secureString.unwrap()).toBe("password");
        });

        test("returns a SecureString as is", () => {
            const originalSecureString = SecureString.from("password");
            const secureString = SecureString.from(originalSecureString);

            expect(secureString).toBeDefined();
            expect(secureString).toStrictEqual(originalSecureString);
        });
    });

    describe("unwrap", () => {
        test("returns the decrypted string when unwrapped", () => {
            const secureString = SecureString.from("password");

            expect(secureString.unwrap()).toBe("password");
        });

        test("throws an error if trying to unwrap an improperly initialized secure string", () => {
            const secureString = new (SecureString as unknown as DateConstructor)() as unknown as SecureString;

            expect(() => secureString.unwrap()).toThrowError("The SecureString instance was not properly initialized.");
        });
    });

    test("does not reveal the value when converted to a string", () => {
        const secureString = SecureString.from("password");

        expect(secureString.toString()).not.toBe("password");
        expect(String(secureString)).not.toBe("password");
    });

    test("does not reveal the value when part of an object that is serialized to JSON", () => {
        const secureString = SecureString.from("password");
        const obj = { secureString };

        expect(JSON.stringify(obj)).not.toMatch("password");
    });
});
