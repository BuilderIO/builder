import { fetchOneEntry } from '@builder.io/sdk-svelte';
import type { PageLoadServer } from './$types';

export const load: PageLoadServer = async () => {
  const content = await fetchOneEntry({
    model: 'homepage',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  });
  return { content };
};
