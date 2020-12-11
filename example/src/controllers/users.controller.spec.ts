// src/controllers/users.controller.spec.ts
import assert from 'assert';
import {container} from '../core/container.core';
import {TYPES} from '../core/types.core';
import {ProductRepository} from '../entities/product.entity';
import {User, UserRepository} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {JsonWebTokenService} from '../services/jsonWebToken.service';
import {generateProduct, generateUser} from '../tests/faker.utils';
import {agent} from '../tests/supertest.utils';

describe('UsersController', () => {
  let userRepository: UserRepository;
  let productRepository: ProductRepository;
  let jsonWebTokenService: JsonWebTokenService;
  let user: User;
  let jwt: string;

  before(async () => {
    jsonWebTokenService = container.get(TYPES.JsonWebTokenService);

    const databaseService = container.get<DatabaseService>(
      TYPES.DatabaseService,
    );
    userRepository = await databaseService.getRepository(UserRepository);
    productRepository = await databaseService.getRepository(ProductRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(generateUser());
    const product = await productRepository.save(generateProduct({user}));
    user.products = [product];
    jwt = jsonWebTokenService.encode({userId: user.id});
  });

  describe('index', () => {
    it('should respond 200', done => {
      agent.get('/users').expect(200, done);
    });
  });

  describe('show', () => {
    it('should not show user other user', done => {
      agent.get(`/users/${user.id}`).expect(403, done);
    });

    it('should show my profile', () => {
      return agent
        .get(`/users/${user.id}`)
        .set('Authorization', jwt)
        .expect(200)
        .then(response => {
          assert.strictEqual(response.body.data.attributes.email, user.email);
          assert.strictEqual(
            response.body.included[0].attributes.title,
            user.products[0].title,
          );
        });
    });
  });

  describe('create', () => {
    it('should create user', done => {
      const {email} = generateUser();
      agent.post('/users').send({email, password: 'toto'}).expect(201, done);
    });

    it('should not create user with missing email', done => {
      const {email} = generateUser();
      agent.post('/users').send({email}).expect(400, done);
    });
  });

  describe('update', () => {
    it('should not update other user', done => {
      agent.put(`/users/${user.id}`).send({password: 'test'}).expect(403, done);
    });

    it('should update my profile', done => {
      agent
        .put(`/users/${user.id}`)
        .set('Authorization', jwt)
        .send({password: 'test'})
        .expect(204, done);
    });
  });

  describe('destroy', () => {
    it('should not destroy other user', done => {
      agent.delete(`/users/${user.id}`).expect(403, done);
    });

    it('should delete my profile', done => {
      agent
        .delete(`/users/${user.id}`)
        .set('Authorization', jwt)
        .expect(204, done);
    });
  });
});
