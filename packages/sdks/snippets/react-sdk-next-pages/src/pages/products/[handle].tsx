import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { ProductFooter } from '../../components/ProductFooter';
import { ProductHeader } from '../../components/ProductHeader';
import { ProductInfo, type Product } from '../../components/ProductInfo';

const MODEL_NAME = 'product-editorial';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export const getServerSideProps = (async ({ params, resolvedUrl }) => {
  const editorialContent = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    userAttributes: { urlPath: resolvedUrl },
  });

  const productRes = await fetch(
    `https://fakestoreapi.com/products/${params.handle}`
  );
  const productData = await productRes.json();

  return {
    props: {
      editorialContent,
      productData,
    },
  };
}) satisfies GetServerSideProps<{
  editorialContent: BuilderContent | null;
  productData: Product;
}>;

export default function ProductEditorialPage({
  editorialContent,
  productData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!editorialContent && !productData && !isPreviewing()) {
    return <div>404</div>;
  }

  return (
    <div className="content">
      <ProductHeader />
      <ProductInfo product={productData} />
      <Content model={MODEL_NAME} content={editorialContent} apiKey={API_KEY} />
      <ProductFooter />
    </div>
  );
}
