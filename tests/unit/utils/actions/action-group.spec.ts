import { DEFAULT_ACTION_GROUP_DELIMITER } from "@/utils/actions/action-group";

describe("DEFAULT_ACTION_GROUP_DELIMITER", () => {
    test("is defined", () => {
        expect(typeof DEFAULT_ACTION_GROUP_DELIMITER).toBe("string");
    });
});
