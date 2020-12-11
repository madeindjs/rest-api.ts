// src/controllers/orders.controller.ts
import { Request, response, Response } from "express";
import { inject } from "inversify";
import { controller, httpGet, httpPost, requestBody } from "inversify-express-utils";
import { TYPES } from "../core/types.core";
import { Order, OrderRepository } from "../entities/order.entity";
import { PlacementRepository } from "../entities/placement.entity";
import { ProductRepository } from "../entities/product.entity";
import { User } from "../entities/user.entity";
import { DatabaseService } from "../services/database.service";
import { MailerService } from "../services/mailer.service";
import { ordersSerializer } from "../utils/serializers.utils";

@controller("/orders", TYPES.FetchLoggedUserMiddleware)
export class OrdersController {
  public constructor(
    @inject(TYPES.DatabaseService) private readonly databaseService: DatabaseService,
    @inject(TYPES.MailerService) private readonly mailerService: MailerService
  ) {}

  @httpGet("/")
  public async index({ user }: Request & { user: User }) {
    const repository = await this.databaseService.getRepository(OrderRepository);
    const orders = await repository.find({ user });
    return ordersSerializer.serialize(orders);
  }

  @httpPost("/")
  public async create(
    @requestBody() body: { productIds: number[] },
    { user }: Request & { user: User },
    res: Response
  ) {
    const productRepository = await this.databaseService.getRepository(ProductRepository);
    const orderRepository = await this.databaseService.getRepository(OrderRepository);
    const placementRepository = await this.databaseService.getRepository(PlacementRepository);

    if (!body.productIds?.length) {
      return res.status(400).json({ errors: { productIds: "should be an array of products ids" } });
    }

    const products = await productRepository.findByIds(body.productIds);

    const total = products.reduce((sum, product) => sum + product.price, 0);
    const order = await orderRepository.save({ user, total });

    const placements = products.map((product) => ({ order, product }));
    order.placements = await placementRepository.save(placements);

    await this.mailerService.sendNewOrderEmail(order);

    return res.sendStatus(201);
  }

  @httpGet("/:orderId", TYPES.FetchOrderMiddleware)
  public async show({ order, user }: Request & { order: Order; user: User }, re: Response) {
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
