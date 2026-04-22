import type {LoaderFunctionArgs} from '@remix-run/node';
import {json, useLoaderData} from '@remix-run/react';
import {
  fetchOneEntry,
  Content,
  isPreviewing,
  type BuilderContent,
} from '@builder.io/sdk-react';
import ProductHeader from '../components/ProductHeader';
import ProductFooter from '../components/ProductFooter';
import ProductInfo, {type Product} from '../components/ProductInfo';

const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const MODEL_NAME = 'product-editorial';

export async function loader({params, request}: LoaderFunctionArgs) {
  console.log('params@@@', params);
  const productRes = await fetch(
    `https://dummyjson.com/products/${params.handle}`,
  );

  if (!productRes.ok) {
    throw new Error(`Failed to fetch product: ${productRes.status}`);
  }

  const product = (await productRes.json()) as Product;

  const url = new URL(request.url);
  const editorialContent = await fetchOneEntry({
    model: MODEL_NAME,
    apiKey: API_KEY,
    userAttributes: {urlPath: url.pathname},
  });

  return json({product, editorialContent});
}

export default function ProductEditorialPage() {
  const {product, editorialContent} = useLoaderData<typeof loader>();

  if (!isPreviewing() && !product && !editorialContent) return <div>404</div>;

  return (
    <div className="content">
      <ProductHeader />
      <ProductInfo product={product} />
      <Content
        model={MODEL_NAME}
        content={editorialContent as BuilderContent}
        apiKey={API_KEY}
      />
      <ProductFooter />
    </div>
  );
}
