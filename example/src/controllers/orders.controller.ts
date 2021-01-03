// src/controllers/orders.controller.ts
import {Request, response, Response} from 'express';
import {inject} from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  requestBody,
} from 'inversify-express-utils';
import {TYPES} from '../core/types.core';
import {Order} from '../entities/order.entity';
import {Placement} from '../entities/placement.entity';
import {Product} from '../entities/product.entity';
import {User} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {MailerService} from '../services/mailer.service';
import {paginate} from '../services/paginate.service';
import {ordersSerializer} from '../utils/serializers.utils';

@controller('/orders', TYPES.FetchLoggedUserMiddleware)
export class OrdersController {
  public constructor(
    @inject(TYPES.DatabaseService)
    private readonly databaseService: DatabaseService,
    @inject(TYPES.MailerService) private readonly mailerService: MailerService,
  ) {}

  @httpGet('/')
  public async index(req: Request & {user: User}) {
    const {manager} = await this.databaseService.getConnection();

    return paginate(
      manager
        .createQueryBuilder(Order, 'o')
        .where('o.user = :user', {user: req.user.id}),
      ordersSerializer,
      req,
    );
  }

  @httpPost('/')
  public async create(
    @requestBody() body: {products: {id: number; quantity: number}[]},
    {user}: Request & {user: User},
    res: Response,
  ) {
    const {manager} = await this.databaseService.getConnection();

    if (!body.products?.length) {
      return res.status(400).json({
        errors: {
          products: 'should be an array of `{id, quantity}`',
        },
      });
    }

    const order = await manager.save(Order, {
      user,
      total: 0,
      placements: [],
    } as Order);

    for (const {id, quantity} of body.products) {
      const placement = new Placement();
      placement.product = await manager.findOneOrFail(Product, {id});
      placement.order = order;
      placement.quantity = quantity;

      order.placements.push(await manager.save(Placement, placement));
    }

    await this.mailerService.sendNewOrderEmail(order);
    return res.sendStatus(201);
  }

  @httpGet('/:orderId', TYPES.FetchOrderMiddleware)
  public async show(
    {order, user}: Request & {order: Order; user: User},
    re: Response,
  ) {
    if (order.user.id !== user.id) {
      return response.sendStatus(403);
    }
    return ordersSerializer.serialize(order);
  }

  // @httpPut("/:orderId", TYPES.FetchLoggedUserMiddleware, TYPES.FetchProductMiddleware)
  // public async update(
  //   @requestBody() body: Partial<Product>,
  //   req: Request & { user: User; product: Product },
  //   res: Response
  // ) {
  //   if (!this.canEditProduct(req.user, req.product)) {
  //     return res.sendStatus(403);
  //   }

  //   req.product.title = body.title;
  //   req.product.published = body.published;
  //   req.product.price = Number(body.price);

  //   const errors = await validate(req.product);

  //   if (errors.length !== 0) {
  //     return res.status(400).json({ errors });
  //   }
  //   const repository = await this.databaseService.getRepository(ProductRepository);
  //   await repository.save(req.product);
  //   return res.sendStatus(204);
  // }

  // @httpDelete("/:orderId", TYPES.FetchLoggedUserMiddleware, TYPES.FetchProductMiddleware)
  // public async destroy(req: Request & { user: User; product: Product }, res: Response) {
  //   if (!this.canEditProduct(req.user, req.product)) {
  //     return res.sendStatus(403);
  //   }
  //   const repository = await this.databaseService.getRepository(ProductRepository);
  //   await repository.delete(req.product);
  //   return res.sendStatus(204);
  // }

  // private canEditProduct(user: User, product: Product): boolean {
  //   return user.id === product.user.id;
  // }
}
