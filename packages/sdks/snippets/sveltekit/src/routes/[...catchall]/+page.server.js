/**
 * Quickstart snippet
 * snippets/sveltekit/src/routes/[...catchall]/+page.server.js
 */
import { fetchOneEntry, getBuilderSearchParams } from '@builder.io/sdk-svelte';

/** @type {import('../$types').PageServerLoad} */
export async function load(event) {
  // fetch your Builder content
  const content = await fetchOneEntry({
    model: 'page',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b', // TO DO: Add your Public API Key
    options: getBuilderSearchParams(event.url.searchParams),
    userAttributes: {
      urlPath: event.url.pathname || '/',
    },
  });
  return { content };
}
