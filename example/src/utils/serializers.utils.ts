// src/utils/serializers.utils.ts
import { Serializer } from "jsonapi-serializer";

export const userSerializer = new Serializer("users", {
  attributes: ["email", "products"],
  included: true,
  products: {
    ref: "id",
    attributes: ["title", "price", "published"],
    included: true,
  },
} as any);

export const productsSerializer = new Serializer("products", {
  attributes: ["title", "price", "published", "user"],
  included: true,
  user: {
    ref: "id",
    included: true,
    attributes: ["email"],
  },
} as any);

export const ordersSerializer = new Serializer("orders", {
  attributes: ["total", "createdAt", "updatedAt"],
} as any);
