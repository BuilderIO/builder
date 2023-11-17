import { checkIsDefined } from '../helpers/nullable';

/**
 * Identifies node runtime
 */
export function isNodeRuntime(): boolean {
  return (
    typeof process !== 'undefined' && checkIsDefined(process?.versions?.node)
  );
}
