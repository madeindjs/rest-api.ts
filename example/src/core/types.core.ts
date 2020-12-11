// src/core/types.core.ts
export const TYPES = {
  Logger: Symbol.for('Logger'),
  DatabaseService: Symbol.for('DatabaseService'),
  JsonWebTokenService: Symbol.for('JsonWebTokenService'),
  MailerService: Symbol.for('MailerService'),
  // Middlewares
  FetchUserMiddleware: Symbol.for('FetchUserMiddleware'),
  FetchProductMiddleware: Symbol.for('FetchProductMiddleware'),
  FetchOrderMiddleware: Symbol.for('FetchOrderMiddleware'),
  FetchLoggedUserMiddleware: Symbol.for('FetchLoggedUserMiddleware'),
};
