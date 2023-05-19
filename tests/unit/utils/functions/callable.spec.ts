import { CALL, makeCallable } from "@/utils/functions/callable";

describe("makeCallable", () => {
    test("makes an object callable", () => {
        const obj = {
            [CALL]: (a: number, b: number) => a + b,
        };

        const callable = makeCallable(obj);

        expect(callable(1, 2)).toBe(3);
    });

    test("preserves object properties", () => {
        const obj = {
            foo: 42,

            [CALL](): number {
                return this.foo;
            },
        };

        const callable = makeCallable(obj);

        expect(callable()).toBe(42);
        expect(callable.foo).toBe(42);
    });

    test("preserves object prototype", () => {
        class FooClass {
            foo: number;

            constructor(foo: number) {
                this.foo = foo;
            }

            [CALL](): number {
                return this.foo;
            }
        }

        const obj = new FooClass(42);
        const callable = makeCallable(obj);

        expect(callable).toBeInstanceOf(FooClass);
        expect(callable.foo).toBe(42);
        expect(callable()).toBe(42);
    });
});
