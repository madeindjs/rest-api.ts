// src/main.ts
import cors from 'cors';
import 'reflect-metadata';
import {container} from './core/container.core';
import {server} from './core/server';
import {TYPES} from './core/types.core';
import {DatabaseService} from './services/database.service';

const port = 3000;

container.get<DatabaseService>(TYPES.DatabaseService).getConnection().then();

server
  .setConfig(app => app.use(cors()))
  .build()
  .listen(port, () => console.log(`Listen on http://localhost:${port}/`));
