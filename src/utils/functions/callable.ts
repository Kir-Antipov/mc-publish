/**
 * A symbol representing the `call` function of a {@link Callable} object.
 */
export const CALL = Symbol.for("call");

/**
 * Represents an object, which can be converted into a {@link Callable} one.
 */
interface SemiCallable {
    /**
     * A method that should be invoked, when an object is used as a function.
     */
    [CALL](...args: unknown[]): unknown;
}

/**
 * Represents an object, which can be called like a function.
 *
 * @template T - The type of the underlying object.
 */
export type Callable<T extends SemiCallable> = T & {
    /**
     * Redirects a call to the {@link CALL} function.
     */
    (...args: Parameters<T[typeof CALL]>): ReturnType<T[typeof CALL]>;
};

/**
 * Makes an object callable.
 *
 * @template T - The type of the object.
 * @param obj - The object to make callable.
 *
 * @returns A new {@link Callable} object with the same properties as the original one, but which can be called like a function.
 */
export function makeCallable<T extends SemiCallable>(obj: T): Callable<T> {
    /**
     * Redirects a call to the {@link CALL} function.
     */
    function call(...args: unknown[]): unknown {
        return (call as unknown as T)[CALL](...args);
    }

    Object.assign(call, obj);
    Object.setPrototypeOf(call, Object.getPrototypeOf(obj));
    return call as unknown as Callable<T>;
}
