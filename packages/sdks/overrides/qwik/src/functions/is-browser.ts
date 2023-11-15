import { isServer } from '@builder.io/qwik/build';

export function isBrowser(): boolean {
  return !isServer;
}
