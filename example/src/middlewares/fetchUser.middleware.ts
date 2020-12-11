// src/middlewares/fetchUser.middleware.ts
import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { TYPES } from "../core/types.core";
import { User, UserRepository } from "../entities/user.entity";
import { DatabaseService } from "../services/database.service";

@injectable()
export class FetchUserMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.DatabaseService)
    private readonly databaseService: DatabaseService
  ) {
    super();
  }

  public async handler(
    req: Request & { user: User },
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    const userId = req.query.userId ?? req.params.userId;
    const repository = await this.databaseService.getRepository(UserRepository);
    req.user = await repository.findOne(Number(userId));

    if (!req.user) {
      return res.status(404).send("User not found");
    }

    next();
  }
}
