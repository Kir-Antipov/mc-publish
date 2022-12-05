import { Func } from "./func";

/**
 * Represents a middleware function for a function of type T.
 *
 * Middleware functions can intercept, modify, or add behavior to the original function.
 *
 * @template T - The type of the function.
 */
export type Middleware<T extends Func> = T extends Func<infer P, infer R> ? (...args: [...args: P, next: (...args: P) => R]) => R : never;

/**
 * A class that manages middleware functions for a given function of type `T`.
 *
 * It allows adding middleware functions to intercept, modify, or add behavior to the original function.
 *
 * @template T - The type of the function.
 */
export class MiddlewareHandler<T extends Func> {
    /**
     * The target function that the middleware functions will be applied to.
     */
    private readonly _target: T;

    /**
     * A list of middleware functions that will be executed in the order they were added.
     */
    private readonly _delegates: Middleware<T>[];

    /**
     * Constructs a new {@link MiddlewareHandler} instance.
     *
     * @param target - The target function that the middleware functions will be applied to.
     */
    constructor(target: T) {
        this._target = target;
        this._delegates = [];
    }

    /**
     * Adds a middleware function to the {@link MiddlewareHandler}.
     *
     * Middleware functions are executed in the order they were added.
     *
     * @param middleware - The middleware function to add.
     *
     * @returns `this` instance, allowing for method chaining.
     */
    use(middleware: Middleware<T>): this {
        this._delegates.push(middleware);
        return this;
    }

    /**
     * Executes the middleware chain and the target function with the provided arguments.
     *
     * The middleware functions are called in the order they were added.
     *
     * @param args - The arguments to pass to the middleware functions and the target function.
     *
     * @returns The result of the target function after applying all middleware functions.
     */
    execute(...args: Parameters<T>): ReturnType<T> {
        return this.asFunction()(...args) as ReturnType<T>;
    }

    /**
     * Returns the composed target function with the middleware chain applied.
     *
     * This function can be called directly, and it will execute the middleware chain and the target function.
     *
     * @returns The composed target function.
     */
    asFunction(): T {
        if (!this._delegates.length) {
            return this._target;
        }

        const target = this._target;
        const delegates = [...this._delegates];

        const apply = (i: number) => (...args: Parameters<T>) => i < delegates.length
            ? delegates[i](...args, apply(i + 1))
            : target(...args);

        return apply(0) as T;
    }
}
