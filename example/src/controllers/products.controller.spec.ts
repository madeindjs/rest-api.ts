// src/controllers/products.controller.spec.ts
import assert from 'assert';
import {URLSearchParams} from 'url';
import {container} from '../core/container.core';
import {TYPES} from '../core/types.core';
import {Product, ProductRepository} from '../entities/product.entity';
import {User, UserRepository} from '../entities/user.entity';
import {DatabaseService} from '../services/database.service';
import {JsonWebTokenService} from '../services/jsonWebToken.service';
import {generateProduct, generateUser} from '../tests/faker.utils';
import {agent} from '../tests/supertest.utils';

describe('ProductsController', () => {
  let userRepository: UserRepository;
  let productRepository: ProductRepository;
  let jsonWebTokenService: JsonWebTokenService;
  let user: User;
  let stranger: User;
  let jwt: string;
  let strangerJwt: string;
  let product: Product;

  before(async () => {
    jsonWebTokenService = container.get(TYPES.JsonWebTokenService);

    const databaseService = container.get<DatabaseService>(
      TYPES.DatabaseService,
    );
    userRepository = await databaseService.getRepository(UserRepository);
    productRepository = await databaseService.getRepository(ProductRepository);

    stranger = await userRepository.save(generateUser());
    strangerJwt = jsonWebTokenService.encode({userId: stranger.id});
  });

  beforeEach(async () => {
    user = await userRepository.save(generateUser());
    product = await productRepository.save(generateProduct({user}));
    jwt = jsonWebTokenService.encode({userId: user.id});
  });

  describe('index', () => {
    it('should respond 200', done => {
      agent.get('/products').expect(200, done);
    });

    describe('search', () => {
      let computer: Product;
      let tvCheap: Product;

      before(async () => {
        computer = await productRepository.save(
          generateProduct({
            title: 'Azos Zeenbok',
            price: 499.99,
            published: true,
          }),
        );
        tvCheap = await productRepository.save(
          generateProduct({
            title: 'Cheap TV',
            price: 99.99,
            published: true,
          }),
        );
      });

      it('should find cheap TV', () => {
        const params = new URLSearchParams();
        params.append('title', 'tv');
        params.append('priceMin', '50');
        params.append('priceMax', '150');

        return agent
          .get(`/products?${params.toString()}`)
          .expect(200)
          .then(response =>
            assert.ok(
              response.body.data.some(row => row.id === String(tvCheap.id)),
            ),
          );
      });

      it('should find computer', () => {
        const params = new URLSearchParams();
        params.append('title', 'azos');
        params.append('priceMax', '500');

        return agent
          .get(`/products?${params.toString()}`)
          .expect(200)
          .then(response => {
            assert.ok(
              response.body.data.some(row => row.id === String(computer.id)),
              response.body,
            );
          });
      });
    });
  });

  describe('show', () => {
    it('should show product', () => {
      agent
        .get(`/products/${product.id}`)
        .expect(200)
        .then(response => {
          assert.strictEqual(
            response.body.data.attributes.title,
            product.title,
          );
          assert.strictEqual(
            response.body.included[0].attributes.email,
            product.user.email,
          );
        });
    });
  });

  describe('create', () => {
    it('should create product', done => {
      const {title, price, published} = generateProduct();
      agent
        .post('/products')
        .set('Authorization', jwt)
        .send({title, price, published})
        .expect(201, done);
    });

    it('should not create product without auth', done => {
      const {title, price, published} = generateProduct();
      agent.post('/products').send({title, price, published}).expect(403, done);
    });

    it('should not create product with missing title', done => {
      const {price, published} = generateProduct();
      agent
        .post('/products')
        .set('Authorization', strangerJwt)
        .send({price, published})
        .expect(400, done);
    });

    it('should not create product with missing title', done => {
      const {price, published} = generateProduct();
      agent
        .post('/products')
        .set('Authorization', strangerJwt)
        .send({price, published})
        .expect(400, done);
    });
  });

  describe('update', () => {
    it('should update product', done => {
      const {title, price, published} = generateProduct();
      agent
        .put(`/products/${product.id}`)
        .set('Authorization', jwt)
        .send({title, price, published})
        .expect(204, done);
    });

    it('should not update product of other users', done => {
      const {price, published} = generateProduct();
      agent
        .put(`/products/${product.id}`)
        .set('Authorization', strangerJwt)
        .send({price, published})
        .expect(403, done);
    });

    it('should not update product without auth', done => {
      const {price, published} = generateProduct();
      agent
        .put(`/products/${product.id}`)
        .send({price, published})
        .expect(403, done);
    });
  });

  describe('destroy', () => {
    it('should destroy product', done => {
      const jwt = jsonWebTokenService.encode({userId: user.id});
      agent
        .delete(`/products/${product.id}`)
        .set('Authorization', jwt)
        .expect(204, done);
    });

    it('should not destroy product without auth', done => {
      agent.delete(`/products/${product.id}`).expect(403, done);
    });

    it('should not destroy of other users', done => {
      agent
        .delete(`/products/${product.id}`)
        .set('Authorization', strangerJwt)
        .expect(403, done);
    });
  });
});
