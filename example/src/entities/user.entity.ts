// src/entities/user.entity.ts
import { IsDefined, IsEmail, validateOrReject } from "class-validator";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  EntityRepository,
  OneToMany,
  PrimaryGeneratedColumn,
  Repository,
  UpdateDateColumn,
} from "typeorm";
import { hashPassword } from "../utils/password.utils";
import { Order } from "./order.entity";
import { Product } from "./product.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsDefined()
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @IsDefined()
  @Column()
  hashedPassword: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  set password(password) {
    if (password) {
      this.hashedPassword = hashPassword(password);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject(this);
  }
}

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
