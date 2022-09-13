import { getGlobalThis } from './get-global-this.js';

let fetch: typeof global.fetch | undefined = undefined;

export async function getFetch(): Promise<typeof global.fetch> {
  if (fetch) return fetch;
  const globalFetch: typeof global.fetch = getGlobalThis().fetch;

  if (typeof globalFetch === 'undefined' && typeof global !== 'undefined') {
    const nodeFetch = import(`node-fetch`).then((d) => d.default) as Promise<
      typeof global.fetch
    >;
    return (fetch = (nodeFetch as any).default || nodeFetch);
  }

  return (fetch = (globalFetch as any).default || globalFetch);
}
