// src/scripts/loadFakeData.script.ts
import 'reflect-metadata';
import {EntityManager} from 'typeorm';
import {container} from '../core/container.core';
import {TYPES} from '../core/types.core';
import {Order} from '../entities/order.entity';
import {Placement} from '../entities/placement.entity';
import {Product} from '../entities/product.entity';
import {User} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {Logger} from '../services/logger.service';
import {
  generateOrder,
  generateProduct,
  generateUser,
} from '../tests/faker.utils';

async function createOrder(manager: EntityManager) {
  const user = await manager.save(User, generateUser());
  const owner = await manager.save(User, generateUser());
  const order = await manager.save(Order, generateOrder({user}));

  for (let j = 0; j < 5; j++) {
    const product = await manager.save(Product, generateProduct({user: owner}));
    await manager.save(Placement, {order, product, quantity: 2});
  }
}

async function main() {
  const {manager} = await container
    .get<DatabaseService>(TYPES.DatabaseService)
    .getConnection();
  const logger = container.get<Logger>(TYPES.Logger);

  for (let i = 0; i < 100; i++) {
    logger.log('DEBUG', `Inserting ${i} / 100`);
    await createOrder(manager);
  }
}

if (require.main === module) {
  main().then().catch(console.error);
}
