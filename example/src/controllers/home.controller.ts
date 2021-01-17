// src/controllers/home.controller.ts
import {Request, Response} from 'express';
import {inject} from 'inversify';
import {controller, httpGet} from 'inversify-express-utils';
import {TYPES} from '../core/types.core';
import {Logger} from '../services/logger.service';

@controller('/')
export class HomeController {
  public constructor(@inject(TYPES.Logger) private readonly logger: Logger) {}

  @httpGet('')
  public index(req: Request, res: Response) {
    this.logger.log('INFO', 'Get Home.index');
    return res.send('Hello world');
  }
}
