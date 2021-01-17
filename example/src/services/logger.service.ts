import {injectable} from 'inversify';

export enum LogLevel {
  Debug = 'DEBUG',
  Info = 'INFO',
  Error = 'ERROR',
  Warning = 'WARNING',
}

@injectable()
export class Logger {
  public log(level: 'DEBUG' | 'INFO' | 'ERROR', message: string): void {
    const time = new Date().toISOString();
    console.log(`${time} - ${level} - ${message}`);
  }
}
