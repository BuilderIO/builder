import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { fetchOneEntry } from '@builder.io/sdk-qwik';

export const useProductDetails = routeLoader$(async ({ params }) => {
  return await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': params.handle,
    },
  });
});

export default component$(() => {
  const productResource = useProductDetails();

  return (
    productResource.value && (
      <div class="product-details">
        <h1>{productResource.value.data?.name}</h1>
        <img
          src={productResource.value.data?.image}
          alt={productResource.value.data?.name}
        />
        <p>{productResource.value.data?.collection.value.data.copy}</p>
        <p>Price: {productResource.value.data?.collection.value.data.price}</p>
      </div>
    )
  );
});
