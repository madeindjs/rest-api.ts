// src/scripts/loadFakeData.script.ts
import 'reflect-metadata';
import {container} from '../core/container.core';
import {TYPES} from '../core/types.core';
import {Product} from '../entities/product.entity';
import {User} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {Logger} from '../services/logger.service';
import {generateProduct, generateUser} from '../tests/faker.utils';

async function main() {
  const {manager} = await container
    .get<DatabaseService>(TYPES.DatabaseService)
    .getConnection();
  const logger = container.get<Logger>(TYPES.Logger);

  const user = await manager.save(User, generateUser());

  for (let i = 0; i < 100_000; i++) {
    logger.log('DEBUG', `Inserting ${i}/ 100 000`);
    await manager.save(Product, generateProduct({user}));
  }
}

if (require.main === module) {
  main().then().catch(console.error);
}
