import { getGlobalThis } from './get-global-this.js';

/**
 * The issue is that when building standalone bundle the bundler includes `node-fetch` as
 * inlined content. Instead ind those environments we want to use the global `fetch` function
 * and never include the `node-fetch` package.
 *
 * HACK: This hack is here to make sure that the bundler doesn't include `node-fetch` in browser bundle.
 */
const NODE_FETCH_URL = () => 'node-fetch';

let fetch: typeof global.fetch | undefined = undefined;

export async function getFetch(): Promise<typeof global.fetch> {
  if (fetch) return fetch;
  const globalFetch: typeof global.fetch = getGlobalThis().fetch;

  if (typeof globalFetch === 'undefined' && typeof global !== 'undefined') {
    const nodeFetch = import(NODE_FETCH_URL()).then(
      (d) => d.default
    ) as Promise<typeof global.fetch>;
    return (fetch = (nodeFetch as any).default || nodeFetch);
  }

  return (fetch = (globalFetch as any).default || globalFetch);
}
