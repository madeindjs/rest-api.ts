// src/entities/product.entity.ts
import {
  IsDefined,
  IsInt,
  IsPositive,
  Min,
  validateOrReject,
} from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  EntityRepository,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Repository,
  SelectQueryBuilder,
  UpdateDateColumn,
} from 'typeorm';
import {Placement} from './placement.entity';
import {User} from './user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @IsDefined()
  @Column({type: 'text', nullable: false})
  title: string;

  @IsPositive()
  @IsDefined()
  @Column({type: 'float', nullable: false})
  price: number;

  @Column({type: 'boolean', default: false})
  published: boolean;

  @IsInt()
  @Min(0)
  // @ValidateIf((product, value) => {
  //   console.log(product);
  //   return product.quantity >= 0;
  // })
  @Column({type: 'integer', default: 0})
  quantity: number = 0;

  @Index()
  @ManyToOne(() => User, user => user.products, {onDelete: 'CASCADE'})
  user: User;

  @OneToMany(() => Placement, placement => placement.product)
  placements: Placement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject(this);
  }
}

interface ProductSearchFilters {
  title?: string;
  priceMin?: number;
  priceMax?: number;
}

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
  private perPage: 20;

  public search(filters: ProductSearchFilters): SelectQueryBuilder<Product> {
    const query = this.createQueryBuilder()
      .where('published = TRUE')
      .orderBy('updatedAt', 'DESC');

    if (filters.title !== undefined) {
      query.andWhere('lower(title) LIKE :title', {title: `%${filters.title}%`});
    }

    if (filters.priceMin !== undefined) {
      query.andWhere('price >= :priceMin', {priceMin: filters.priceMin});
    }

    if (filters.priceMax !== undefined) {
      query.andWhere('price <= :priceMax', {priceMax: filters.priceMax});
    }

    return query;
  }

  public paginate(
    query: SelectQueryBuilder<Product>,
    page: number | string,
  ): SelectQueryBuilder<Product> {
    if (page) {
      query.offset(Number(page) * this.perPage);
    }

    return query.limit(this.perPage);
  }
}
