import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Image from 'next/image';

export const getServerSideProps = (async ({ params }) => {
  const productDetails = await fetchOneEntry({
    model: 'product-details',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    query: {
      'data.handle': params?.handle,
    },
  });

  return { props: { productDetails } };
}) satisfies GetServerSideProps<{
  productDetails: BuilderContent | null;
}>;

export default function ProductCategoryPage({
  productDetails,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    productDetails && (
      <div className="product-details-page">
        <h1>{productDetails.data?.name}</h1>
        <Image
          src={productDetails.data?.image}
          alt={productDetails.data?.name}
          priority={true}
        />
        <p>{productDetails.data?.collection.value.data.copy}</p>
        <p>Price: {productDetails.data?.collection.value.data.price}</p>
      </div>
    )
  );
}
