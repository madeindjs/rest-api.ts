// src/main.ts
import "reflect-metadata";
import { container } from "./core/container.core";
import { server } from "./core/server";
import { TYPES } from "./core/types.core";
import { DatabaseService } from "./services/database.service";

const port = 3000;

container.get<DatabaseService>(TYPES.DatabaseService).getConnection().then();

const app = server.build();
app.listen(port, () =>
  console.log(`Server listen on http://localhost:${port}/`)
);
