import { logger } from '../helpers/logger';

export function logFetch(url: string) {
  if (String(process.env.DEBUG) == 'true') {
    logger.log(url);
  }
}
