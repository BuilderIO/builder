import { isBrowser } from '../is-browser.js';
import { evaluator } from './browser-runtime';
import { runInBrowser } from './browser-runtime/browser.js';
const chooseBrowserOrServerEval = (args) =>
  isBrowser() ? runInBrowser(args) : evaluator(args);
export { chooseBrowserOrServerEval };
