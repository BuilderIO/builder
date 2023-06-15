import { processContentResult } from '../../sdk-src';
import { getProps } from '@builder.io/sdks-e2e-tests';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  const props = await getProps({
    pathname: url.pathname,
    processContentResult,
  });

  return { props };
}
