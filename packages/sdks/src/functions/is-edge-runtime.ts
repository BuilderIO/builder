import { isBrowser } from './is-browser.js';
import { isNodeRuntime } from './is-node-runtime.js';

/**
 * Identifies edge runtimes (edge, workers, serverless, etc.)
 */
export function isEdgeRuntime(): boolean {
  return !isBrowser() && !isNodeRuntime();
}
