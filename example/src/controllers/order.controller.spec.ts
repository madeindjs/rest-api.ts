// src/controllers/orders.controller.spec.ts
import assert from 'assert';
import 'mocha';
import {container} from '../core/container.core';
import {TYPES} from '../core/types.core';
import {Order, OrderRepository} from '../entities/order.entity';
import {ProductRepository} from '../entities/product.entity';
import {User, UserRepository} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {JsonWebTokenService} from '../services/jsonWebToken.service';
import {FakeMailerService} from '../tests/fakeMailer.service';
import {
  generateOrder,
  generateProduct,
  generateUser,
} from '../tests/faker.utils';
import {agent} from '../tests/supertest.utils';

describe('OrderController', () => {
  let userRepository: UserRepository;
  let orderRepository: OrderRepository;
  let productRepository: ProductRepository;
  let jsonWebTokenService: JsonWebTokenService;
  let user: User;
  let stranger: User;
  let jwt: string;
  let strangerJwt: string;
  let order: Order;

  before(async () => {
    container.rebind(TYPES.MailerService).to(FakeMailerService);
    jsonWebTokenService = container.get(TYPES.JsonWebTokenService);

    const databaseService = container.get<DatabaseService>(
      TYPES.DatabaseService,
    );
    userRepository = await databaseService.getRepository(UserRepository);
    orderRepository = await databaseService.getRepository(OrderRepository);
    productRepository = await databaseService.getRepository(ProductRepository);

    stranger = await userRepository.save(generateUser());
    strangerJwt = jsonWebTokenService.encode({userId: stranger.id});
  });

  beforeEach(async () => {
    user = await userRepository.save(generateUser());
    order = await orderRepository.save(generateOrder({user}));
    jwt = jsonWebTokenService.encode({userId: user.id});
  });

  describe('index', () => {
    it('should forbid orders without auth', () =>
      agent.get('/orders').expect(403));

    it('should get orders of user', () =>
      agent
        .get('/orders')
        .set('Authorization', jwt)
        .expect(200)
        .then(({body}) =>
          assert.ok(body.data.some(({id}) => id === String(order.id))),
        ));
  });

  describe('show', () => {
    it('should forbid show order for other users', () => {
      agent
        .get(`/orders/${order.id}`)
        .set('Authorization', strangerJwt)
        .expect(403);
    });

    it('should show order', () => {
      agent
        .get(`/orders/${order.id}`)
        .set('Authorization', jwt)
        .expect(200)
        .then(({body}) => assert.strictEqual(body.data.id, String(order.id)));
    });
  });

  describe('create', () => {
    let productsParams;

    before(async () => {
      const product1 = await productRepository.save(generateProduct());
      const product2 = await productRepository.save(generateProduct());

      productsParams = [
        {id: product1.id, quantity: 1},
        {id: product2.id, quantity: 1},
      ];
    });

    it('should create order', () =>
      agent
        .post('/orders')
        .set('Authorization', jwt)
        .send({products: productsParams})
        .expect(201));

    it('should not create product without auth', () =>
      agent.post('/orders').send({products: productsParams}).expect(403));

    it('should not create order with missing products', () =>
      agent
        .post('/orders')
        .set('Authorization', jwt)
        .send({products: []})
        .expect(400));
  });

  describe.skip('update', () => {
    it('should update order', done => {
      const {title, price, published} = generateProduct();
      agent
        .put(`/orders/${order.id}`)
        .set('Authorization', jwt)
        .send({title, price, published})
        .expect(204, done);
    });

    it('should not update product of other users', done => {
      const {price, published} = generateProduct();
      agent
        .put(`/orders/${order.id}`)
        .set('Authorization', strangerJwt)
        .send({price, published})
        .expect(403, done);
    });

    it('should not update product without auth', done => {
      const {price, published} = generateProduct();
      agent
        .put(`/orders/${order.id}`)
        .send({price, published})
        .expect(403, done);
    });
  });

  describe.skip('destroy', () => {
    it('should destroy order', done => {
      const jwt = jsonWebTokenService.encode({userId: user.id});
      agent
        .delete(`/orders/${order.id}`)
        .set('Authorization', jwt)
        .expect(204, done);
    });

    it('should not destroy product without auth', done => {
      agent.delete(`/orders/${order.id}`).expect(403, done);
    });

    it('should not destroy of other users', done => {
      agent
        .delete(`/orders/${order.id}`)
        .set('Authorization', strangerJwt)
        .expect(403, done);
    });
  });
});
