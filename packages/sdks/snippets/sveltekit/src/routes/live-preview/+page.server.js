import { fetchOneEntry } from '@builder.io/sdk-svelte';

export const load = async ({ url }) => {
  const slug = url.pathname;

  const content = await fetchOneEntry({
    model: 'blog-data',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: {
      urlPath: slug,
    },
  });

  return {
    content,
  };
};
