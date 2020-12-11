// src/core/server.ts
import * as bodyParser from 'body-parser';
import {InversifyExpressServer} from 'inversify-express-utils';
import {container} from './container.core';

export const server = new InversifyExpressServer(container);
server.setConfig(app => {
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
});
