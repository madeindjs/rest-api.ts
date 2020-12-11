// src/entities/placement.entity.ts
import {IsDefined, IsPositive, validateOrReject} from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  EntityRepository,
  ManyToOne,
  PrimaryGeneratedColumn,
  Repository,
} from 'typeorm';
import {Order} from './order.entity';
import {Product} from './product.entity';

@Entity()
export class Placement {
  @PrimaryGeneratedColumn()
  id: number;

  @IsPositive()
  @Column({type: 'integer', default: 0})
  quantity: number = 0;

  @IsDefined()
  @ManyToOne(() => Product, product => product.placements)
  product: Product;

  @IsDefined()
  @ManyToOne(() => Order, order => order.placements)
  order: Order;

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject(this);
  }
}

@EntityRepository(Placement)
export class PlacementRepository extends Repository<Placement> {}
