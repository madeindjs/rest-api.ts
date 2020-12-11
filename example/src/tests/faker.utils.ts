// src/utils/faker.utils.ts
import { randomBytes } from "crypto";
import { Order } from "../entities/order.entity";
import { Placement } from "../entities/placement.entity";
import { Product } from "../entities/product.entity";
import { User } from "../entities/user.entity";

export function randomString(size: number = 8): string {
  return randomBytes(size).toString("hex");
}

export function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

export function randomInteger(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min) - min);
}

export function generateUser(user?: Partial<User>): User {
  const newUser = new User();
  newUser.email = user?.email ?? `${randomString()}@random.io`;
  newUser.password = newUser.email;

  return newUser;
}

export function generateProduct(product?: Partial<Product>): Product {
  const newProduct = new Product();
  newProduct.price = product?.price ?? Math.random() * 100;
  newProduct.published = product?.published ?? randomBoolean();
  newProduct.title = product?.title ?? randomString();
  newProduct.user = product?.user ?? generateUser();
  newProduct.quantity = product?.quantity ?? randomInteger(1);

  return newProduct;
}

export function generateOrder(order?: Partial<Order>): Order {
  const newOrder = new Order();
  newOrder.user = order?.user ?? generateUser();
  newOrder.total = randomInteger(1); // TODO

  return newOrder;
}

export function generatePlacement(placement?: Partial<Placement>): Placement {
  const newPlacement = new Placement();
  newPlacement.product = placement?.product ?? generateProduct();
  newPlacement.order = placement?.order ?? generateOrder();
  newPlacement.quantity = placement?.quantity ?? randomInteger(1, 5);

  return newPlacement;
}
