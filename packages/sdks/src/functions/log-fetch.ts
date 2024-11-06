import { logger } from '../helpers/logger.js';

export function logFetch(url: string) {
  if (typeof process !== 'undefined' && process.env?.DEBUG) {
    if (String(process.env.DEBUG) == 'true') {
      logger.log(url);
    }
  }
}
