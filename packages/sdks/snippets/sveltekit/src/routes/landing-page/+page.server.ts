import { fetchOneEntry } from '@builder.io/sdk-svelte';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const links = await fetchOneEntry({
    model: 'navigation-links',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });
  return { links };
};
