// src/services/jsonWebToken.service.spec.ts
import assert from "assert";
import { container } from "../core/container.core";
import { TYPES } from "../core/types.core";
import { JsonWebTokenService } from "./jsonWebToken.service";

describe("JsonWebTokenService", () => {
  let jsonWebTokenService: JsonWebTokenService;

  before(() => {
    jsonWebTokenService = container.get(TYPES.JsonWebTokenService);
  });

  it("should encode and decode payload", () => {
    const token = jsonWebTokenService.encode({ userId: 1 });
    const payload = jsonWebTokenService.decode(token);
    assert.strictEqual(payload.userId, 1);
  });
});
