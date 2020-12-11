// src/entities/product.entity.spec.ts
import assert from 'assert';
import {container} from '../core/container.core';
import {TYPES} from '../core/types.core';
import {Product, ProductRepository} from '../entities/product.entity';
import {DatabaseService} from '../services/database.service';
import {generateProduct} from '../tests/faker.utils';

describe('ProductRepository', () => {
  let productRepository: ProductRepository;

  before(async () => {
    const databaseService = container.get<DatabaseService>(
      TYPES.DatabaseService,
    );
    productRepository = await databaseService.getRepository(ProductRepository);
  });

  describe('search', () => {
    let tvPlosmo: Product;
    let computer: Product;
    let tvCheap: Product;
    let unpublishedProduct: Product;

    before(async () => {
      tvPlosmo = await productRepository.save(
        generateProduct({
          title: 'TV Plosmo Philopp',
          price: 9999.99,
          published: true,
        }),
      );
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
      unpublishedProduct = await productRepository.save(
        generateProduct({
          published: false,
        }),
      );
    });

    it('should not include unpublished products', async () => {
      const products = await productRepository.search({});
      assert.ok(products.every(p => p.published));
    });

    it('should filter products by title', async () => {
      const products = await productRepository.search({title: 'tv'});
      assert.ok(products.some(p => p.id === tvPlosmo.id));
      assert.ok(products.some(p => p.id === computer.id) === false);
    });

    it('should filter products by priceMax', async () => {
      const products = await productRepository.search({priceMax: 100});
      assert.ok(products.some(p => p.id === tvCheap.id));
      assert.ok(products.some(p => p.id === tvPlosmo.id) === false);
    });

    it('should filter products by priceMin', async () => {
      const products = await productRepository.search({priceMin: 500});
      assert.ok(products.some(p => p.id === tvPlosmo.id));
      assert.ok(products.some(p => p.id === tvCheap.id) === false);
    });
  });
});
