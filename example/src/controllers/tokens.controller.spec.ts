// src/controllers/tokens.controller.spec.ts
import {container} from '../core/container.core';
import {TYPES} from '../core/types.core';
import {User, UserRepository} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {agent} from '../tests/supertest.utils';

describe('TokensController', () => {
  let user: User;

  before(async () => {
    const database = container.get<DatabaseService>(TYPES.DatabaseService);
    const userRepository = await database.getRepository(UserRepository);

    const newUser = new User();
    newUser.email = `${new Date().getTime()}@test.io`;
    newUser.password = 'p@ssw0rd';
    user = await userRepository.save(newUser);
  });

  describe('create', () => {
    it('should get token', done => {
      agent
        .post('/tokens')
        .send({email: user.email, password: 'p@ssw0rd'})
        .expect(200, done);
    });

    it('should not get token user with bad password', done => {
      agent
        .post('/tokens')
        .send({email: user.email, password: 'bad password'})
        .expect(400, done);
    });

    it('should not create token with nonexisting email', done => {
      agent
        .post('/tokens')
        .send({email: user.email, password: 'bad password'})
        .expect(400, done);
    });
  });
});
