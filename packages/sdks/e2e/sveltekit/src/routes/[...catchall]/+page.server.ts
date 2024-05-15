import { _processContentResult } from '@builder.io/sdk-svelte';
import { getProps } from '@sdk/tests';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  const props = await getProps({
    pathname: url.pathname,
    _processContentResult,
  });

  return { props };
}
