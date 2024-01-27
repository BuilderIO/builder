import { getBuilderGlobals } from './evaluate/helpers';

export function isServer(): boolean {
  return Boolean(getBuilderGlobals().isServer);
}
