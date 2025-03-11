import { fetchOneEntry } from '@builder.io/sdk-react';
import Image from 'next/image';

export default async function ProductDetailsPage({
  params,
}: {
  params: { handle: string };
}) {
  const productDetails = await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': params.handle,
    },
  });

  return (
    productDetails && (
      <div className="product-details">
        <h1>{productDetails.data?.name}</h1>
        <Image
          src={`${productDetails.data?.image}`}
          alt={productDetails.data?.name}
          priority={true}
        />
        <p>{productDetails.data?.collection.value.data.copy}</p>
        <p>Price: {productDetails.data?.collection.value.data.price}</p>
      </div>
    )
  );
}
