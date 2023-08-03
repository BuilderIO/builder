import { _processContentResult } from '@builder.io/sdk-svelte';
import { getProps } from '@e2e/tests';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  const props = await getProps({
    pathname: url.pathname,
    _processContentResult,
  });

  return { props };
}
