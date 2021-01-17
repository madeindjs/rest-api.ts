// src/middlewares/fetchLoggedUser.middleware.ts
import {NextFunction, Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {BaseMiddleware} from 'inversify-express-utils';
import {TYPES} from '../core/types.core';
import {User, UserRepository} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {JsonWebTokenService} from '../services/jsonWebToken.service';

@injectable()
export class FetchLoggedUserMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.DatabaseService)
    private readonly databaseService: DatabaseService,
    @inject(TYPES.JsonWebTokenService)
    private readonly jsonWebTokenService: JsonWebTokenService,
  ) {
    super();
  }

  public async handler(
    req: Request & {user: User},
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> {
    const repository = await this.databaseService.getRepository(UserRepository);
    const token = req.headers.authorization?.replace('bearer ', '');

    if (token === undefined) {
      return res.status(403).send('You must provide an `Authorization` header');
    }

    try {
      const payload = this.jsonWebTokenService.decode(token);
      req.user = await repository.findOneOrFail({
        where: {id: payload.userId},
        relations: ['products'],
      });
    } catch (e) {
      return res.status(403).send('Invalid token');
    }

    next();
  }
}
