/**
 * https://www.builder.io/c/docs/integrate-section-building
 * https://www.builder.io/c/blueprints/announcement-bar
 * src/routes/announcements/[...catchall]/+page.server.js
 */
import { fetchOneEntry, getBuilderSearchParams } from '@builder.io/sdk-svelte';

/** @type {import('../../$types').PageServerLoad} */
export async function load(event) {
  // fetch your Builder content
  const content = await fetchOneEntry({
    model: 'announcement-bar',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b', // TO DO: Add your Public API Key
    options: getBuilderSearchParams(event.url.searchParams),
    userAttributes: {
      urlPath: event.url.pathname || '/',
    },
  });
  return { content };
}
