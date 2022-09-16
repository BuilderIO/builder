import { getGlobalThis } from './get-global-this.js';

export async function getFetch(): Promise<typeof global.fetch> {
  const globalFetch: typeof global.fetch = getGlobalThis().fetch;

  if (typeof globalFetch === 'undefined' && typeof global !== 'undefined') {
    throw new Error(
      '`fetch()` not found, ensure you have it as part of your polyfills.'
    );
  }

  return (globalFetch as any).default || globalFetch;
}
