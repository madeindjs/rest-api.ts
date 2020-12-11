// src/controllers/home.controller.ts
import {validate} from 'class-validator';
import {Request, Response} from 'express';
import {inject} from 'inversify';
import {
  controller,
  httpDelete,
  httpGet,
  httpPost,
  httpPut,
  requestBody,
  requestParam,
} from 'inversify-express-utils';
import {TYPES} from '../core/types.core';
import {User, UserRepository} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {userSerializer} from '../utils/serializers.utils';

@controller('/users')
export class UsersController {
  public constructor(
    @inject(TYPES.DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {}

  @httpGet('/')
  public async index() {
    const repository = await this.databaseService.getRepository(UserRepository);
    const users = await repository.find();
    return userSerializer.serialize(users);
  }

  @httpPost('/')
  public async create(
    @requestBody() body: Partial<User>,
    req: Request,
    res: Response,
  ) {
    const repository = await this.databaseService.getRepository(UserRepository);
    const user = new User();
    user.email = body.email;
    user.password = body.password;

    const errors = await validate(user);

    if (errors.length !== 0) {
      return res.status(400).json({errors});
    }

    await repository.save(user);
    return res.sendStatus(201);
  }

  @httpGet('/:userId', TYPES.FetchLoggedUserMiddleware)
  public async show(
    @requestParam('userId') userId: string,
    req: Request & {user: User},
    res: Response,
  ): Promise<User | Response> {
    if (Number(userId) !== req.user.id) {
      return res.sendStatus(403);
    }
    return userSerializer.serialize(req.user);
  }

  @httpPut('/:userId', TYPES.FetchLoggedUserMiddleware)
  public async update(
    @requestParam('userId') userId: string,
    @requestBody() body: Partial<User>,
    req: Request & {user: User},
    res: Response,
  ) {
    if (Number(userId) !== req.user.id) {
      return res.sendStatus(403);
    }

    const repository = await this.databaseService.getRepository(UserRepository);
    req.user.email = body.email ?? req.user.email;
    req.user.password = body.password ?? req.user.password;

    const errors = await validate(req.user);

    if (errors.length !== 0) {
      return res.status(400).json({errors});
    }
    await repository.save(req.user);
    return res.sendStatus(204);
  }

  @httpDelete('/:userId', TYPES.FetchLoggedUserMiddleware)
  public async destroy(
    @requestParam('userId') userId: string,
    req: Request & {user: User},
    res: Response,
  ) {
    if (Number(userId) !== req.user.id) {
      return res.sendStatus(403);
    }
    const repository = await this.databaseService.getRepository(UserRepository);
    await repository.delete(req.user.id);
    return res.sendStatus(204);
  }
}
