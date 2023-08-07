import { logger } from '../../../helpers/logger.js';
import { isBrowser } from '../../is-browser.js';
import { isNonNodeServer } from '../../is-non-node-server.js';

/**
 * We need to lazy-load this module so it doesn't leak into the browser, as it is massive and not needed there.
 * https://css-tricks.com/dynamic-conditional-imports/
 */
let runInNode: typeof import('./node-runtime.js').runInNode;

if (!isBrowser() && !isNonNodeServer()) {
  import('./node-runtime.js')
    .then((m) => {
      runInNode = m.runInNode;
    })
    .catch((err) => {
      const ERROR_MESSAGE = `Error importing \`isolated-vm\` for Node.js runtimes. Make sure \`isolated-vm\` is installed.
    Read more here: https://github.com/BuilderIO/builder/tree/main/packages/sdks/README.md#non-nodejs-runtimes-edge-serverless
    `;
      logger.error(ERROR_MESSAGE, err);
      runInNode = (..._args) => {
        logger.error(ERROR_MESSAGE);
        return undefined;
      };
    });
}

export { runInNode };
