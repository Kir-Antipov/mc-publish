import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

/**
 * Cipher type used for encryption and decryption.
 */
const CIPHER_TYPE = "aes-256-cbc";

/**
 * Length of the encryption key.
 */
const KEY_LENGTH = 32;

/**
 * Length of the initialization vector.
 */
const IV_LENGTH = 16;

/**
 * WeakMap to store the encrypted Buffer data of each SecureString instance.
 */
const BUFFERS = new WeakMap<SecureString, Buffer>();

/**
 * WeakMap to store the encryption key of each SecureString instance.
 */
const KEYS = new WeakMap<SecureString, Buffer>();

/**
 * WeakMap to store the initialization vector of each SecureString instance.
 */
const IVS = new WeakMap<SecureString, Buffer>();

/**
 * Represents a secure string, which can only be accessed when unwrapped.
 */
export class SecureString {
    /**
     * Constructs a new {@link SecureString} instances.
     *
     * @param buffer - Encrypted buffer data.
     * @param key - Encryption key.
     * @param iv - Initialization vector.
     */
    private constructor(buffer: Buffer, key: Buffer, iv: Buffer) {
        BUFFERS.set(this, buffer);
        KEYS.set(this, key);
        IVS.set(this, iv);
    }

    /**
     * Creates a new {@link SecureString} instance from a given input string, or `Buffer`.
     *
     * @param s - The input string, or `Buffer`.
     *
     * @returns A new {@link SecureString} instance.
     */
    static from(s: string | Buffer | SecureString): SecureString {
        if (s instanceof SecureString) {
            return s;
        }

        const decryptedBuffer = Buffer.from(s || "");
        const key = randomBytes(KEY_LENGTH);
        const iv = randomBytes(IV_LENGTH);

        const cipher = createCipheriv(CIPHER_TYPE, key, iv);
        const buffer = Buffer.concat([cipher.update(decryptedBuffer), cipher.final()]);
        return new SecureString(buffer, key, iv);
    }

    /**
     * Unwraps the encrypted {@link SecureString} instance and returns the decrypted string.
     *
     * @returns Decrypted string.
     */
    unwrap(): string {
        const buffer = BUFFERS.get(this);
        const key = KEYS.get(this);
        const iv = IVS.get(this);
        if (!buffer || !key || !iv) {
            throw new Error("The SecureString instance was not properly initialized.");
        }

        const decipher = createDecipheriv(CIPHER_TYPE, key, iv);
        const decryptedBuffer = Buffer.concat([decipher.update(buffer), decipher.final()]);
        return decryptedBuffer.toString();
    }

    /**
     * Returns the custom string tag to identify {@link SecureString} instances.
     *
     * @returns "SecureString".
     */
    get [Symbol.toStringTag](): string {
        return "SecureString";
    }

    /**
     * Return a masked string, hiding the actual content.
     *
     * @returns A masked string.
     */
    toString(): string {
        return "*****";
    }

    /**
     * Return a masked string, hiding the actual content.
     *
     * @returns A masked string.
     */
    toJSON(): string {
        return this.toString();
    }
}
