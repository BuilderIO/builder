import { logger } from '../../../helpers/logger.js';
import { isNonNodeServer } from '../../is-non-node-server.js';

/**
 * We need to lazy-load this module so it doesn't leak into the browser, as it is massive and not needed there.
 * https://css-tricks.com/dynamic-conditional-imports/
 */
let runInNonNode: typeof import('./non-node-runtime.js').runInNonNode;

if (isNonNodeServer()) {
  import('./non-node-runtime.js')
    .then((m) => {
      runInNonNode = m.runInNonNode;
    })
    .catch((err) => {
      const ERROR_MESSAGE = `Error importing JS interpreter for non-Node.js runtimes. Make sure \`js-interpreter\` is installed.
      Read more here: https://github.com/BuilderIO/builder/tree/main/packages/sdks/README.md#non-nodejs-runtimes-edge-serverless
      `;
      logger.error(ERROR_MESSAGE, err);
      runInNonNode = (..._args) => {
        logger.error(ERROR_MESSAGE);
        return undefined;
      };
    });
}

export { runInNonNode };
