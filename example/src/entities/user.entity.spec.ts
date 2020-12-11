// src/entities/user.entity.spec.ts
import assert from "assert";
import { hashPassword } from "../utils/password.utils";
import { User } from "./user.entity";

describe("User", () => {
  it("should hash password", () => {
    const user = new User();
    user.password = "toto";
    const expected = hashPassword("toto");
    assert.strictEqual(user.hashedPassword, expected);
  });
});
