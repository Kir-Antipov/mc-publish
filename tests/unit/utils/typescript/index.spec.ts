describe("typescript", () => {
    test("assume that everything is fine, until it's not", () => {
        // The `typescript` module is only used for code generation during
        // TypeScript-to-JavaScript transpilation. Thus, there's no need
        // to expend effort testing code that would cause a compilation
        // error if something was actually wrong.
        //
        // Also, this module is far from perfect by design.
        // It was created to perform a few very specific tasks, not to serve
        // as a drop-in implementation of a TypeScript syntax tree builder.
    });
});
