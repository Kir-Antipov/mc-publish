/**
 * Represents a function that takes any number of arguments of type `P` and returns a value of type `R`.
 *
 * @template P - An array of parameter types.
 * @template R - The return type of the function.
 */
export interface Func<P extends unknown[] = unknown[], R = unknown> {
    /**
     * Calls the function with the specified arguments.
     *
     * @param args The arguments to pass to the function.
     *
     * @returns The result of calling the function.
     */
    (...args: P): R;
}
