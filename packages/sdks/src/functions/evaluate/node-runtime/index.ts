import { logger } from '../../../helpers/logger.js';
import { isBrowser } from '../../is-browser.js';
import { isNonNodeServer } from '../../is-non-node-server.js';

export const evaluator = async () => {
  if (!isBrowser() && !isNonNodeServer()) {
    const mod = await import('./node-runtime.js');
    return mod.runInNode;
  } else {
    logger.warn(
      'nodeEvaluator should not be called in the browser or non-node server'
    );
    return undefined;
  }
};
