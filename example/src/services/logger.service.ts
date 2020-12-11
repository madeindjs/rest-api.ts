import {injectable} from 'inversify';

export enum LogLevel {
  Debug = 'DEBUG',
  Info = 'INFO',
  Error = 'ERROR',
  Warning = 'WARNING',
}

@injectable()
export class Logger {
  public log(
    level: 'DEBUG' | 'INFO' | 'ERROR',
    message: string,
    meta: any = {},
  ): void {
    const dateStr = new Date().toISOString();
    const metaStr = JSON.stringify(meta);
    console.log(`${dateStr} - ${level} - ${message} - ${metaStr}`);
  }
}
