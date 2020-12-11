// src/services/jsonWebToken.service.ts
import { injectable } from "inversify";
import { sign, verify } from "jsonwebtoken";
import { User } from "../entities/user.entity";

@injectable()
export class JsonWebTokenService {
  private readonly JWT_PRIVATE_KEY = "123456789";

  encodeUser(user: User): string {
    return this.encode({ userId: user.id });
  }

  encode(payload: Object): string {
    return sign(payload, this.JWT_PRIVATE_KEY, { expiresIn: "1 day" });
  }

  decode(token: string): any {
    return verify(token, this.JWT_PRIVATE_KEY);
  }
}
