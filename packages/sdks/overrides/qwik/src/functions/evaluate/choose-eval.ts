import { evaluator } from 'placeholder-runtime';
import { runInBrowser } from './browser-runtime/browser.js';
import type { ExecutorArgs } from './helpers.js';

// we need to use isServer for tree-shaking to work, hence overriding this file for Qwik.
import { isServer } from '@builder.io/qwik/build';

/**
 * Even though we have separate runtimes for browser/node/edge, sometimes frameworks will
 * end up sending the server runtime code to the browser (most notably in dev mode).
 */
export const chooseBrowserOrServerEval = (args: ExecutorArgs) =>
  !isServer ? runInBrowser(args) : evaluator(args);
