// src/utils/password.utils.ts
import {createHash} from 'crypto';

const salt = 'my private salt';

export function hashPassword(password: string): string {
  return createHash('sha256').update(`${password}_${salt}`).digest('hex');
}

export function isPasswordMatch(hash: string, password: string): boolean {
  return hash === hashPassword(password);
}
