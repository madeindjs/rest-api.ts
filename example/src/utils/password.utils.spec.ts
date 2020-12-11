// src/utils/password.utils.spec.ts
import assert from "assert";
import { hashPassword, isPasswordMatch } from "./password.utils";

describe("isPasswordMatch", () => {
  const hash = hashPassword("good");
  it("should match", () => {
    assert.strictEqual(isPasswordMatch(hash, "good"), true);
  });
  it("should not match", () => {
    assert.strictEqual(isPasswordMatch(hash, "bad"), false);
  });
});
