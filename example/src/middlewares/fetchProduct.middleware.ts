// src/middlewares/fetchUser.middleware.ts
import {NextFunction, Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {BaseMiddleware} from 'inversify-express-utils';
import {TYPES} from '../core/types.core';
import {Product, ProductRepository} from '../entities/product.entity';
import {DatabaseService} from '../services/database.service';

@injectable()
export class FetchProductMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {
    super();
  }

  public async handler(
    req: Request & {product: Product},
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> {
    const productId = req.query.productId ?? req.params.productId;
    const repository = await this.databaseService.getRepository(
      ProductRepository,
    );
    req.product = await repository.findOne(Number(productId), {
      relations: ['user'],
    });

    if (!req.product) {
      return res.status(404).send('product not found');
    }

    next();
  }
}
