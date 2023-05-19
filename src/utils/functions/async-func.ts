/**
 * Represents an async function that takes any number of arguments of type `P` and returns a value of type `R`.
 *
 * @template P - An array of parameter types.
 * @template R - The return type of the function.
 */
export interface AsyncFunc<P extends unknown[] = unknown[], R = unknown> {
    /**
     * Calls the function with the specified arguments.
     *
     * @param args The arguments to pass to the function.
     *
     * @returns A promise resolving to the result of calling the function.
     */
    (...args: P): Promise<R>;
}
