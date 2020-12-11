// src/controllers/tokens.controller.ts
import {Request, Response} from 'express';
import {inject} from 'inversify';
import {controller, httpPost, requestBody} from 'inversify-express-utils';
import {TYPES} from '../core/types.core';
import {UserRepository} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {JsonWebTokenService} from '../services/jsonWebToken.service';
import {isPasswordMatch} from '../utils/password.utils';

@controller('/tokens')
export class TokensController {
  public constructor(
    @inject(TYPES.JsonWebTokenService)
    private readonly jsonWebTokenService: JsonWebTokenService,
    @inject(TYPES.DatabaseService)
    private readonly database: DatabaseService,
  ) {}

  @httpPost('')
  public async create(
    @requestBody() body: {email: string; password: string},
    req: Request,
    res: Response,
  ) {
    const repository = await this.database.getRepository(UserRepository);
    const user = await repository.findOne({email: body.email});

    if (!user) {
      return res.sendStatus(400);
    }

    if (isPasswordMatch(user.hashedPassword, body.password)) {
      const token = this.jsonWebTokenService.encode({
        userId: user.id,
        email: user.email,
      });
      return res.json({token});
    }

    return res.sendStatus(400);
  }
}
