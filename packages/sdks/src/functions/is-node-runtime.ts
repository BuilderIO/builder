import { checkIsDefined } from '../helpers/nullable.js';

/**
 * Identifies node runtime
 */
export function isNodeRuntime(): boolean {
  return (
    typeof process !== 'undefined' && checkIsDefined(process?.versions?.node)
  );
}
