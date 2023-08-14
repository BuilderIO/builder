import type { ExecutorArgs } from './helpers.js';

export const evaluator = (_args: ExecutorArgs) => {
  throw new Error(
    'Placeholder evaluator not implemented. Make sure the SDK is properly replacing the import to the evaluator with one of edge/node/browser runtime evaluators.'
  );
};
