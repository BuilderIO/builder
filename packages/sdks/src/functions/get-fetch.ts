import { getGlobalThis } from './get-global-this.js';

export async function getFetch(): Promise<typeof global.fetch> {
  const globalFetch: typeof global.fetch = getGlobalThis().fetch;

  if (typeof globalFetch === 'undefined' && typeof global !== 'undefined') {
    const nodeFetch = import('node-fetch').then((d) => d.default) as Promise<
      typeof global.fetch
    >;
    return (nodeFetch as any).default || nodeFetch;
  }

  return (globalFetch as any).default || globalFetch;
}
