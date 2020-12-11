// src/core/container.core.ts
import { Container } from "inversify";
import "../controllers/home.controller";
import "../controllers/orders.controller";
import "../controllers/products.controller";
import "../controllers/tokens.controller";
import "../controllers/users.controller";
import { FetchLoggedUserMiddleware } from "../middlewares/fetchLoggedUser.middleware";
import { FetchOrderMiddleware } from "../middlewares/fetchOrder.middleware";
import { FetchProductMiddleware } from "../middlewares/fetchProduct.middleware";
import { FetchUserMiddleware } from "../middlewares/fetchUser.middleware";
import { DatabaseService } from "../services/database.service";
import { JsonWebTokenService } from "../services/jsonWebToken.service";
import { Logger } from "../services/logger.service";
import { MailerService } from "../services/mailer.service";
import { TYPES } from "./types.core";

export const container = new Container();
// services
container.bind(TYPES.Logger).to(Logger);
container.bind(TYPES.DatabaseService).to(DatabaseService);
container.bind(TYPES.JsonWebTokenService).to(JsonWebTokenService);
container.bind(TYPES.MailerService).to(MailerService);
// middlewares
container.bind(TYPES.FetchProductMiddleware).to(FetchProductMiddleware);
container.bind(TYPES.FetchOrderMiddleware).to(FetchOrderMiddleware);
container.bind(TYPES.FetchUserMiddleware).to(FetchUserMiddleware);
container.bind(TYPES.FetchLoggedUserMiddleware).to(FetchLoggedUserMiddleware);
