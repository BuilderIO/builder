import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-react';
import type { GetServerSideProps } from 'next';
import { ProductFooter } from '../../components/ProductFooter';
import { ProductHeader } from '../../components/ProductHeader';
import { ProductInfo, type Product } from '../../components/ProductInfo';

const MODEL_NAME = 'product-editorial';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

type ProductPageProps = {
  editorialContent: BuilderContent | null;
  product: Product;
};

export const getServerSideProps: GetServerSideProps<ProductPageProps> =
  (async ({ params, resolvedUrl }) => {
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
        editorialContent: editorialContent || null,
        product: productData,
      },
    };
  }) satisfies GetServerSideProps<ProductPageProps>;

export default function ProductEditorialPage({
  editorialContent,
  product,
}: ProductPageProps) {
  if (!editorialContent && !product && !isPreviewing()) {
    return <div>404</div>;
  }

  return (
    <div className="content">
      <ProductHeader />
      <ProductInfo product={product} />
      <Content model={MODEL_NAME} content={editorialContent} apiKey={API_KEY} />
      <ProductFooter />
    </div>
  );
}
