import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { fetchOneEntry } from '@builder.io/sdk-qwik';

export const useProductDetails = routeLoader$(async (requestEvent) => {
  const { handle } = requestEvent.params;
  const data = await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': handle,
    },
  });
  return data;
});

export default component$(() => {
  const productResource = useProductDetails();

  const productDetails = productResource.value;

  return (
    <>
      {productDetails ? (
        <>
          <h1>{productDetails.data?.name}</h1>
          <img
            src={productDetails.data?.image}
            alt={productDetails.data?.name}
            width="400"
            height="500"
          />
          <p>{productDetails.data?.collection.value.data.copy}</p>
          <p>Price: {productDetails.data?.collection.value.data.price}</p>
        </>
      ) : (
        <p>Loading product details...</p>
      )}
    </>
  );
});
