import {fetchOneEntry} from '@builder.io/sdk-react';
import type {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';

export const loader = async ({params}: LoaderFunctionArgs) => {
  const productDetails = await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': params.handle,
    },
  });

  return {productDetails};
};

export default function ProductDetailsPage() {
  const {productDetails} = useLoaderData<typeof loader>();

  return (
    productDetails && (
      <div className="product-details-page">
        <h1>{productDetails.data?.name}</h1>
        <img src={productDetails.data?.image} alt={productDetails.data?.name} />
        <p>{productDetails.data?.collection.value.data.copy}</p>
        <p>Price: {productDetails.data?.collection.value.data.price}</p>
      </div>
    )
  );
}
