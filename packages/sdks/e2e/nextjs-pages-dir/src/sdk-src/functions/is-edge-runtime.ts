import { isBrowser } from './is-browser';
import { isNodeRuntime } from './is-node-runtime';

/**
 * Identifies edge runtimes (edge, workers, serverless, etc.)
 */
export function isEdgeRuntime(): boolean {
  return !isBrowser() && !isNodeRuntime();
}
