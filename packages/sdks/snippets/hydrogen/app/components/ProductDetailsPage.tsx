import {fetchOneEntry, type BuilderContent} from '@builder.io/sdk-react';
import type {LoaderFunction} from '@remix-run/node';
import {json, useLoaderData} from '@remix-run/react';

export const productDetailsLoader: LoaderFunction = async ({params}) => {
  const productDetails = await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': params.handle,
    },
  });

  return json({productDetails});
};

export default function ProductDetailsPage() {
  const {productDetails} = useLoaderData<{productDetails: BuilderContent}>();

  return (
    <div className="product-details-page">
      <h1>{productDetails.data?.name}</h1>
      <img src={productDetails.data?.image} alt={productDetails.data?.name} />
      <p>{productDetails.data?.collection.value.data.copy}</p>
      <p>Price: {productDetails.data?.collection.value.data.price}</p>
    </div>
  );
}
