import { describe, test, expect } from "@jest/globals";
import PublisherFactory from "../src/publishing/publisher-factory";
import PublisherTarget from "../src/publishing/publisher-target";
import { getConsoleLogger } from "../src/utils/logger-utils";

describe("PublisherFactory.create", () => {
    test("factory can create publisher for every PublisherTarget value", () => {
        const factory = new PublisherFactory();
        for (const target of PublisherTarget.getValues()) {
            const logger = getConsoleLogger();
            const publisher = factory.create(target, logger);
            expect(publisher.target).toStrictEqual(target);
            expect((<any>publisher).logger).toStrictEqual(logger);
        }
    });

    test("every publisher has logger object", () => {
        const factory = new PublisherFactory();
        for (const target of PublisherTarget.getValues()) {
            const publisher = factory.create(target);
            expect(publisher.target).toStrictEqual(target);
            expect((<any>publisher).logger).toBeTruthy();
        }
    });

    test("the method throws on invalid PublisherTarget value", () => {
        const factory = new PublisherFactory();
        expect(() => factory.create(-1)).toThrow();
    });
});
