import { fetchOneEntry } from '@builder.io/sdk-svelte';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
  params,
  url,
}: {
  params: { handle: string };
  url: URL;
}) => {
  const product = await fetch(
    `https://fakestoreapi.com/products/${params.handle}`
  );
  const productData = await product.json();

  const editorial = await fetchOneEntry({
    model: 'product-editorial',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: { urlPath: url.pathname },
  });

  return { product: productData, editorial };
};
