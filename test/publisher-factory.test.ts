import { describe, test, expect } from "@jest/globals";
import PublisherFactory from "../src/publishing/publisher-factory";
import PublisherTarget from "../src/publishing/publisher-target";
import { getConsoleLogger } from "../src/utils/logger-utils";

describe("PublisherFactory.create", () => {
    test("factory can create publisher for every PublisherTarget value", () => {
        const factory = new PublisherFactory();
        for (const target of PublisherTarget.getValues()) {
            const options = {};
            const logger = getConsoleLogger();
            const publisher = factory.create(target, options, logger);
            expect(publisher.target).toStrictEqual(target);
            expect((<any>publisher).options).toStrictEqual(options);
            expect((<any>publisher).logger).toStrictEqual(logger);
        }
    });

    test("every publisher has logger object", () => {
        const factory = new PublisherFactory();
        for (const target of PublisherTarget.getValues()) {
            const options = {};
            const publisher = factory.create(target, options);
            expect(publisher.target).toStrictEqual(target);
            expect((<any>publisher).options).toStrictEqual(options);
            expect((<any>publisher).logger).toBeTruthy();
        }
    });

    test("the method throws on invalid PublisherTarget value", () => {
        const factory = new PublisherFactory();
        expect(() => factory.create(-1, {})).toThrow();
    });

    test("the method throws on invalid options", () => {
        const factory = new PublisherFactory();
        const invalidOptions = [null, undefined, "", true, false, () => {}];
        for (const target of PublisherTarget.getValues()) {
            for (const options of invalidOptions) {
                expect(() => factory.create(target, <any>options)).toThrow();
            }
        }
    });
});
