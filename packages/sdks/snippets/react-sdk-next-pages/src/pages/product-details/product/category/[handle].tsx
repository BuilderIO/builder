import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-react';
import Image from 'next/image';

export default function ProductCategoryPage({
  productDetails,
}: {
  productDetails: BuilderContent;
}) {
  return (
    <div className="product-details">
      <h1>{productDetails.data?.name}</h1>
      <Image
        src={productDetails.data?.image}
        alt={productDetails.data?.name}
        width="400"
        height="500"
        priority={true}
      />
      <p>{productDetails.data?.collection.value.data.copy}</p>
      <p>Price: {productDetails.data?.collection.value.data.price}</p>
    </div>
  );
}

export const getServerSideProps = async (context: {
  params: { handle: string };
}) => {
  const { handle } = context.params;

  const productDetails = await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': handle,
    },
  });

  return {
    props: {
      productDetails,
    },
  };
};
