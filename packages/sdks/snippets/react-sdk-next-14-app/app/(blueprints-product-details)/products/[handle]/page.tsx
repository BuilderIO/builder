// app/product-editorial/[handle]/page.tsx
import { ProductFooter } from '@/app/components/ProductFooter';
import { ProductHeader } from '@/app/components/ProductHeader';
import { ProductInfo, type Product } from '@/app/components/ProductInfo';
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-react';

const MODEL_NAME = 'product-editorial';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

export default async function ProductEditorialPage({
  params,
}: {
  params: { handle: string };
}) {
  const editorialContent: BuilderContent | null = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    userAttributes: { urlPath: `/products/${params.handle}` },
  });

  const productRes = await fetch(
    `https://fakestoreapi.com/products/${params.handle}`
  );
  const product: Product = await productRes.json();

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
