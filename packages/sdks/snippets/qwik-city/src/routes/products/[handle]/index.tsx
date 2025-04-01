import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-qwik';

import ProductFooter from '~/components/ProductFooter';
import ProductHeader from '~/components/ProductHeader';
import { ProductInfo, type Product } from '~/components/ProductInfo';

const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'product-editorial';

export const useEditorial = routeLoader$(async ({ url }) => {
  return fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    userAttributes: { urlPath: url.pathname },
  });
});

export const useProductData = routeLoader$(async ({ params }) => {
  return fetch(`https://fakestoreapi.com/products/${params.handle}`).then(
    (res) => res.json() as Promise<Product>
  );
});

export default component$(() => {
  const editorial = useEditorial();
  const productData = useProductData();

  if (!isPreviewing() && (!editorial.value || !productData.value)) {
    return <div>404</div>;
  }

  return (
    <>
      <ProductHeader />
      <ProductInfo product={productData.value} />
      <Content model={MODEL_NAME} content={editorial.value} apiKey={API_KEY} />
      <ProductFooter />
    </>
  );
});
