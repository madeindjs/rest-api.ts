// src/subscribers/placement.subscriber.ts
import {
  EntityManager,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import {Order} from '../entities/order.entity';
import {Placement} from '../entities/placement.entity';
import {Product} from '../entities/product.entity';

@EventSubscriber()
export class PlacementSubscriber
  implements EntitySubscriberInterface<Placement> {
  listenTo() {
    return Placement;
  }

  async afterInsert({entity, manager}: InsertEvent<Placement>) {
    const productId = entity.product.id;
    const product = await manager.findOneOrFail(Product, {id: productId});
    product.quantity -= entity.quantity;
    await manager.save(product);

    await this.updateOrderTotal(manager, entity.order);
  }

  async beforeRemove({entity, manager}: RemoveEvent<Placement>) {
    const productId = entity.product.id;
    const product = await manager.findOneOrFail(Product, {id: productId});
    product.quantity += entity.quantity;
    await manager.save(product);
  }

  async afterRemove({entity, manager}: RemoveEvent<Placement>) {
    await this.updateOrderTotal(manager, entity.order);
  }

  private async updateOrderTotal(manager: EntityManager, order: Order) {
    const result = await manager
      .createQueryBuilder(Placement, 'pl')
      .select('SUM(pl.quantity) * p.price', 'total')
      .innerJoin('pl.order', 'o')
      .innerJoin('pl.product', 'p')
      .where('o.id = :orderId', {orderId: order.id})
      .groupBy('o.id')
      .getRawOne();
    order.total = result?.total ?? 0;

    // const placements = await manager.find(Placement, {
    //   where: {order},
    //   relations: ['product'],
    // });

    // order.total = placements.reduce(
    //   (sum, placement) => sum + placement.quantity * placement.product.price,
    //   0,
    // );

    await manager.save(Order, order);
  }
}
