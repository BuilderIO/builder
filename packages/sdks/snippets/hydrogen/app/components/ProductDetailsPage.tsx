import {fetchOneEntry, type BuilderContent} from '@builder.io/sdk-react';
import type {LoaderFunction, LoaderFunctionArgs} from '@remix-run/node';
import {json, useLoaderData} from '@remix-run/react';
import {c} from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

export const productDetailsLoader: LoaderFunction = async ({
  params,
}: LoaderFunctionArgs) => {
  const handle = params.handle;

  const productDetails = await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': handle,
    },
  });

  return json({productDetails});
};

export default function ProductDetailsPage() {
  const {productDetails} = useLoaderData<{productDetails: BuilderContent}>();

  return (
    <>
      {productDetails && (
        <div className="product-details-page">
          <h1>{productDetails.data?.name}</h1>
          <img
            src={productDetails.data?.image}
            alt={productDetails.data?.name}
            width="400"
            height="500"
          />
          <p>{productDetails?.data?.collection.value.data.copy}</p>
          <p>Price: {productDetails?.data?.collection.value.data.price}</p>
        </div>
      )}
    </>
  );
}
