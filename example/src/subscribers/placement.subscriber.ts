import { EntityManager, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from "typeorm";
import { Order } from "../entities/order.entity";
import { Placement } from "../entities/placement.entity";

@EventSubscriber()
export class PlacementSubscriber implements EntitySubscriberInterface<Placement> {
  listenTo() {
    return Placement;
  }

  async afterInsert({ entity, manager }: InsertEvent<Placement>) {
    entity.product.quantity -= entity.quantity;
    await manager.save(entity.product);

    await this.updateOrderTotal(manager, entity.order);
  }

  async beforeRemove({ entity, manager }: RemoveEvent<Placement>) {
    entity.product.quantity += entity.quantity;
    await manager.save(entity.product);
  }

  async afterRemove({ entity, manager }: RemoveEvent<Placement>) {
    await this.updateOrderTotal(manager, entity.order);
  }

  private async updateOrderTotal(manager: EntityManager, order: Order) {
    const placements = await manager.find(Placement, { where: { order }, relations: ["product"] });

    order.total = placements.reduce((sum, placement) => sum + placement.quantity * placement.product.price, 0);

    await manager.save(order);
  }
}
