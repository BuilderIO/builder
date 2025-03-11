import { fetchOneEntry } from '@builder.io/sdk-svelte';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const productDetails = await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': params.handle,
    },
  });

  return { productDetails };
};
