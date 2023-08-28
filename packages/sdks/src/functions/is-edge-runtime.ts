import { isBrowser } from './is-browser.js';

/**
 * Identifies edge runtimes (edge, workers, serverless, etc.)
 */
export function isEdgeRuntime(): boolean {
  const hasNode = () =>
    typeof process !== 'undefined' && process?.versions?.node;

  return !isBrowser() && !hasNode();
}
