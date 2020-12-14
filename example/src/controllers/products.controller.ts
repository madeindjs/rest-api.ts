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
import {Product, ProductRepository} from '../entities/product.entity';
import {User} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {paginate} from '../services/paginate.service';
import {productsSerializer} from '../utils/serializers.utils';

@controller('/products')
export class ProductController {
  public constructor(
    @inject(TYPES.DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {}

  @httpGet('/')
  public async index(
    @requestParam('page') page: string = undefined,
    req: Request,
  ) {
    const repository = await this.databaseService.getRepository(
      ProductRepository,
    );

    return paginate(repository.search(req.query), productsSerializer, req);
  }

  @httpPost('/', TYPES.FetchLoggedUserMiddleware)
  public async create(
    @requestBody() body: Partial<Product>,
    req: Request & {user: User},
    res: Response,
  ) {
    const repository = await this.databaseService.getRepository(
      ProductRepository,
    );
    const product = new Product();
    product.title = body.title;
    product.published = body.published;
    product.price = Number(body.price);
    product.user = req.user;

    const errors = await validate(product);

    if (errors.length !== 0) {
      return res.status(400).json({errors});
    }

    await repository.save(product);
    return res.sendStatus(201);
  }

  @httpGet('/:productId', TYPES.FetchProductMiddleware)
  public async show(req: Request & {product: Product}) {
    return productsSerializer.serialize(req.product);
  }

  @httpPut(
    '/:productId',
    TYPES.FetchLoggedUserMiddleware,
    TYPES.FetchProductMiddleware,
  )
  public async update(
    @requestBody() body: Partial<Product>,
    req: Request & {user: User; product: Product},
    res: Response,
  ) {
    if (!this.canEditProduct(req.user, req.product)) {
      return res.sendStatus(403);
    }

    req.product.title = body.title;
    req.product.published = body.published;
    req.product.price = Number(body.price);

    const errors = await validate(req.product);

    if (errors.length !== 0) {
      return res.status(400).json({errors});
    }
    const repository = await this.databaseService.getRepository(
      ProductRepository,
    );
    await repository.save(req.product);
    return res.sendStatus(204);
  }

  @httpDelete(
    '/:productId',
    TYPES.FetchLoggedUserMiddleware,
    TYPES.FetchProductMiddleware,
  )
  public async destroy(
    req: Request & {user: User; product: Product},
    res: Response,
  ) {
    if (!this.canEditProduct(req.user, req.product)) {
      return res.sendStatus(403);
    }
    const repository = await this.databaseService.getRepository(
      ProductRepository,
    );
    await repository.delete(req.product);
    return res.sendStatus(204);
  }

  private canEditProduct(user: User, product: Product): boolean {
    return user.id === product.user.id;
  }
}
