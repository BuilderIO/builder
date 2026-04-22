import { fetchOneEntry } from '@builder.io/sdk-svelte';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const productHero = await fetchOneEntry({
    model: 'collection-hero',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: { urlPath: url.pathname },
  });
  return { productHero };
};
