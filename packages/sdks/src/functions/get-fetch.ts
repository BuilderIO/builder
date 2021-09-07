import { getGlobalThis } from './get-global-this';

export function getFetch(): typeof global.fetch {
  let fetch: typeof global.fetch = getGlobalThis().fetch;

  if (typeof fetch === 'undefined' && typeof global !== 'undefined') {
    // Reference require without bundlers trying to bundle it
    const _require = eval('require');
    fetch = _require('node-fetch');
  }

  return fetch;
}
