// src/middlewares/fetchUser.middleware.ts
import {NextFunction, Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {BaseMiddleware} from 'inversify-express-utils';
import {TYPES} from '../core/types.core';
import {Order, OrderRepository} from '../entities/order.entity';
import {DatabaseService} from '../services/database.service';

@injectable()
export class FetchOrderMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {
    super();
  }

  public async handler(
    req: Request & {order: Order},
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> {
    const orderId = req.query.orderId ?? req.params.orderId;
    const repository = await this.databaseService.getRepository(
      OrderRepository,
    );
    req.order = await repository.findOne(Number(orderId), {
      relations: ['user'],
    });

    if (!req.order) {
      return res.status(404).send('order not found');
    }

    next();
  }
}
