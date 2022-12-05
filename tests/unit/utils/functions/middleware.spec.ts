import { Middleware, MiddlewareHandler } from "@/utils/functions/middleware";

describe("MiddlewareHandler", () => {
    describe("constructor", () => {
        test("creates middleware handler with target function", () => {
            const func = (a: number, b: number) => a + b;

            const handler = new MiddlewareHandler(func);

            expect(handler.execute(1, 2)).toBe(3);
        });
    });

    describe("use", () => {
        test("adds middleware function to the handler", () => {
            const func = (a: number, b: number) => a + b;
            const middleware: Middleware<typeof func> = (a, b, next) => {
                return next(a * 2, b * 3);
            };

            const handler = new MiddlewareHandler(func).use(middleware);

            expect(handler.execute(1, 2)).toBe(8);
        });

        test("adds multiple middleware functions to the handler", () => {
            const func = (a: number, b: number) => a + b;
            const middleware1: Middleware<typeof func> = (a, b, next) => {
                return next(a * 2, b * 3);
            };
            const middleware2: Middleware<typeof func> = (a, b, next) => {
                return next(a + 1, b + 2);
            };

            const handler = new MiddlewareHandler(func).use(middleware1).use(middleware2);

            expect(handler.execute(1, 2)).toBe(11);
        });
    });

    describe("execute", () => {
        test("executes middleware chain and target function", () => {
            const func = (a: number, b: number) => a + b;
            const middleware: Middleware<typeof func> = (a, b, next) => {
                return next(a * 2, b * 3);
            };

            const handler = new MiddlewareHandler(func).use(middleware);

            expect(handler.execute(1, 2)).toBe(8);
        });
    });

    describe("asFunction", () => {
        test("returns a callable function", () => {
            const func = (a: number, b: number) => a + b;
            const middleware: Middleware<typeof func> = (a, b, next) => {
                return next(a * 2, b * 3);
            };

            const handler = new MiddlewareHandler(func).use(middleware);
            const callable = handler.asFunction();

            expect(callable(1, 2)).toBe(8);
        });

        test("returned function is not affected by subsequent mutations", () => {
            const func = (a: number, b: number) => a + b;
            const middleware1: Middleware<typeof func> = (a, b, next) => {
                return next(a * 2, b * 3);
            };
            const middleware2: Middleware<typeof func> = (a, b, next) => {
                return next(a + 1, b + 2);
            };

            const handler = new MiddlewareHandler(func).use(middleware1);
            const callable = handler.asFunction();
            handler.use(middleware2);

            // If callable was affected, the result would be 11
            expect(callable(1, 2)).toBe(8);
        });
    });
});
