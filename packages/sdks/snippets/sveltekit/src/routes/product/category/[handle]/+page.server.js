import { fetchOneEntry } from '@builder.io/sdk-svelte';

export const load = async ({ params }) => {
  const handle = params.handle; 
 
  const data = await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': handle,
    },
  });
  console.log('data', data);
  return { productDetails: data };
};
