// src/subscribers/placement.subscriber.spec.ts
import assert from "assert";
import { EntityManager } from "typeorm";
import { container } from "../core/container.core";
import { TYPES } from "../core/types.core";
import { Order, OrderRepository } from "../entities/order.entity";
import { PlacementRepository } from "../entities/placement.entity";
import { Product, ProductRepository } from "../entities/product.entity";
import { DatabaseService } from "../services/database.service";
import { generateOrder, generatePlacement, generateProduct } from "../tests/faker.utils";

describe.only("PlacementSubscriber", () => {
  let productRepository: ProductRepository;
  let placementRepository: PlacementRepository;
  let orderRepository: OrderRepository;

  let manager: EntityManager;

  before(async () => {
    const databaseService = container.get<DatabaseService>(TYPES.DatabaseService);
    const connection = await databaseService.getConnection();
    manager = connection.manager;
    productRepository = await databaseService.getRepository(ProductRepository);
    placementRepository = await databaseService.getRepository(PlacementRepository);
    orderRepository = await databaseService.getRepository(OrderRepository);
  });

  it("should update product.quantity after insert", async () => {
    let product = await manager.save(generateProduct({ quantity: 10 }));
    const order = await manager.save(generateOrder());

    const placement = await manager.save(generatePlacement({ order, product, quantity: 2 }));

    product = await manager.findOne(Product, product.id);
    assert.strictEqual(product.quantity, 10 - placement.quantity);

    await manager.remove(placement);
    product = await manager.findOne(Product, product.id);
    assert.strictEqual(product.quantity, 10);
  });

  it("should update order.total after insert", async () => {
    const product = await manager.save(generateProduct({ quantity: 10, price: 5 }));
    let order = await manager.save(generateOrder());

    const placement = generatePlacement({ order, product, quantity: 2 });
    await manager.save(placement);

    order = await manager.findOne(Order, order.id);
    assert.strictEqual(order.total, 2 * product.price);

    await manager.remove(placement);
    order = await manager.findOne(Order, order.id);
    assert.strictEqual(order.total, 0);
  });
});
