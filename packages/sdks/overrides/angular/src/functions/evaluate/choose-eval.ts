import { runInBrowser } from './browser-runtime/browser.js';

/** we only have a browser runtime bundle for now */
export const chooseBrowserOrServerEval = runInBrowser;
