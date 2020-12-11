// src/entities/order.entity.ts
import { IsDefined, IsPositive, validateOrReject } from "class-validator";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  EntityRepository,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Repository,
  UpdateDateColumn,
} from "typeorm";
import { Placement } from "./placement.entity";
import { User } from "./user.entity";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @IsDefined()
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => Placement, (placement) => placement.order)
  placements: Placement[];

  @IsPositive()
  @Column({ type: "float", unsigned: true })
  total: number;

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

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {}
