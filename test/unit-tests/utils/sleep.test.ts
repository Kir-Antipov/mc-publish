import { describe, test, expect } from "@jest/globals";
import sleep from "../../../src/utils/sleep";

describe("sleep", () => {
    test("execution continues after the specified delay", async () => {
        const start = new Date();
        await sleep(100);
        const end = new Date();
        const duration = end.getTime() - start.getTime();
        expect(duration).toBeGreaterThan(50);
        expect(duration).toBeLessThan(200);
    });
});

