import { getGlobalThis } from './get-global-this.js';

/**
 * `node-fetch` is a polyfill for fetch.
 *
 * There are two environments:
 * 1. Node - in which case we may need to fetch `node-fetch` and use it.
 * 2. Native (browser/deno/edge-workers) - in which case we can use the native
 *   `fetch` function.
 *
 * PROBLEM:
 * If we write `import('node-fetch')` the bundler will always bundle `node-fetch`
 * because it does not know if it is needed. This is not what we want, because:
 * - in native environments will now get `fetch` and the `node-fetch` polyfill is
 *   not needed.
 * - in Node environment bundling the `node-fetch` polyfill provides no benefit as
 *   we can just `require('node-fetch')` it.
 *
 * HACK: This hack is here to make sure that the bundler doesn't include `node-fetch`
 * in single-file-bundle.
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
